const fs = require("fs");
const path = require("path");
const { sequelize } = require("../models/index.js");

async function initDatabase() {
  try {
    let files = fs.readdirSync(path.join(__dirname, "../models"));
    let alter = false;
    let lastUpdateModels;

    try {
      lastUpdateModels = JSON.parse(
        fs.readFileSync(path.join(__dirname, "../lastUpdateModels.json"))
      );
    } catch (err) {
      lastUpdateModels = {};
    }
    for (let file of files) {
      if (file.endsWith(".model.js")) {
        let stats = fs.statSync(path.join(__dirname, "../models", file));
        if (lastUpdateModels[file] && lastUpdateModels[file] < stats.mtime) {
          alter = true;
        }
        lastUpdateModels[file] = stats.mtime;
      }
    }

    fs.writeFileSync(
      path.join(__dirname, "../lastUpdateModels.json"),
      JSON.stringify(lastUpdateModels, null, 4)
    );
    await sequelize.sync({ alter: true });
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    process.exit(1);
  }
}

module.exports = initDatabase;
