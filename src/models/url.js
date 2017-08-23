"use strict";
const Promise = require("bluebird");
class UrlModel {
    constructor(value) {
        this.id = value.id;
        this.url = value.url;
        this.lastDownloaded = value.lastDownloaded ? value.lastDownloaded :
            0;
    }

    isToDownload() {
        if (!this.lastDownloaded) {
            return Promise.resolve(true);
        }
        return Promise.resolve(false);
    }
}

module.exports = UrlModel;
