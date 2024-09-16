const { sequelize } = require("../models/index.js");

async function initDatabase() {
  await sequelize.sync({ alter: true });
  console.log("Connection has been established successfully.");
}

module.exports = initDatabase;
