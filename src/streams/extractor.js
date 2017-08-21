"use strict";
const {
    LinksExtractor
} = require("@petitchevalroux/entities-extractor-stream");
class Extractor extends LinksExtractor {
    constructor(options) {
        options = options || {};
        options.writableObjectMode = true;
        super(options);
    }

    _transform(chunk, encoding, callback) {
        const self = this;
        super._transform({
            "baseUrl": chunk.url,
            "body": chunk.body
        }, encoding, (err, links) => {
            if (err) {
                return callback(err);
            }
            links.forEach((link) => {
                if (link.url) {
                    self.push(link.url);
                }
            });
            callback();
        });
    }
}
module.exports = Extractor;
