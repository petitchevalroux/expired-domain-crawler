"use strict";
class FifoRepository {
    constructor() {
        this.fifos = [];
    }
    get(name) {
        if (!this.fifos[name]) {
            this.fifos[name] = this.create(name);
        }
        return this.fifos[name];
    }
}

module.exports = FifoRepository;
