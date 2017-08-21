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
                    return self.urlRepository.update(
                        urlObject.id,
                        urlObject
                    );
                })
                .then((urlObject) => {
                    if (result.output.statusCode === 200) {
                        callback(
                            null,
                            Object.assign(urlObject, {
                                body: result.output.body
                            }));
                    } else {
                        callback();
                    }
                    return result;
                })
                .catch((err) => {
                    callback(err);
                });
        });
    }
}
module.exports = DownloadStream;
