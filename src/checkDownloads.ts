import fileType from "file-type";
import { readFileSync } from "fs";
import * as sizeOf from "image-size";
import { Client } from "pg";
import readChunk from "read-chunk";
import { promisify } from "util";

const sizeOfP = promisify(sizeOf);

const config = JSON.parse(readFileSync("config.json", "utf8"));

const client = new Client(config.db);
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

const checkImage = (imagePath: string, imageID: number) => {
    return readChunk(imagePath, 0, fileType.minimumBytes)
        .then((buffer) => {
            const type = fileType(buffer);
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
