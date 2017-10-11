"use strict";

const Promise = require("bluebird");

class Crawler {
    constructor(options) {
        this.fifoRepository = options.fifoRepository;
        this.filterStream = options.filterStream;
        this.downloadStream = options.downloadStream;
        this.extractStream = options.extractStream;
        this.log = options.log;
        const prefixes = ["filtered", "downloaded", "extracted"];
        const self = this;
        [this.filterStream, this.downloadStream, this.extractStream]
            .forEach((stream, index) => {
                stream.on("data", (data) => {
                    self.log.verbose("%s: data out %j",
                        prefixes[
                            index], data);
                });
                stream.on("error", (error) => {
                    self.log.error("%s: %s", prefixes[index],
                        error.toString());
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
        return Promise.resolve(this.fifoRepository.get("urls:tofilter"));
    }

    getUrlsToDownloadFifo() {
        return Promise.resolve(this.fifoRepository.get("urls:todownload"));
    }

    getContentToExtractFifo() {
        return Promise.resolve(this.fifoRepository.get("content:toextract"));
    }
}

module.exports = Crawler;
