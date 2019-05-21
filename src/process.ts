import * as bodyParser from "body-parser";
import * as express from "express";
import * as fs from "fs";
import { prependOnceListener } from "cluster";
// import { Pool } from "pg";

// const config = JSON.parse(fs.readFileSync("config.json", "utf8"));

// const client = new Pool(config.db);
// client.connect();

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use((req, res) => {
  res.setHeader("Content-Type", "text/plain");
  console.log(req.body);
  res.end(JSON.stringify({id: 1, image: "people.jpeg"}));
});

app.listen(5678, () => {
  console.log('Example app listening on port 5678!');
});

// client.query(`SELECT id, download, value FROM metadata WHERE download IS NOT NULL AND image_problem = TRUE`)
//     .then((result) => {
//         result.rows.forEach((r) => {
//             if (fs.existsSync(r.download) && fs.existsSync(r.download + ".bk.jpg")) {
//                 const stats = fs.statSync(r.download);
//                 const statsNew = fs.statSync(r.download + ".bk.jpg");
//                 if (statsNew.size > stats.size) {
//                     console.log(r.id);
//                     const oldContent = fs.readFileSync(r.download);
//                     client.query(`UPDATE metadata SET image_comment = '${oldContent}' WHERE id = ${r.id}`);
//                     fs.renameSync(r.download + ".bk.jpg", r.download);
//                     fs.unlink(r.download + ".bk.jpg", (err) => {
//                         process.stdout.write(JSON.stringify(err));
//                     });
//                 }
//             }
//         });
//     });
