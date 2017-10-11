"use strict";
const path = require("path"),
    di = require(path.join(__dirname, "..", "di")),
    HttpErrorStream = require(path.join(
        __dirname,
        "..",
        "streams",
        "http-error"
    )),
    httpErrorStream = new HttpErrorStream({
        domainRepository: di.domainRepository,
        apiClient: di.godaddy
    });
httpErrorStream.on("error", (error) => {
    di.log.error(error);
});
module.exports = httpErrorStream;
