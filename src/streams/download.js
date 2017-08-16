"use strict";
const {
    Transform
} = require("@petitchevalroux/http-download-stream");
class DownloadStream extends Transform {
    constructor(options) {
        super(options);
        this.urlRepository = options.urlRepository;
    }
    _transform(chunk, encoding, callback) {
        const self = this;
        super._transform(chunk, encoding, (err, result) => {
            if (err) {
                return callback(err);
            }
            const url = chunk.toString();
            self.urlRepository
                .getByUrlOrCreate(url)
                .then((urlObject) => {
                    return urlObject.setLastDownloaded(new Date());
                })
                .then((urlObject) => {
                    return self.urlRepository.update(urlObject.id,
                        urlObject);
                })
                .catch((err) => {
                    callback(err);
                });
            callback(null, result);
        });
    }
}
module.exports = DownloadStream;
