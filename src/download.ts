import { createWriteStream, readFileSync } from "fs";
import { Client } from "pg";
import * as readLine from "readline";
import * as request from "request";

const config = JSON.parse(readFileSync("../config.json", "utf8"));

const client = new Client(config.db);
client.connect();

const download = (uri, filename, callback: () => void) => {
    request.head(uri, (err, res, body) => {
      request(uri).pipe(createWriteStream(filename)).on("close", () => {
        downloadCount++;

        client.query(`INSERT INTO temp(value,key) VALUES ('${downloadCount}','downloadCount')`)
          .then( () => {
                if (downloadCount < files.length) {
                  callback();
                } else {
                  process.exit();
                }
              })
          .catch((error) => {
              throw error;
          });

      });
    });
};

let downloadCount = 0;
let files = [];

function nextDownload() {
  readLine.cursorTo(process.stdout, 0);
  process.stdout.write(`Downloads: ${downloadCount} of ${files.length - 1}`);

  download(files[downloadCount], files[downloadCount], nextDownload);
}

client.query(`SELECT value FROM metadata WHERE lower(value) similar to '%(jpeg|jpg|bmp|png|tiff|gif)'`)
    .then((res) => {
      files = res.rows.map((r) => r.value);

      if (process.argv.indexOf("--recover") > 1) {
        client.query(`SELECT value FROM temp WHERE key = 'downloadCount' ORDER BY id DESC LIMIT 1`)
          .then((resTemp) => {
            downloadCount = parseInt(resTemp.rows[0].value, 10);
            nextDownload();
          })
          .catch((e) => process.stderr.write(e.stack));
      } else {
        nextDownload();
      }

    })
    .catch((e) => process.stderr.write(e.stack));
