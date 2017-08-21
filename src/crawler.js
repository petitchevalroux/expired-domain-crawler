"use strict";

const Promise = require("bluebird");

class Crawler {
    constructor(options) {
        this.fifoRepository = options.fifoRepository;
        this.filterStream = options.filterStream;
        this.downloadStream = options.downloadStream;
        this.extractStream = options.extractStream;
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
            this.getUrlsToDownloadFifo()
        ])
            .then((fifos) => {
                fifos[0]
                    .pipe(self.filterStream)
                    .pipe(fifos[1])
                    .pipe(self.downloadStream)
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
}

module.exports = Crawler;
