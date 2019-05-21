"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var pg_1 = require("pg");
var readLine = require("readline");
var request = require("request");
var config = JSON.parse(fs_1.readFileSync("../config.json", "utf8"));
var client = new pg_1.Client(config.db);
client.connect();
var download = function (uri, filename, callback) {
    request.head(uri, function (err, res, body) {
        request(uri, { "family": 4 })
            .on("error", function (error) {
            //process.stdout.write("RequestError" + error + JSON.stringify(files[downloadCount]));
            errorCount++;
            nextDownload();
        })
            .pipe(fs_1.createWriteStream(filename))
            .on("close", function () {
            downloadCount++;
            Promise.all([
                client.query("INSERT INTO temp(value,key) VALUES ('" + downloadCount + "','downloadCount')"),
                client.query("UPDATE metadata SET download = '" + filename + "' WHERE id = " + files[downloadCount - 1][2]),
            ])
                .then(function () {
                if (downloadCount < files.length) {
                    callback();
                }
                else {
                    process.exit();
                }
            })
                .catch(function (error) {
                throw error;
            });
        })
            .on("error", function (error) {
            process.stdout.write("PipeError", error, files[downloadCount]);
        });
    });
};
var downloadCount = 0;
var errorCount = 0;
var files = [];
function nextDownload() {
    readLine.cursorTo(process.stdout, 0);
    process.stdout.write("Downloads: " + downloadCount + " of " + (files.length - 1) + " \u2013 Errors: " + errorCount);
    // const pathEl = files[downloadCount][1].split("/");
    // if (!existsSync(config.download + "/" + pathEl[1])) {
    //   mkdirSync(config.download + "/" + pathEl[1]);
    // }
    var fileExt = files[downloadCount][0].split(".");
    download(files[downloadCount][0], config.download + files[downloadCount][2] + "." + fileExt[fileExt.length - 1], nextDownload);
}
client.query("SELECT value, europeana_id, id FROM metadata WHERE download IS NOT NULL AND image_problem = TRUE") // lower(value) similar to '%(jpeg|jpg|bmp|png|tiff|gif)'
    .then(function (res) {
    if (!fs_1.existsSync(config.download)) {
        fs_1.mkdirSync(config.download);
    }
    files = res.rows.map(function (r) { return [r.value, r.europeana_id, r.id]; });
    if (process.argv.indexOf("--recover") > 1) {
        client.query("SELECT value FROM temp WHERE key = 'downloadCount' ORDER BY id DESC LIMIT 1")
            .then(function (resTemp) {
            downloadCount = parseInt(resTemp.rows[0].value, 10);
            nextDownload();
        })
            .catch(function (e) { return process.stderr.write(e.stack); });
    }
    else {
        nextDownload();
    }
})
    .catch(function (e) { return process.stderr.write(e.stack); });
//# sourceMappingURL=download.js.map