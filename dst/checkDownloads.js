"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var file_type_1 = require("file-type");
var fs_1 = require("fs");
var sizeOf = require("image-size");
var pg_1 = require("pg");
var read_chunk_1 = require("read-chunk");
var util_1 = require("util");
var sizeOfP = util_1.promisify(sizeOf);
var config = JSON.parse(fs_1.readFileSync("config.json", "utf8"));
var client = new pg_1.Client(config.db);
client.connect();
client.query("SELECT id, download FROM metadata WHERE download IS NOT NULL")
    .then(function (result) {
    Promise.all(result.rows.map(function (r) { return checkImage(r.download, r.id); }))
        .then(function (overall) {
        console.log("DONE", overall.length);
    })
        .catch(function (err) {
        console.log("ERROR", err);
    });
});
var checkImage = function (imagePath, imageID) {
    return read_chunk_1.default(imagePath, 0, file_type_1.default.minimumBytes)
        .then(function (buffer) {
        var type = file_type_1.default(buffer);
        return client.query("UPDATE metadata SET image_type = '" + type.mime + "' WHERE id = " + imageID);
    })
        .then(function (query) {
        return sizeOfP(imagePath);
    })
        .then(function (dimensions) {
        return client.query("UPDATE metadata SET image_width = '" + dimensions.width + "', image_height = " + dimensions.height + " WHERE id = " + imageID);
    })
        .catch(function (err) {
        return client.query("UPDATE metadata SET image_problem = TRUE WHERE id = " + imageID);
    });
};
//# sourceMappingURL=checkDownloads.js.map