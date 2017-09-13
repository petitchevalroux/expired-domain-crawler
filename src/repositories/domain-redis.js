"use strict";
const path = require("path"),
    Domain = require(path.join(__dirname, "domain")),
    ObjectRepository = require(path.join(__dirname, "object-redis")),
    Promise = require("bluebird");
class DomainRedisRepository extends Domain {
    constructor(options) {
        super(options);
        this.redisClient = options.redisClient;
        this.objectRepository = new ObjectRepository({
            redisClient: this.redisClient,
            namespace: "domain",
            zSetProperties: [
                "lastNoMatchingDns",
                "lastAvailable",
                "downloadedUrls"
            ]
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

    increment(id, field, increment) {
        return this.objectRepository.increment(id, field, increment);
    }

    where(property, comparator, value) {
        const self = this;
        return this.objectRepository
            .where(property, comparator, value)
            .then((ids) => {
                return Promise.all(ids.map((id) => {
                    return self.getById(id);
                }));
            });
    }
}

module.exports = DomainRedisRepository;
