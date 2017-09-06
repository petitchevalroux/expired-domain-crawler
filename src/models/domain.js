"use strict";
class DomainModel {
    constructor(value) {
        this.id = value.id;
        this.hostname = value.hostname;
        if (value.lastNoMatchingDns) {
            this.lastNoMatchingDns = value.lastNoMatchingDns;
        }
        if (value.downloadedUrls) {
            this.lastNoMatchingDns = value.downloadedUrls;
        }
    }
}

module.exports = DomainModel;
