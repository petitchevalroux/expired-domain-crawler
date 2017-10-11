"use strict";
const path = require("path"),
    di = require(path.join(__dirname, "..", "di")),
    FifoRepository = require(path.join(__dirname, "..", "repositories",
        "fifo-redis"));
module.exports = new FifoRepository({
    redisClient: di.redis
});
