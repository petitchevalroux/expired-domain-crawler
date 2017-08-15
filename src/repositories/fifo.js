"use strict";
const Promise = require("bluebird");
class FifoRepository {
    constructor() {
        this.fifos = [];
    }
    get(name) {
        if (this.fifos[name]) {
            return Promise.resolve(this.fifos[name]);
        }
        return this.create(name);
    }
}

module.exports = FifoRepository;
