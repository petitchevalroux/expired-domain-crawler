"use strict";
const path = require("path"),
    Stream = require(path.join(__dirname, "..", "..", "src", "streams",
        "url-filter")),
    {
        PassThrough,
        Writable
    } = require("stream"),
    assert = require("assert");
describe("Url filter stream", () => {
    it("filter binary files", (done) => {
        const stream = new Stream({}),
            input = new PassThrough(),
            results = [],
            output = new Writable({
                "objectMode": true,
                "write": (chunk, encoding, callback) => {
                    results.push(chunk.toString());
                    callback();
                }
            });
        input
            .pipe(stream)
            .pipe(output)
            .on("finish", () => {
                assert.equal(results.length, 0);
                done();
            });
        input.write("http://example.com/image.png?foo=dummy");
        input.write("http://example.com/image.jpg?foo=dummy");
        input.write("http://example.com/image.jpeg?foo=dummy");
        input.write("http://example.com/image.gif?foo=dummy");
        input.write("http://example.com/image.bmp?foo=dummy");
        input.write("http://example.com/image.pdf");
        input.end();
    });
});
