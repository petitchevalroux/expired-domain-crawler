"use strict";

const path = require("path"),
    redis = require("redis"),
    redisClient = redis.createClient(),
    FifoRepository = require(path.join(__dirname, "..", "repositories",
        "fifo-redis")),
    UrlRepository = require(path.join(__dirname, "..", "repositories",
        "url-redis")),
    Crawler = require(path.join(__dirname, "..", "crawler")),
    FilterStream = require(path.join(__dirname, "..", "streams",
        "url-filter")),
    HttpDownloadStream = require(path.join(__dirname, "..", "streams",
        "download")),
    urlRepository = new UrlRepository({
        redisClient: redisClient
    }),
    crawler = new Crawler({
        fifoRepository: new FifoRepository({
            redisClient: redisClient
        }),
        filterStream: new FilterStream({
            urlRepository: urlRepository
        }),
        downloadStream: new HttpDownloadStream({
            urlRepository: urlRepository
        })
    }),
    Promise = require("bluebird");
Promise
    .all([crawler.addUrl("http://dev.petitchevalroux.net/index.html")])
    .then(() => {
        return crawler.run();
    });
