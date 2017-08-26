"use strict";
const {
        Transform,
        HttpError
    } = require("@petitchevalroux/http-download-stream"),
    path = require("path"),
    dateUtils = require(path.join(__dirname, "..", "utils", "date"));
class DownloadStream extends Transform {
    constructor(options) {
        options.writableObjectMode = true;
        options.readableObjectMode = true;
        super(options);
        this.httpErrorStream = options.httpErrorStream || false;
        this.urlRepository = options.urlRepository;
    }

    _transform(chunk, encoding, callback) {
        const self = this;
        super._transform(chunk, encoding, (err, result) => {
            if (err) {
                // Don't stop on http error
                if (err instanceof HttpError) {
                    if (!self.httpErrorStream) {
                        return callback();
                    }
                    return self.httpErrorStream.write(
                        Object.assign({}, err),
                        "",
                        (err) => {
                            callback(err);
                        }
                    );
                } else {
                    return callback(err);
                }
            }
            if (!result) {
                return callback(null);
            }
            const url = result.input;
            self.urlRepository
                .getByUrlOrCreate(url)
                .then((urlObject) => {
                    return self
                        .urlRepository
                        .update(
                            urlObject.id, {
                                "lastDownloaded": dateUtils.getTimestamp()
                            }
                        )
                        .then(() => {
                            return urlObject;
                        });
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
