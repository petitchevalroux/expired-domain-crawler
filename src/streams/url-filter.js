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
        const url = chunk.toString();
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
                                    return self.urlRepository.update(
                                        urlObject.id,
                                        urlObject
                                    );
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
    }
}
module.exports = UrlFilterStream;
