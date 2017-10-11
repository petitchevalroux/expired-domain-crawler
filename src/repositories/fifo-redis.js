"use strict";

const path = require("path"),
    Fifo = require(path.join(__dirname, "fifo")),
    RedisStreamList = require("@petitchevalroux/redis-stream-list"),
    FifoStreamList = RedisStreamList.Fifo;
class FifoRedis extends Fifo {
    constructor(options) {
        super(options);
        this.redisClient = options.redisClient;
    }
    create(name) {
        return new FifoStreamList({
            readableObjectMode: true,
            writableObjectMode: true,
            redisClient: this.redisClient,
            listKey: name
        });
    }
}

module.exports = FifoRedis;
