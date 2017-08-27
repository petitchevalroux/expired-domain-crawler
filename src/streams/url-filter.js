"use strict";
const {
        Transform
    } = require("stream"),
    path = require("path"),
    dateUtils = require(path.join(__dirname, "..", "utils", "date"));
class UrlFilterStream extends Transform {
    constructor(options) {
        options.readableObjectMode = true;
        options.writableObjectMode = true;
        super(options);
        this.urlRepository = options.urlRepository;
    }
    _transform(chunk, encoding, callback) {
        const self = this;
        try {
            const url = chunk.toString()
                .trim();
            if (url.substring(0, 4) !== "http") {
                return callback();
            }
            self.urlRepository
                .getByUrlOrCreate(url)
                .then((urlObject) => {
                    return urlObject
                        .isToDownload()
                        .then((toDownload) => {
                            if (!toDownload) {
                                return undefined;
                            }
                            return self
                                .urlRepository
                                .update(
                                    urlObject.id, {
                                        "lastDownloaded": dateUtils
                                            .getTimestamp()
                                    }
                                )
                                .then(() => {
                                    return url;
                                });
                        });
                })
                .then((url) => {
                    return callback(null, url);
                })
                .catch((err) => {
                    self.filterError(err, callback);
                });
        } catch (err) {
            self.filterError(err, callback);
        }
    }

    filterError(err, callback) {
        // Avoid stream error when parsing url failed
        if (err instanceof URIError) {
            return callback();
        }
        return callback(err);
    }
}
module.exports = UrlFilterStream;
