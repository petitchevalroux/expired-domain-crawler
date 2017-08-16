"use strict";
const Promise = require("bluebird");
class UrlModel {
    constructor(value) {
        this.id = value.id;
        this.url = value.url;
        this.lastDownloaded = value.lastDownloaded;
    }

    isToDownload() {
        if (!this.lastDownloaded) {
            return Promise.resolve(true);
        }
        return Promise.resolve(false);
    }

    setLastDownloaded(date) {
        this.lastDownloaded = Math.round(date.getTime() / 1000);
        return Promise.resolve(this);
    }
}

module.exports = UrlModel;
