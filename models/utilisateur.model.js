const { sequelize, DataTypes } = require("./database");
const bcrypt = require("bcryptjs");

const Utilisateur = sequelize.define(
  "Utilisateur",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nom: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    prenom: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // Ajout d'une contrainte d'unicité pour éviter les doublons d'email
      validate: {
        isEmail: true, // Validation automatique du format d'email par Sequelize
      },
    },
    motDePasse: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    telephone: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isNumeric: true, // Valider que le téléphone est bien un nombre
        len: [10, 10], // Le numéro de téléphone doit avoir exactement 10 chiffres
      },
    },
  },
  {
    timestamps: true, // Pour les colonnes 'createdAt' et 'updatedAt'
  }
);

// Hook Sequelize pour hacher le mot de passe avant de sauvegarder
Utilisateur.addHook("beforeSave", async (utilisateur) => {
  if (utilisateur.changed("motDePasse")) {
    const salt = await bcrypt.genSalt(10); // Générer le sel
    utilisateur.motDePasse = await bcrypt.hash(utilisateur.motDePasse, salt); // Hacher le mot de passe
  }
});

module.exports = Utilisateur;
