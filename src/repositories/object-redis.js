"use strict";
const Promise = require("bluebird");
class ObjectRedisRepository {
    constructor(options) {
        this.redisClient = options.redisClient;
        this.namespace = options.namespace;
        this.zSetProperties = options.zSetProperties || [];
        this.ttl = options.ttl;
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
                            resolve(hash || null);
                        });
                });
            })
            .then((hash) => {
                if (!hash) {
                    return null;
                }
                return self.getObjectFromHash(hash);
            })
            .then((object) => {
                return self.addZsetProperties(id, object);
            })
            .then((object) => {
                return object ?
                    Object.assign({
                        id: id
                    }, object) : null;
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
                    .getHashAndZsetFromObject(object)
                    .then(function(result) {
                        const hash = result.hash;
                        const zSet = result.zSet;
                        if (!hash) {
                            return zSet;
                        }
                        return new Promise((resolve, reject) => {
                            self
                                .redisClient
                                .hmset(key, hash, (err) => {
                                    if (err) {
                                        return reject(
                                            err);
                                    }
                                    self.updateTtl(key,
                                        (err) => {
                                            if (err) {
                                                return reject(
                                                    err
                                                );
                                            }
                                            resolve(zSet);
                                        });
                                });
                        });
                    })
                    .then((zSet) => {
                        if (!zSet) {
                            return object.id;
                        }
                        return self.saveZsetProperties(object.id,
                            zSet);
                    });
            });
    }

    update(id, object) {
        const data = Object.assign(object, {
            id: id
        });
        return this.create(data);
    }

    getHashAndZsetFromObject(object) {
        const self = this,
            tmp = Object.assign({}, object),
            hash = {},
            zSet = {};
        let countHashProperties = 0,
            countZsetProperties = 0;
        delete tmp.id;
        Object
            .getOwnPropertyNames(tmp)
            .forEach((property) => {
                const value = tmp[property];
                if (typeof(value) !== "undefined") {
                    if (self.zSetProperties.indexOf(property) < 0) {
                        hash[property] = JSON.stringify(value);
                        countHashProperties++;
                    } else {
                        const propertySet = zSet[property] || [];
                        propertySet.push(value);
                        propertySet.push(object.id);
                        zSet[property] = propertySet;
                        countZsetProperties++;
                    }
                }
            });
        return Promise.resolve({
            hash: countHashProperties > 0 ? hash : null,
            zSet: countZsetProperties > 0 ? zSet : null
        });
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

    getZsetKey(property) {
        return [this.namespace, property].join(":");
    }

    saveZsetProperties(id, zSet) {
        const multi = [];
        const self = this;
        Object
            .getOwnPropertyNames(zSet)
            .forEach((property) => {
                const key = self.getZsetKey(property);
                if (self.ttl) {
                    multi.push("expire", key, self.ttl);
                }
                multi.push(["zadd", key]
                    .concat(zSet[property]));
            });
        if (!multi.length) {
            return Promise.resolve(id);
        }
        return new Promise((resolve, reject) => {
            self
                .redisClient
                .multi(multi)
                .exec((err) => {
                    return err ? reject(err) : resolve(id);
                });
        });
    }

    addZsetProperties(id, object) {
        const multi = [],
            self = this;
        if (!self.zSetProperties.length) {
            return Promise.resolve(object);
        }
        this.zSetProperties.forEach((property) => {
            const key = self.getZsetKey(property);
            if (self.ttl) {
                multi.push("expire", key, self.ttl);
            }
            multi.push(["zscore", key, id]);
        });
        return new Promise((resolve, reject) => {
            self
                .redisClient
                .multi(multi)
                .exec((err, values) => {
                    const outputObject = Object.assign({},
                        object || {});
                    let countZsetProperties = 0;
                    if (err) {
                        return reject(err);
                    }
                    self.zSetProperties.forEach((property,
                        index) => {
                        const value = values[index];
                        if (value) {
                            outputObject[property] =
                                value;
                            countZsetProperties++;
                        }
                    });
                    resolve(countZsetProperties > 0 ?
                        outputObject : object);
                });
        });
    }

    increment(id, property, increment) {
        const self = this;
        return this.getKey(id)
            .then((key) => {
                return new Promise((resolve, reject) => {
                    if (self.zSetProperties.indexOf(property) <
                        0) {
                        self.redisClient.hincrby(
                            key,
                            property,
                            increment,
                            (err, result) => {
                                if (err) {
                                    return reject(err);
                                }
                                self.updateTtl(key, (err) => {
                                    if (err) {
                                        return reject(
                                            err
                                        );
                                    }
                                    resolve(result);
                                });
                            }
                        );
                    } else {
                        self.redisClient.zincrby(
                            self.getZsetKey(property),
                            increment,
                            id,
                            (err, result) => {
                                if (err) {
                                    return reject(err);
                                }
                                self.updateTtl(key, (err) => {
                                    if (err) {
                                        return reject(
                                            err
                                        );
                                    }
                                    resolve(result);
                                });
                            }
                        );
                    }
                });
            });
    }

    where(property, comparator, value) {
        const self = this;
        return new Promise((resolve, reject) => {
            if (self.zSetProperties.indexOf(property) > -1) {
                let min, max;
                if (comparator === ">") {
                    min = value;
                    max = "+inf";
                }
                self
                    .redisClient
                    .zrangebyscore([self.getZsetKey(property), min,
                        max
                    ], (err, results) => {
                        if (err) {
                            return reject(err);
                        }
                        return resolve(results);
                    });
            }
        });
    }

    updateTtl(key, cb) {
        if (!this.ttl) {
            return cb();
        }
        this.redisClient.expire(key, this.ttl, cb);
    }
}

module.exports = ObjectRedisRepository;
