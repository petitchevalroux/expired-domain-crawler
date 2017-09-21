"use strict";
const path = require("path"),
    di = require(path.join(__dirname, "..", "di")),
    HttpDownloadStream = require(path.join(__dirname, "..", "streams",
        "download")),
    httpErrorFifoStream = di.fifoRepository.get("http:error");
httpErrorFifoStream.pipe(di.httpErrorStream);
module.exports = new HttpDownloadStream(
    Object.assign({
        urlRepository: di.urlRepository,
        httpErrorStream: httpErrorFifoStream
    }, di.config.get("download"))
);
