"use strict";
class DomainModel {
    constructor(value) {
        this.id = value.id;
        this.hostname = value.hostname;
        this.lastNoMatchingDns = value.lastNoMatchingDns ?
            value.lastNoMatchingDns : 0;
        this.downloadedUrls = value.downloadedUrls ?
            value.downloadedUrls : 0;
    }
}

module.exports = DomainModel;
