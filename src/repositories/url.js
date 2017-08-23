"use strict";
const Promise = require("bluebird"),
    normalizeUrl = require("normalize-url"),
    urlModule = require("url"),
    md5 = require("md5"),
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
        return Promise.resolve(normalizeUrl(url));
    }
    getUrlId(url, normalized) {
        return (!normalized ? this.getNormalizedUrl(url) : Promise.resolve(
            url))
            .then((url) => {
                const parsedUrl = urlModule.parse(url);
                return [md5(parsedUrl.hostname), md5(parsedUrl.path)].join(
                    ":");
            });
    }
}

module.exports = UrlRepository;
