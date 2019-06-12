import { prependOnceListener } from "cluster";
import * as fs from "fs";
import { Pool } from "pg";

const wstream = fs.createWriteStream("poses.json");
wstream.write("[\n");

const config = JSON.parse(fs.readFileSync("config.json", "utf8"));

const client = new Pool(config.db);
client.connect();

client.query("SELECT m1.europeana_id, m1.id, m1.download, m1.image_width, m1.image_height, m1.compress_pose, m1.abs_pose, \
(SELECT m2.value FROM metadata AS m2 WHERE m1.europeana_id = m2.europeana_id AND key = 'title' LIMIT 1) as title, \
(SELECT m3.value FROM metadata AS m3 WHERE m1.europeana_id = m3.europeana_id AND key = 'dataProvider' LIMIT 1) as museum, \
(SELECT records.timestamp_created FROM records WHERE records.europeana_id = m1.europeana_id LIMIT 1) as date \
FROM metadata AS m1 WHERE m1.yolo_has_person")
    .then((data) => {
        data.rows.forEach((row, ri) => {
            // TODO: If file is too large, maybe reduce the abs_pose size
            wstream.write(((ri > 0) ? "," : "") + JSON.stringify({
                abs_poses: JSON.parse(row.abs_pose),
                c: ri,
                date: row.date,
                download: row.download,
                height: row.image_height,
                id: row.id,
                museum: row.museum,
                poses: JSON.parse(row.compress_pose),
                title: row.title,
                width: row.image_width,
            }) + "\n");
        });
        wstream.write("]");
        setTimeout(() => {
            wstream.end();
            process.exit();
        }, 6000);
    });
