"use strict";
const Promise = require("bluebird"),
    md5 = require("md5"),
    path = require("path"),
    DomainModel = require(path.join(__dirname, "..", "models", "domain"));
class DomainRepository {

    getById(id) {
        return this
            .fetchById(id)
            .then((data) => {
                if (!data) {
                    return null;
                }
                data.id = id;
                return new DomainModel(data);
            });
    }

    getByHostnameOrCreate(hostname) {
        const self = this;
        return this.getNormalizedDomain(hostname)
            .then((hostname) => {
                return self
                    .getDomainId(hostname, false)
                    .then((id) => {
                        return self.getById(id)
                            .then((domainObject) => {
                                if (!domainObject) {
                                    domainObject = new DomainModel({
                                        id: id,
                                        hostname: hostname
                                    });
                                    return self
                                        .create(domainObject)
                                        .then(() => {
                                            return domainObject;
                                        });
                                }
                                return domainObject;
                            });
                    });
            });
    }

    getNormalizedDomain(hostname) {
        return Promise.resolve(hostname);
    }

    getDomainId(hostname, normalized) {
        return (!normalized ? this.getNormalizedDomain(hostname) : Promise.resolve(
            hostname))
            .then((hostname) => {
                return md5(hostname);
            });
    }
}

module.exports = DomainRepository;
