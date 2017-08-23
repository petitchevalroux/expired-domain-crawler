"use strict";
module.exports = {
    getTimestamp(date) {
        const dateObject = date ? date : new Date();
        return Math.round(dateObject.getTime() / 1000);
    }
};
