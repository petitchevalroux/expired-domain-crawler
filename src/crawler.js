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
        this
            .getUnfilteredUrlsFifo()
            .then((fifo) => {
                return fifo.write(url);
            });
    }

    run() {
        const self = this;
        Promise.all([
            this.getUnfilteredUrlsFifo,
            this.getFilteredUrlsFifo
        ])
            .then((fifos) => {
                fifos[0]
                    .pipe(self.filterStream)
                    .pipe(fifos[1])
                    .pipe(self.downloadStream)
                    .pipe(self.extractStream)
                    .pipe(fifos[0]);
            });
    }

    getUnfilteredUrlsFifo() {
        return this.fifoRepository.get("urls:unfiltered");
    }

    getFilteredUrlsFifo() {
        return this.fifoRepository.get("urls:filtered");
    }
}

module.exports = Crawler;
