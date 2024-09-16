function initServer(app) {
  app.listen(process.env.PORT, function () {
    console.log("listening on port " + process.env.PORT);
  });
}

module.exports = initServer;
