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
    ExtractorStream = require(path.join(__dirname, "..", "streams",
        "extractor")),
    crawler = new Crawler({
        fifoRepository: new FifoRepository({
            redisClient: redisClient
        }),
        filterStream: new FilterStream({
            urlRepository: urlRepository
        }),
        downloadStream: new HttpDownloadStream({
            urlRepository: urlRepository
        }),
        extractStream: new ExtractorStream()
    }),
    Promise = require("bluebird");
Promise
    .all([crawler.addUrl("http://dev.petitchevalroux.net/index.html")])
    .then(() => {
        return crawler.run();
    });
