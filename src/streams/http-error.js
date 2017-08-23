"use strict";
const {
        Writable
    } = require("stream"),
    path = require("path"),
    dateUtils = require(path.join(__dirname, "..", "utils", "date"));
class HttpErrorStream extends Writable {
    constructor(options) {
        super({
            objectMode: true
        });
        this.domainRepository = options.domainRepository;
    }
    _write(chunk, encoding, callback) {
        if (!chunk.url || !chunk.code || !chunk.hostname) {
            return callback();
        }
        const self = this;
        this.domainRepository
            .getByHostnameOrCreate(chunk.hostname)
            .then((domainObject) => {
                if (chunk.code === "ENOTFOUND") {
                    return self
                        .domainRepository.update(
                            domainObject.id, {
                                lastNoMatchingDns: dateUtils
                                    .getTimestamp()
                            }
                        );
                }
                return domainObject;
            })
            .then(() => {
                return callback();
            })
            .catch((err) => {
                callback(err);
            });
    }
}

module.exports = HttpErrorStream;
