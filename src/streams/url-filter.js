"use strict";
const {
    Transform
} = require("stream");
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
                            if (toDownload) {
                                return urlObject
                                    .setLastDownloaded(new Date())
                                    .then((urlObject) => {
                                        return self
                                            .urlRepository
                                            .update(
                                                urlObject.id,
                                                urlObject
                                            )
                                            .then(() => {
                                                return urlObject;
                                            });
                                    })
                                    .then(() => {
                                        callback(null, url);
                                        return toDownload;
                                    });
                            } else {
                                callback();
                            }
                            return toDownload;
                        });
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
