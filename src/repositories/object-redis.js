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
        return Promise.resolve([this.namespace, id].join(":"));
    }

    create(object) {
        const self = this;
        return this
            .getKey(object.id)
            .then((key) => {
                return new Promise((resolve, reject) => {
                    const data = Object.assign({}, object);
                    delete data.id;
                    self.redisClient.set(key, JSON.stringify(
                        data), (err) => {
                        if (err) {
                            return reject(err);
                        }
                        resolve(object);
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
}

module.exports = ObjectRedisRepository;
