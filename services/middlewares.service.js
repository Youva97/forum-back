// services/middlewares.service.js
const cors = require("cors");
const bodyParser = require("body-parser");
const express = require("express");
const path = require("path");
const { Eta } = require("eta");

function initMiddlewares(app) {
  app.use(cors());

  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

  app.use(express.static(path.join(__dirname, "../assets")));

  let eta = new Eta({ views: path.join(__dirname, "../views"), cache: false });
  app.use(function (req, res, next) {
    res.render = function (view, data) {
      res.send(eta.render(view, data));
    };
    next();
  });
}

module.exports = initMiddlewares;
