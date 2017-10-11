"use strict";
const path = require("path"),
    di = require(path.join(__dirname, "..", "di")),
    HttpDownloadStream = require(path.join(__dirname, "..", "streams",
        "download")),
    httpErrorFifoStream = di.fifoRepository.get("http:error");
httpErrorFifoStream.pipe(di.httpErrorStream);
module.exports = new HttpDownloadStream({
    urlRepository: di.urlRepository,
    httpErrorStream: httpErrorFifoStream
});
