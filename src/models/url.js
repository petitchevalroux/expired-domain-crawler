"use strict";
const Promise = require("bluebird");
class UrlModel {
    constructor(value) {
        this.id = value.id;
        this.url = value.url;
    }

    isToDownload() {
        if (!this.lastDownload) {
            return Promise.resolve(true);
        }
    }
}

module.exports = UrlModel;
