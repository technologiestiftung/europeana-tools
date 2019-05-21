"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var pg_1 = require("pg");
var sharp = require("sharp");
var config = JSON.parse(fs_1.readFileSync("config.json", "utf8"));
var client = new pg_1.Pool(config.db);
client.connect();
client.query("SELECT id, download FROM metadata WHERE download IS NOT NULL AND ( image_problem = TRUE OR image_width IS NULL OR image_type IS NULL )")
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
    return sharp(imagePath)
        .metadata()
        .then(function (metadata) {
        return client.query("UPDATE metadata SET image_type = '" + metadata.format + "', image_width = " + metadata.width + ", image_height = " + metadata.height + ", image_problem = NULL WHERE id = " + imageID);
    }).catch(function (err) {
        // looks like this one still has a problem
        return client.query("UPDATE metadata SET image_problem = TRUE WHERE id = " + imageID);
    });
};
//# sourceMappingURL=checkDownload-v2.js.map