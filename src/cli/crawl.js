"use strict";

const path = require("path"),
    di = require(path.join(__dirname, "..", "di")),
    Crawler = require(path.join(__dirname, "..", "crawler")),
    FilterStream = require(path.join(__dirname, "..", "streams",
        "url-filter")),
    ExtractorStream = require(path.join(__dirname, "..", "streams",
        "extractor")),
    Promise = require("bluebird"),
    nconf = require("nconf"),
    crawler = new Crawler({
        log: di.log,
        fifoRepository: di.fifoRepository,
        filterStream: new FilterStream({
            urlRepository: di.urlRepository,
            domainRepository: di.domainRepository
        }),
        downloadStream: di.downloadStream,
        extractStream: new ExtractorStream()
    });

module.exports = new Promise
    .resolve(crawler)
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
