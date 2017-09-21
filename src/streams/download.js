"use strict";
const {
        Stream,
        HttpError
    } = require("@petitchevalroux/http-download-stream"),
    Promise = require("bluebird");
class DownloadStream extends Stream {

    constructor(options) {
        options.writableObjectMode = true;
        options.readableObjectMode = true;
        super(options);
        this.httpErrorStream = options.httpErrorStream || false;
    }

    downloadUrl(url) {
        const self = this;
        return new Promise((resolve, reject) => {
            super
                .downloadUrl(url)
                .then((result) => {
                    if (!result ||
                        typeof result.input !== "string" ||
                        typeof result.output !== "object" ||
                        typeof result.output.body !== "string" ||
                        typeof result.output.statusCode === "undefined" ||
                        result.output.statusCode !== 200) {
                        return ;
                    }
                    return {
                        url: result.input,
                        body: result.output.body
                    };
                })
                .then((result) => {
                    return resolve(result);
                })
                .catch((err) => {
                    // Don't stop on http error
                    if (err instanceof HttpError) {
                        if (self.httpErrorStream) {
                            const message = err.message || err.toString();
                            self.httpErrorStream.write(
                                Object.assign({
                                    "message": message
                                }, err),
                                "",
                                (err) => {
                                    if (err) {
                                        reject(err);
                                    } else {
                                        resolve();
                                    }
                                }
                            );
                        } else {
                            resolve();
                        }
                    }
                    // Avoid stream error when parsing url failed
                    else if (err instanceof URIError) {
                        resolve();
                    } else {
                        reject(err);
                    }
                });
        });
    }

    /**
     * Return max download duration per url in seconds
     * @returns {Number}
     */
    getMaxDownloadDuration() {
        return Math.round((Math.max(this.options.rateWindow / this.options.rateCount,
            this.options.timeout) * this.options.retries) / 1000);
    }
}
module.exports = DownloadStream;
