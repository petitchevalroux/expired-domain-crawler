"use strict";
var path = require("path");
var di = require(path.join(__dirname, "..", "di"));
var winston = require("winston");
var config = di.config.get("log");
if (config && config.level) {
    winston.level = config.level;
}
module.exports = winston;
