"use strict";
var path = require("path");
var nconf = require("nconf");
nconf
    .argv()
    .env()
    .file(path.join(__dirname, "..", "..", "config", "config.json"));
module.exports = nconf;
