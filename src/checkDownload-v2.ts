import { readFileSync } from "fs";
import { Pool } from "pg";
import * as sharp from "sharp";

const config = JSON.parse(readFileSync("config.json", "utf8"));

const client = new Pool(config.db);
client.connect();

client.query(`SELECT id, download FROM metadata WHERE download IS NOT NULL AND ( image_problem = TRUE OR image_width IS NULL OR image_type IS NULL )`)
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
    return sharp(imagePath)
        .metadata()
        .then((metadata) => {
            return client.query(`UPDATE metadata SET image_type = '${metadata.format}', image_width = ${metadata.width}, image_height = ${metadata.height}, image_problem = NULL WHERE id = ${imageID}`);
        }).catch((err) => {
            // looks like this one still has a problem
            return client.query(`UPDATE metadata SET image_problem = TRUE WHERE id = ${imageID}`);
        });

};
