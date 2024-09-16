const jwt = require("jsonwebtoken");

module.exports = async function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  console.log("Authorization header:", authHeader); // Log pour vérifier l'en-tête Authorization

  const token = authHeader && authHeader.split(" ")[1];
  console.log("Token extrait:", token);

  if (!token) {
    return res
      .status(401)
      .json({ message: "Accès non autorisé. Token manquant." });
  }

  jwt.verify(token, JWT_SECRET, (err, utilisateur) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Le token a expiré." });
      }
      return res.status(403).json({ message: "Token invalide." });
    }

    // Si tout est OK, attache l'utilisateur à la requête
    req.utilisateur = utilisateur;
    next();
  });
};
