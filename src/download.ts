import { createWriteStream, existsSync, mkdirSync, readFileSync } from "fs";
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

  const pathEl = files[downloadCount][1].split("/");
  if (!existsSync(config.download + "/" + pathEl[1])) {
    mkdirSync(config.download + "/" + pathEl[1]);
  }

  const fileExt = files[downloadCount][0].split(".");

  download(files[downloadCount][0], config.download + files[downloadCount][1] + "." + fileExt[fileExt.length - 1], nextDownload);
}

client.query(`SELECT value, europeana_id FROM metadata WHERE lower(value) similar to '%(jpeg|jpg|bmp|png|tiff|gif)'`)
    .then((res) => {
      if (!existsSync(config.download)) {
        mkdirSync(config.download);
      }

      files = res.rows.map((r) => [r.value, r.europeana_id]);

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
