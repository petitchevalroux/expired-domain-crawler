"use strict";
const {
        Writable
    } = require("stream"),
    path = require("path"),
    dateUtils = require(path.join(__dirname, "..", "utils", "date")),
    Promise = require("bluebird"),
    Error = require("@petitchevalroux/error");
class HttpErrorStream extends Writable {
    constructor(options) {
        super({
            objectMode: true
        });
        this.domainRepository = options.domainRepository;
        this.apiClient = options.apiClient;
    }
    _write(chunk, encoding, callback) {
        if (!chunk.url || !chunk.code || !chunk.hostname) {
            return callback(new Error(
                "Invalid http-error stream (error: %j)",
                chunk
            ));
        }
        const self = this;
        this.domainRepository
            .getByHostnameOrCreate(chunk.hostname)
            .then((domainObject) => {
                if (chunk.code !== "ENOTFOUND") {
                    return null;
                }
                return Object.assign(domainObject, {
                    lastNoMatchingDns: dateUtils
                        .getTimestamp()
                });
            })
            .then((domainObject) => {
                if (!domainObject || !domainObject.lastNoMatchingDns) {
                    return null;
                }
                return self
                    .isAvailable(domainObject.hostname)
                    .then((availability) => {
                        if (!availability) {
                            return domainObject;
                        }
                        return Object.assign(domainObject, {
                            lastAvailable: dateUtils
                                .getTimestamp()
                        });
                    });
            })
            .then((domainObject) => {
                if (!domainObject) {
                    return null;
                }
                return self
                    .domainRepository
                    .update(domainObject.id, domainObject);
            })
            .then(() => {
                return callback();
            })
            .catch((err) => {
                callback(err);
            });
    }

    isAvailable(hostname) {
        const self = this;
        return new Promise((resolve, reject) => {
            self.apiClient
                .domains
                .available({
                    domain: hostname
                }, (err, data) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(data.available ? true :
                        false);
                });
        });
    }
}

module.exports = HttpErrorStream;
