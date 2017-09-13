"use strict";
const path = require("path"),
    di = require(path.join(__dirname, "..", "di")),
    DomainRepository = require(path.join(
        __dirname,
        "..",
        "repositories",
        "domain-redis"));
module.exports = new DomainRepository({
    redisClient: di.redis
});
