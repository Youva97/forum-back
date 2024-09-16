require("dotenv").config();
const express = require("express");
const session = require("express-session");

const app = express();

app.use(
  session({
    secret: "monSecretSuperSecurise",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // HTTP local pour tests
  })
);

const initMiddlewares = require("./services/middlewares.service");
const initControllers = require("./services/controllers.service");
const initServer = require("./services/server.service");

async function init() {
  // Appeler initDatabase seulement si nécessaire
  if (process.env.RUN_DATABASE_INIT) {
    const initDatabase = require("./services/database.service");
    await initDatabase();
  }

  initMiddlewares(app); // Initialisation des middlewares
  initControllers(app); // Initialisation des contrôleurs
  initServer(app); // Démarrage du serveur
}

init();
