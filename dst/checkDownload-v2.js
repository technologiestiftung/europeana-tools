"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const pg_1 = require("pg");
const sharp = require("sharp");
const config = JSON.parse(fs_1.readFileSync("config.json", "utf8"));
const client = new pg_1.Pool(config.db);
client.connect();
client.query(`SELECT id, download FROM metadata WHERE download IS NOT NULL AND ( image_problem = TRUE OR image_width IS NULL OR image_type IS NULL )`)
    .then((result) => {
    Promise.all(result.rows.map((r) => checkImage(r.download, r.id)))
        .then((overall) => {
        process.stdout.write("DONE" + overall.length + "\n");
    })
        .catch((err) => {
        process.stdout.write("ERROR" + err + "\n");
    });
});
const checkImage = (imagePath, imageID) => {
    return sharp(imagePath)
        .metadata()
        .then((metadata) => {
        return client.query(`UPDATE metadata \
            SET image_type = '${metadata.format}', \
            image_width = ${metadata.width}, \
            image_height = ${metadata.height}, \
            image_problem = NULL \
            WHERE id = ${imageID}`);
    }).catch((err) => {
        // looks like this one still has a problem
        return client.query(`UPDATE metadata SET image_problem = TRUE WHERE id = ${imageID}`);
    });
};
//# sourceMappingURL=checkDownload-v2.js.map