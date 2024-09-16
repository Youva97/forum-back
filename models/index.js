const { sequelize } = require("./database.js");
const Utilisateur = require("./utilisateur.model.js");

module.exports = {
  sequelize,
  Utilisateur,
};
