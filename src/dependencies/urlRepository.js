"use strict";
const path = require("path"),
    di = require(path.join(__dirname, "..", "di")),
    UrlRepository = require(path.join(
        __dirname,
        "..",
        "repositories",
        "url-redis"));
module.exports = new UrlRepository({
    redisClient: di.redis
});
