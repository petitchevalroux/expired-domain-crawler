"use strict";
const {
    Transform
} = require("stream");
class UrlFilterStream extends Transform {
    constructor(options) {
        super(options);
        this.urlRepository = options.urlRepository;
    }
    _transform(chunk, encoding, callback) {
        const url = chunk.toString();
        this.urlRepository
            .getByUrlOrCreate(url)
            .then((urlObject) => {
                return urlObject
                    .isToDownload()
                    .then((toDownload) => {
                        if (toDownload) {
                            callback(null, url);
                        }
                        return toDownload;
                    });
            })
            .catch((err) => {
                callback(err);
            });
    }
}
module.exports = UrlFilterStream;
