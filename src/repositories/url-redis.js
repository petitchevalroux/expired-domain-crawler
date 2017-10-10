"use strict";
const path = require("path"),
    Url = require(path.join(__dirname, "url")),
    ObjectRepository = require(path.join(__dirname, "object-redis"));
class UrlRedisRepository extends Url {
    constructor(options) {
        super(options);
        this.redisClient = options.redisClient;
        this.objectRepository = new ObjectRepository({
            redisClient: this.redisClient,
            namespace: "url",
            zSetProperties: [
                "lastDownloaded"
            ],
            ttl: options.ttl
        });
    }

    fetchById(id) {
        return this.objectRepository.fetchById(id);
    }

    create(domainObject) {
        return this.objectRepository.create(domainObject);
    }

    update(id, domainObject) {
        return this.objectRepository.update(id, domainObject);
    }
}

module.exports = UrlRedisRepository;
