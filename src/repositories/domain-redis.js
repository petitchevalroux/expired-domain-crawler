"use strict";
const path = require("path"),
    Domain = require(path.join(__dirname, "domain")),
    ObjectRepository = require(path.join(__dirname, "object-redis"));
class DomainRedisRepository extends Domain {
    constructor(options) {
        super(options);
        this.redisClient = options.redisClient;
        this.objectRepository = new ObjectRepository({
            redisClient: this.redisClient,
            namespace: "domain",
            zSetProperties: [
                "lastNoMatchingDns",
                "lastAvailable"
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
}

module.exports = DomainRedisRepository;
