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
    DomainRepository = require(path.join(__dirname, "..", "repositories",
        "domain-redis")),
    domainRepository = new DomainRepository({
        redisClient: redisClient
    }),
    httpErrorStream = new HttpErrorStream({
        domainRepository: domainRepository,
        apiClient: di.godaddy
    });

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
                domainRepository: domainRepository
            }),
            downloadStream: new HttpDownloadStream({
                urlRepository: urlRepository,
                httpErrorStream: httpErrorFifoStream
            }),
            extractStream: new ExtractorStream()
        });
    })
    .then((crawler) => {
        return Promise
            .all([crawler.addUrl("http://www.monde-du-velo.com/")])
            .then(() => {
                return crawler.run();
            });
    });
