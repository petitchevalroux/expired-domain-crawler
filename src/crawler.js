"use strict";

const Promise = require("bluebird"),
    path = require("path"),
    logger = require(path.join(__dirname, "logger"));

class Crawler {
    constructor(options) {
        this.fifoRepository = options.fifoRepository;
        this.filterStream = options.filterStream;
        this.downloadStream = options.downloadStream;
        this.extractStream = options.extractStream;
        const prefixes = ["filtered", "downloaded", "extracted"];
        [this.filterStream, this.downloadStream, this.extractStream]
            .forEach((stream, index) => {
                stream.on("data", (data) => {
                    logger.verbose("%s: data out %j", prefixes[
                        index], data);
                });
                stream.on("error", (error) => {
                    logger.error("%s: %j", prefixes[index],
                        error);
                });
            });
    }

    addUrl(url) {
        return this
            .getUrlsToFilterFifo()
            .then((fifo) => {
                return new Promise((resolve, reject) => {
                    fifo.write(url, (err) => {
                        if (err) {
                            return reject(err);
                        }
                        resolve(url);
                    });
                });
            });
    }

    run() {
        const self = this;
        return Promise.all([
            this.getUrlsToFilterFifo(),
            this.getUrlsToDownloadFifo(),
            this.getContentToExtractFifo()
        ])
            .then((fifos) => {
                fifos[0]
                    .pipe(self.filterStream)
                    .pipe(fifos[1])
                    .pipe(self.downloadStream)
                    .pipe(fifos[2])
                    .pipe(self.extractStream)
                    .pipe(fifos[0]);
                return;
            });
    }

    getUrlsToFilterFifo() {
        return this.fifoRepository.get("urls:tofilter");
    }

    getUrlsToDownloadFifo() {
        return this.fifoRepository.get("urls:todownload");
    }

    getContentToExtractFifo() {
        return this.fifoRepository.get("content:toextract");
    }
}

module.exports = Crawler;
