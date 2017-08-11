"use strict";
var path = require("path");
var commandLineArgs = require("command-line-args");
var process = require("process");
var Crawler = require(path.join(__dirname, "crawler.js"));
var optionDefinitions = [{
        name: "maxHostDepth",
        type: Number,
        defaultValue: 0
    },
    {
        name: "url",
        type: String,
        defaultOption: true
    },
    {
        name: "timeout",
        alias: "t",
        type: Number,
        defaultValue: 5000
    },
    {
        name: "retries",
        alias: "r",
        type: Number,
        defaultValue: 1
    },
    {
        name: "maxRedirects",
        type: Number,
        defaultValue: 2
    }
];

var options = commandLineArgs(optionDefinitions);
var crawler = new Crawler(options);
crawler
    .pipe(process.stdout);
