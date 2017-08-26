"use strict";
const path = require("path"),
    di = require(path.join(__dirname, "..", "di")),
    config = di.config.get("godaddy"),
    godaddy = require("godaddy");
module.exports = godaddy(config);
