import { prependOnceListener } from "cluster";
import * as fs from "fs";
import { Pool } from "pg";

const wstream = fs.createWriteStream("poses.json");
wstream.write("[\n");

const config = JSON.parse(fs.readFileSync("config.json", "utf8"));

const client = new Pool(config.db);
client.connect();

client.query("SELECT id, download, compress_pose FROM metadata WHERE has_pose")
    .then((data) => {
        data.rows.forEach((row) => {
            wstream.write(JSON.stringify({ id: row.id, image: row.download, poses: JSON.parse(row.compress_pose) }) + "\n");
        });
        wstream.write("]");
        wstream.end();
        
        process.exit();
    });
