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
                    const message = err.message || err.toString();
                    return self.httpErrorStream.write(
                        Object.assign({
                            "message": message
                        }, err),
                        "",
                        (err) => {
                            callback(err);
                        }
                    );
                } else {
                    return callback(err);
                }
            }
            if (!result ||
                typeof result.input !== "string" ||
                typeof result.output !== "object" ||
                typeof result.output.body !== "string" ||
                typeof result.output.statusCode === "undefined" ||
                result.output.statusCode !== 200) {
                return callback();
            }
            return callback(null, {
                url: result.input,
                body: result.output.body
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
