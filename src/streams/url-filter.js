"use strict";
const {
        Transform
    } = require("stream"),
    path = require("path"),
    dateUtils = require(path.join(__dirname, "..", "utils", "date")),
    urlModule = require("url");
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
            const hostname = urlModule.parse(url)
                .hostname;
            const self = this;
            this.filterUrl(hostname, url)
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

    filterUrl(hostname, url) {
        const self = this;
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
    }

    filterError(err, callback) {
        // Avoid stream error when parsing url failed
        if (err instanceof URIError) {
            return callback();
        }
        return callback(err);
    }

}
module.exports = UrlFilterStream;
