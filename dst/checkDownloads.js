"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const file_type_1 = require("file-type");
const fs_1 = require("fs");
const sizeOf = require("image-size");
const pg_1 = require("pg");
const read_chunk_1 = require("read-chunk");
const util_1 = require("util");
const sizeOfP = util_1.promisify(sizeOf);
const config = JSON.parse(fs_1.readFileSync("config.json", "utf8"));
const client = new pg_1.Client(config.db);
client.connect();
client.query(`SELECT id, download FROM metadata WHERE download IS NOT NULL`)
    .then((result) => {
    Promise.all(result.rows.map((r) => checkImage(r.download, r.id)))
        .then((overall) => {
        console.log("DONE", overall.length);
    })
        .catch((err) => {
        console.log("ERROR", err);
    });
});
const checkImage = (imagePath, imageID) => {
    return read_chunk_1.default(imagePath, 0, file_type_1.default.minimumBytes)
        .then((buffer) => {
        const type = file_type_1.default(buffer);
        return client.query(`UPDATE metadata SET image_type = '${type.mime}' WHERE id = ${imageID}`);
    })
        .then((query) => {
        return sizeOfP(imagePath);
    })
        .then((dimensions) => {
        return client.query(`UPDATE metadata SET image_width = '${dimensions.width}', image_height = ${dimensions.height} WHERE id = ${imageID}`);
    })
        .catch((err) => {
        return client.query(`UPDATE metadata SET image_problem = TRUE WHERE id = ${imageID}`);
    });
};
//# sourceMappingURL=checkDownloads.js.map