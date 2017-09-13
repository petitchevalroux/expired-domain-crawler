"use strict";
const path = require("path"),
    di = require(path.join(__dirname, "..", "di")),
    process = require("process");
di.domainRepository.where("lastAvailable", ">", "0")
    .then((domains) => {
        domains.forEach((domain) => {
            process.stdout.write(domain.hostname + "\n");
        });
        return di.redis.quit();
    })
    .catch((err) => {
        di.log.error(err);
        di.redis.quit();
    });
