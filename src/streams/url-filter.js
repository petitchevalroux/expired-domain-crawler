"use strict";
const {
        Transform
    } = require("stream"),
    path = require("path"),
    dateUtils = require(path.join(__dirname, "..", "utils", "date")),
    urlModule = require("url"),
    Promise = require("bluebird");
class UrlFilterStream extends Transform {
    constructor(options) {
        options.readableObjectMode = true;
        options.writableObjectMode = true;
        super(options);
        this.urlRepository = options.urlRepository;
        this.domainRepository = options.domainRepository;
        this.maxUrlsPerDomain = options.maxUrlsPerDomain || 1000;
        this.urlsDownloadGrace = 86400 * 30;
    }

    _transform(chunk, encoding, callback) {
        try {
            const url = chunk.toString()
                .trim();
            const self = this;
            this.filterUrl(urlModule.parse(url))
                .then((url) => {
                    return callback(null, url);
                })
                .catch((err) => {
                    self.filterError(err, callback);
                });
        } catch (err) {
            this.filterError(err, callback);
        }
    }

    filterUrl(opts) {
        try {
            const self = this,
                hostname = opts.hostname,
                url = opts.href;
            if ([".jpg", ".jpeg", ".png", ".gif", ".bmp", ".pdf"]
                .indexOf(path.extname(opts.pathname)) > -1) {
                return Promise.resolve();
            }
            return this.domainRepository
                .getByHostnameOrCreate(hostname)
                .then((domainObject) => {
                    if (domainObject.downloadedUrls >= self.maxUrlsPerDomain) {
                        return undefined;
                    }
                    return self
                        .domainRepository
                        .increment(domainObject.id, "downloadedUrls", 1)
                        .then(() => {
                            return self
                                .urlRepository
                                .getByUrlOrCreate(url);
                        })
                        .then((urlObject) => {
                            if (urlObject.lastDownloaded >
                                (dateUtils.getTimestamp() - self.urlsDownloadGrace)
                            ) {
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
                                    return urlObject.url;
                                });
                        });
                });
        } catch (err) {
            return Promise.reject(err);
        }
    }

    filterError(err, callback) {
        // Avoid stream error when parsing url failed
        if (err instanceof URIError ||
            err instanceof TypeError) {
            return callback();
        }
        return callback(err);
    }

}
module.exports = UrlFilterStream;
