"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const pg_1 = require("pg");
const wstream = fs.createWriteStream("poses.json");
wstream.write("[\n");
const config = JSON.parse(fs.readFileSync("config.json", "utf8"));
const client = new pg_1.Pool(config.db);
client.connect();
client.query("SELECT id, download, compress_pose, abs_pose FROM metadata WHERE has_pose")
    .then((data) => {
    data.rows.forEach((row, ri) => {
        // TODO: If file is too large, maybe reduce the abs_pose size
        wstream.write(((ri > 0) ? "," : "") + JSON.stringify({ id: row.id, c: ri, image: row.download, poses: JSON.parse(row.compress_pose), abs_poses: row.abs_pose }) + "\n");
    });
    wstream.write("]");
    wstream.end();
    process.exit();
});
//# sourceMappingURL=exportPose.js.map