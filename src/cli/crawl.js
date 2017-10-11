"use strict";

const path = require("path"),
    di = require(path.join(__dirname, "..", "di")),
    redisClient = di.redis,
    FifoRepository = require(path.join(__dirname, "..", "repositories",
        "fifo-redis")),
    Crawler = require(path.join(__dirname, "..", "crawler")),
    FilterStream = require(path.join(__dirname, "..", "streams",
        "url-filter")),
    HttpDownloadStream = require(path.join(__dirname, "..", "streams",
        "download")),
    ExtractorStream = require(path.join(__dirname, "..", "streams",
        "extractor")),
    fifoRepository = new FifoRepository({
        redisClient: redisClient
    }),
    Promise = require("bluebird"),
    nconf = require("nconf");

module.exports = fifoRepository.get("http:error")
    .then((httpErrorFifoStream) => {
        httpErrorFifoStream.pipe(di.httpErrorStream);
        return new Crawler({
            log: di.log,
            fifoRepository: fifoRepository,
            filterStream: new FilterStream({
                urlRepository: di.urlRepository,
                domainRepository: di.domainRepository
            }),
            downloadStream: new HttpDownloadStream({
                urlRepository: di.urlRepository,
                httpErrorStream: httpErrorFifoStream
            }),
            extractStream: new ExtractorStream()
        });
    })
    .then((crawler) => {
        let urls = nconf.get("url");
        if (!Array.isArray(urls)) {
            if (urls) {
                urls = [urls];
            } else {
                urls = [];
            }
        }
        if (!urls.length) {
            return crawler.run();
        }
        return Promise
            .all(urls.map(url => {
                return crawler.addUrl(url);
            }))
            .then(() => {
                return crawler.run();
            });
    });
