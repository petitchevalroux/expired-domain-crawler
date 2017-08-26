"use strict";
var path = require("path");
var di = new Proxy({}, {
    get: function(target, name) {
        if (!target.hasOwnProperty(name)) {
            target[name] = require(
                path.join(__dirname, "dependencies", name)
            );
        }
        return target[name];
    }
});

module.exports = di;
