const { Utilisateur } = require("../models");
const bcrypt = require("bcryptjs");

// Quand la connexion est effectuer sur le site on pourras mettre le token pour valider la session de l'utilisateur
const jwtCrypto = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

module.exports = function (app) {
  const routeUtilisateur = "/utilisateurs";

  // Validation de l'email
  app.get(`${routeUtilisateur}/validation-email`, async function (req, res) {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({
        data: null,
        message: "Veuillez fournir une adresse email.",
        error: true,
      });
    }
    try {
      const utilisateur = await Utilisateur.findOne({ where: { email } });
      if (utilisateur) {
        return res.status(409).json({
          data: null,
          message: "Vous avez déjà un compte associé à cette adresse mail.",
          error: true,
        });
      } else {
        return res.status(202).json({
          data: null,
          message: "Votre email est valide.",
          error: false,
        });
      }
    } catch (error) {
      return res.status(500).json({
        data: null,
        message: "Une erreur est survenue lors de la validation de l'email.",
        error: error.message,
      });
    }
  });

  // inscription de l'utilisateur
  app.post(`${routeUtilisateur}/inscription`, async function (req, res) {
    try {
      // Étape 1 : Validation des données reçues
      const { nom, prenom, telephone, email, motDePasse } = req.body;

      if (!nom || !prenom || !telephone || !email || !motDePasse) {
        return res.json({
          data: null,
          error: "Tous les champs sont requis",
        });
      }

      // Étape 2 : Validation du format des données
      const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
      const phonePattern = /^[0-9]{10}$/;

      if (!emailPattern.test(email)) {
        return res.status(400).json({
          data: null,
          error: "L'email est invalide",
        });
      }

      if (!phonePattern.test(telephone)) {
        return res.status(400).json({
          data: null,
          error: "Le numéro de téléphone est invalide",
        });
      }

      // Étape 3 : Création de l'utilisateur dans la base de données
      const utilisateur = await Utilisateur.create({
        nom,
        prenom,
        telephone,
        email,
        motDePasse,
      });

      // Étape 4 : Réponse en cas de succès
      return res.status(201).json({
        data: utilisateur,
        error: null,
      });
    } catch (error) {
      // Étape 5 : Gestion des erreurs spécifiques
      if (error.name === "SequelizeUniqueConstraintError") {
        return res.status(400).json({
          data: null,
          error: "Cet email est déjà utilisé",
        });
      }

      // Autres erreurs de la base de données ou erreurs inattendues
      return res.status(500).json({
        data: null,
        error: "Une erreur interne est survenue. Veuillez réessayer plus tard.",
      });
    }
  });

  // rafraichissement du token
  app.post(`${routeUtilisateur}/refresh-token`, async function (req, res) {});

  // Connexion et vérification de email et mot de passe
  app.post(`${routeUtilisateur}/connexion`, async function (req, res) {
    console.log("Requête reçue :", req.body);
    const { email, motDePasse } = req.body;

    // Vérification de l'email et du mot de passe
    if (!email || !motDePasse) {
      return res.json({
        data: null,
        message: "Veuillez fournir une adresse email et un mot de passe.",
        error: true,
      });
    }

    try {
      // Recherche de l'utilisateur par email
      const utilisateur = await Utilisateur.findOne({ where: { email } });

      if (!utilisateur) {
        // Si l'utilisateur n'est pas trouvé
        return res.json({
          data: null,
          message: "Email ou mot de passe incorrect.",
          error: true,
        });
      }

      const motDePasseValide = bcrypt.compareSync(
        motDePasse,
        utilisateur.motDePasse
      );

      if (!motDePasseValide) {
        console.log("Mot de passe incorrect.");
        return res.json({
          data: null,
          message: "Email ou mot de passe incorrect.",
          error: true,
        });
      }

      // Génération du token JWT
      const token = jwtCrypto.sign(
        {
          id: utilisateur.id,
          email: utilisateur.email,
          nom: utilisateur.nom,
          prenom: utilisateur.prenom,
        },
        JWT_SECRET, // Clé secrète définie dans ton fichier .env ou directement dans ton code
        { expiresIn: "1h" } // Le token expire dans 1 heure
      );

      return res.status(202).json({
        data: {
          token, // Le token sera envoyé au frontend pour l'authentification
          utilisateur: {
            id: utilisateur.id,
            email: utilisateur.email,
            nom: utilisateur.nom,
            prenom: utilisateur.prenom,
          },
        },
        message: "Connexion réussie.",
        error: false,
      });
    } catch (error) {
      return res.status(500).json({
        data: null,
        message: "Une erreur est survenue lors de la connexion.",
        error: error.message,
      });
    }
  });

  // Deconnexion de l'utilisateur en detruisant sa session
  app.post(`${routeUtilisateur}/deconnexion`, async function (req, res) {
    try {
      // Vérifie si une session existe
      if (req.session) {
        // Détruit la session
        req.session.destroy(function (err) {
          if (err) {
            return res.status(500).json({
              message: "Erreur lors de la déconnexion.",
              error: err.message,
            });
          } else {
            return res.status(200).json({
              message: "Déconnexion réussie. La session a été détruite.",
              error: false,
            });
          }
        });
      } else {
        // Aucune session active
        return res.status(400).json({
          message: "Pas de session active à détruire.",
          error: true,
        });
      }
    } catch (error) {
      return res.status(500).json({
        message: "Une erreur est survenue lors de la déconnexion.",
        error: error.message,
      });
    }
  });

  // Modification du mot de passe
  app.put(
    `${routeUtilisateur}/modifier-mot-de-passe`,
    async function (req, res) {}
  );

  // Changement du mot de passe
  app.post(
    `${routeUtilisateur}/nouveau-mot-de-passe`,
    async function (req, res) {}
  );

  // Modification de l'utilisateur
  app.put(`${routeUtilisateur}/modifier`, async function (req, res) {
    try {
      const utilisateur = await Utilisateur.findByPk(req.params.id);
      if (!utilisateur) {
        res.json({ data: null, error: "not_found" });
      } else {
        await utilisateur.update(req.body, { where: { id: req.params.id } });
        res.json({ data: utilisateur, error: null });
      }
    } catch (error) {
      return res.json({ data: null, error: null });
    }
  });

  // Récupération de tous les utilisateurs
  app.get(`${routeUtilisateur}/tous`, async function (req, res) {
    try {
      const utilisateur = await Utilisateur.findAll();
      res.json({ data: utilisateur, error: null });
    } catch (error) {
      res.json({ data: null, error: error.message });
    }
  });

  // Récupération d'un utilisateur avec son identifiant
  app.get(`${routeUtilisateur}/:id`, async function (req, res) {
    try {
      const utilisateur = await Utilisateur.findByPk(req.params.id, {
        attributes: { exclude: ["motDePasse"] }, // Exclure le mot de passe de la requête
      });
      if (!utilisateur) {
        return res
          .status(404)
          .json({ data: null, error: "Utilisateur non trouvé" });
      }
      return res.json({ data: utilisateur, error: null });
    } catch (error) {
      return res.status(500).json({ data: null, error: error.message });
    }
  });

  app.delete(`${routeUtilisateur}/:id`, async function (req, res) {});
};
