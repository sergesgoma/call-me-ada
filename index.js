"use strict";

// Imports dependencies and set up http server
const express = require("express"),
  bodyParser = require("body-parser"),
  app = express().use(bodyParser.json()), // creates express http server
  router = require("./messenger-webhook/router");

require("dotenv").config({ path: "./.env" });

// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => console.log("webhook is listening"));
app.use(router);
