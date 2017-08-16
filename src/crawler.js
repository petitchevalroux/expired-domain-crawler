"use strict";

const Promise = require("bluebird");

class Crawler {
    constructor(options) {
        this.fifoRepository = options.fifoRepository;
        this.filterStream = options.filterStream;
        this.downloadStream = options.downloadStream;
        //this.downloadStream.on("data",(data)=>{console.log(data)});
        this.extractStream = options.extractStream;
    }

    addUrl(url) {
        return this
            .getUnfilteredUrlsFifo()
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
            this.getUnfilteredUrlsFifo(),
            this.getFilteredUrlsFifo()
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

    getUnfilteredUrlsFifo() {
        return this.fifoRepository.get("urls:unfiltered");
    }

    getFilteredUrlsFifo() {
        return this.fifoRepository.get("urls:filtered");
    }
}

module.exports = Crawler;
