const express = require('express'),
      app = express(),
      bodyParser = require("body-parser"),
      api = require('./api/api'),
      auth = require('./auth/routes');

// Middlewares setup
require('./middlewares')(app);

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

// Routes
app.use('/api', api);
app.use('/auth', auth);

// Export the app and the serverless function
module.exports = app;