"use strict";
const Promise = require("bluebird"),
    normalizeUrl = require("normalize-url"),
    urlModule = require("url"),
    hash = require("sha256"),
    path = require("path"),
    UrlModel = require(path.join(__dirname, "..", "models", "url"));
class UrlRepository {

    getById(id) {
        return this
            .fetchById(id)
            .then((data) => {
                if (!data) {
                    return null;
                }
                data.id = id;
                return new UrlModel(data);
            });
    }

    getByUrlOrCreate(url) {
        const self = this;
        return this.getNormalizedUrl(url)
            .then((url) => {
                return self
                    .getUrlId(url, false)
                    .then((id) => {
                        return self.getById(id)
                            .then((urlObject) => {
                                if (!urlObject) {
                                    urlObject = new UrlModel({
                                        id: id,
                                        url: url
                                    });
                                    return self
                                        .create(urlObject)
                                        .then(() => {
                                            return urlObject;
                                        });
                                }
                                return urlObject;
                            });
                    });
            });
    }
    getNormalizedUrl(url) {
        return new Promise((resolve) => {
            resolve(normalizeUrl(url));
        });
    }
    getUrlId(url, normalized) {
        if (!normalized) {
            const self = this;
            return this.getNormalizedUrl(url)
                .then((url) => {
                    return self.getUrlId(url, true);
                });
        } else {
            return new Promise((resolve) => {
                const parsedUrl = urlModule.parse(url);
                resolve([hash(parsedUrl.hostname), hash(parsedUrl.path)]
                    .join(
                        ":"));
            });
        }
    }
}

module.exports = UrlRepository;
