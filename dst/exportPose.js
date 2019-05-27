"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const pg_1 = require("pg");
const wstream = fs.createWriteStream("poses.json");
wstream.write("[\n");
const config = JSON.parse(fs.readFileSync("config.json", "utf8"));
const client = new pg_1.Pool(config.db);
client.connect();
client.query("SELECT id, download, compress_pose FROM metadata WHERE has_pose")
    .then((data) => {
    data.rows.forEach((row) => {
        wstream.write(JSON.stringify({ id: row.id, image: row.download, poses: JSON.parse(row.compress_pose) }) + "\n");
    });
    wstream.write("]");
    wstream.end();
});
//# sourceMappingURL=exportPose.js.map