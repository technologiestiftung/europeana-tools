"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var request = require("request");
request("europeana", { json: true }, function (err, res, body) {
    if (err) {
        return console.log(err);
    }
});
//# sourceMappingURL=index.js.map