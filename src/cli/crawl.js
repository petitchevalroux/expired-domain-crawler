"use strict";

const path = require("path"),
    di = require(path.join(__dirname, "..", "di")),
    redisClient = di.redis,
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
    fifoRepository = new FifoRepository({
        redisClient: redisClient
    }),
    HttpErrorStream = require(path.join(__dirname, "..", "streams",
        "http-error")),
    Promise = require("bluebird"),
    httpErrorStream = new HttpErrorStream({
        domainRepository: di.domainRepository,
        apiClient: di.godaddy
    }),
    nconf = require("nconf");

httpErrorStream.on("error", (error) => {
    di.log.error(error);
});


module.exports = fifoRepository.get("http:error")
    .then((httpErrorFifoStream) => {
        httpErrorFifoStream.pipe(httpErrorStream);
        return new Crawler({
            log: di.log,
            fifoRepository: fifoRepository,
            filterStream: new FilterStream({
                urlRepository: urlRepository,
                domainRepository: di.domainRepository
            }),
            downloadStream: new HttpDownloadStream({
                urlRepository: urlRepository,
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
