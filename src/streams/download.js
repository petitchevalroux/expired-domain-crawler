"use strict";
const {
    Transform,
    HttpError
} = require("@petitchevalroux/http-download-stream");
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
            const url = chunk.toString();
            if (err) {
                // Don't stop on http error
                if (err instanceof HttpError) {
                    if (!self.httpErrorStream) {
                        return callback();
                    }
                    const httpError = Object.assign({}, err);
                    httpError.url = url;
                    return self.httpErrorStream.write(
                        httpError,
                        "",
                        (err) => {
                            callback(err);
                        }
                    );
                } else {
                    return callback(err);
                }
            }
            self.urlRepository
                .getByUrlOrCreate(url)
                .then((urlObject) => {
                    return urlObject.setLastDownloaded(new Date());
                })
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
