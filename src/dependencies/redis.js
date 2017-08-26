"use strict";
const path = require("path"),
    di = require(path.join(__dirname, "..", "di")),
    config = di.config.get("redis"),
    redis = require("redis"),
    client = redis.createClient(config);
client.on("error", function(e) {
    di.log.error(e);
});
module.exports = client;
