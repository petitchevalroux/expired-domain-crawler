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
        try {
            const url = chunk.toString()
                .trim();
            if (url.substring(0, 4) !== "http") {
                return callback();
            }
            const self = this;
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
                    callback(err);
                });
        } catch (err) {
            return callback(err);
        }
    }
}
module.exports = UrlFilterStream;
