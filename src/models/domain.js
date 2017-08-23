"use strict";
class DomainModel {
    constructor(value) {
        this.id = value.id;
        this.hostname = value.hostname;
        this.noMatchingDns = !value.noMatchingDns ? false : true;
    }
}

module.exports = DomainModel;
