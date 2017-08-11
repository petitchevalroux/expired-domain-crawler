"use strict";
const scraper = require("@petitchevalroux/semantic-scraper");
const Readable = require("stream")
    .Readable;
const urlModule = require("url");

class Crawler extends Readable {

    constructor(options) {
        super({});
        this.options = options;
    }

    startRead() {
        if (typeof(this.downloader) !== "undefined") {
            return false;
        }
        this.downloader = new scraper
            .Downloader({
                "timeout": this.options.timeout,
                "retries": this.options.retries,
                "maxRedirects": this.options.maxRedirects
            });
        var self = this;
        this.downloader
            .on("http:error", function(err) {
                if (err.code === "ENOTFOUND") {
                    try {
                        var hostname = urlModule.parse(err.url)
                            .hostname;
                        self.push(hostname + "\n");
                    } catch (err) {
                        self.emit("error", err);
                    }
                }
            });
        this.crawler = new scraper.Crawler({
            "downloader": this.downloader
        });
        this.regexSpider = new scraper
            .RegexSpider(
                this.options.url, [new RegExp("^https?://")], [], [],
                this.options["maxHostDepth"]
            );
        this.crawler.write(this.regexSpider);
        this.crawler.on("error", function() {});
    }

    _read() {
        this.startRead();
    }
}

module.exports = Crawler;
