"use strict";
const {
        LinksExtractor
    } = require("@petitchevalroux/entities-extractor-stream"),
    Promise = require("bluebird");
class Extractor extends LinksExtractor {
    constructor(options) {
        options = options || {};
        options.writableObjectMode = true;
        options.readableObjectMode = true;
        super(options);
        this.buffering = false;
        this.buffer = [];
    }

    processBuffer() {
        if (!this.buffer.length) {
            this.buffering = false;
            return Promise.resolve();
        }
        // If we can push data, we push a buffer element
        if (this._readableState.buffer.length < this._readableState.highWaterMark) {
            this.push(this.buffer.pop());
        }
        return this.processBuffer();
    }

    processLink(link) {
        if (!link.url) {
            return Promise.resolve();
        }
        if (this.buffering) {
            this.buffer.push(link.url);
        } else {
            if (!this.push(link.url)) {
                this.buffering = true;
                return this.processBuffer();
            } else {
                return Promise.resolve();
            }
        }
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
            // We should wait all links processing before calling callback
            Promise.all(links.map((link) => {
                return self.processLink(link);
            }))
                .then(() => {
                    return callback();
                })
                .catch((err) => {
                    callback(err);
                });

        });
    }
}
module.exports = Extractor;
