"use strict";
const Promise = require("bluebird");
class ObjectRedisRepository {
    constructor(options) {
        this.redisClient = options.redisClient;
        this.namespace = options.namespace;
    }

    fetchById(id) {
        const self = this;
        return this
            .getKey(id)
            .then((key) => {
                return new Promise((resolve, reject) => {
                    self
                        .redisClient
                        .hgetall(key, (err, hash) => {
                            if (err) {
                                return reject(err);
                            }
                            // Hash not found
                            if (!hash) {
                                return resolve(null);
                            }
                            self
                                .getObjectFromHash(hash)
                                .then((object) => {
                                    return resolve(
                                        Object.assign({
                                            id: id
                                        },
                                        object)
                                    );
                                })
                                .catch((err) => {
                                    reject(err);
                                });
                        });
                });
            });
    }

    getKey(id) {
        return Promise.resolve([this.namespace, id].join(":"));
    }

    create(object) {
        const self = this;
        return this
            .getKey(object.id)
            .then((key) => {
                return self
                    .getHashFromObject(object)
                    .then(function(hash) {
                        return new Promise((resolve, reject) => {
                            self
                                .redisClient
                                .hmset(key, hash, (err) => {
                                    if (err) {
                                        return reject(
                                            err);
                                    }
                                    return resolve(
                                        object.id);
                                });
                        });
                    });
            });
    }

    update(id, object) {
        const data = Object.assign(object, {
            id: id
        });
        return this.create(data);
    }

    getHashFromObject(object) {
        const tmp = Object.assign({}, object);
        const hash = {};
        delete tmp.id;
        Object
            .getOwnPropertyNames(tmp)
            .forEach((property) => {
                const value = tmp[property];
                if (typeof(value) !== "undefined") {
                    hash[property] = JSON.stringify(value);
                }
            });
        return Promise.resolve(hash);
    }

    getObjectFromHash(hash) {
        const object = {};
        Object
            .getOwnPropertyNames(hash)
            .forEach((property) => {
                object[property] = JSON.parse(hash[property]);
            });
        return Promise.resolve(object);
    }
}

module.exports = ObjectRedisRepository;
