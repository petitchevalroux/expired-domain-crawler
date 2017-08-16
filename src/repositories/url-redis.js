"use strict";
const path = require("path"),
    Promise = require("bluebird"),
    Url = require(path.join(__dirname, "url"));
class UrlRedisRepository extends Url {
    constructor(options) {
        super(options);
        this.redisClient = options.redisClient;
    }

    fetchById(id) {
        const self = this;
        return this
            .getKey(id)
            .then((key) => {
                return new Promise((resolve, reject) => {
                    self.redisClient.get(key, (err, value) => {
                        if (err) {
                            return reject(err);
                        }
                        if (value) {
                            value = JSON.parse(value);
                        }
                        resolve(value);
                    });
                });
            });
    }

    getKey(id) {
        return Promise.resolve(["url", id].join(":"));
    }

    create(urlObject) {
        const self = this;
        return this
            .getKey(urlObject.id)
            .then((key) => {
                return new Promise((resolve, reject) => {
                    const data = Object.assign({}, urlObject);
                    delete data.id;
                    self.redisClient.set(key, JSON.stringify(
                        data), (err) => {
                        if (err) {
                            return reject(err);
                        }
                        resolve(urlObject);
                    });
                });
            });
    }

    update(id, urlObject) {
        const data = Object.assign(urlObject, {
            id: id
        });
        return this.create(data);
    }
}

module.exports = UrlRedisRepository;
