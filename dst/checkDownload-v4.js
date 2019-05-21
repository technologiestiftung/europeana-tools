"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var pg_1 = require("pg");
var config = JSON.parse(fs.readFileSync("config.json", "utf8"));
var client = new pg_1.Pool(config.db);
client.connect();
client.query("SELECT id, download, value FROM metadata WHERE download IS NOT NULL AND image_problem = TRUE")
    .then(function (result) {
    result.rows.forEach(function (r) {
        if (fs.existsSync(r.download) && fs.existsSync(r.download + ".bk.jpg")) {
            var stats = fs.statSync(r.download);
            var statsNew = fs.statSync(r.download + ".bk.jpg");
            if (statsNew.size > stats.size) {
                console.log(r.id);
                var oldContent = fs.readFileSync(r.download);
                client.query("UPDATE metadata SET image_comment = '" + oldContent + "' WHERE id = " + r.id);
                fs.renameSync(r.download + ".bk.jpg", r.download);
                fs.unlink(r.download + ".bk.jpg", function (err) {
                    process.stdout.write(JSON.stringify(err));
                });
            }
        }
    });
});
//# sourceMappingURL=checkDownload-v4.js.map