import * as bodyParser from "body-parser";
import { prependOnceListener } from "cluster";
import * as express from "express";
import * as fs from "fs";
import { Pool } from "pg";

const config = JSON.parse(fs.readFileSync("config.json", "utf8"));

const client = new Pool(config.db);
client.connect();

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  // intercepts OPTIONS method
  if ("OPTIONS" === req.method) {
    // respond with 200
    res.sendStatus(200);
  } else {
  // move on
    next();
  }
});

app.use(async (req, res) => {
  res.setHeader("Content-Type", "text/plain");

  if ("body" in req && "data" in req.body) {
    if (req.body.data.length >= 1) {

      const rel = JSON.parse(JSON.stringify(req.body.data));
      let hasPerson = "FALSE";

      rel.forEach((r) => {
        if (r.class.toLowerCase() === "person") {
          hasPerson = "TRUE";
        }
      });

      await client.query(`UPDATE metadata \
      SET coco_done = TRUE, \
      coco = '${JSON.stringify(rel)}', \
      coco_has_person = '${hasPerson}' \
      WHERE id = ${req.body.id}`);
    } else if (req.body.id !== 0 && req.body.id !== "0") {
      await client.query(`UPDATE metadata SET coco_done = TRUE WHERE id = ${req.body.id}`);
    }

    const result = await client.query(`SELECT id, download \
    FROM metadata \
    WHERE download IS NOT NULL \
    AND image_problem IS NULL \
    AND has_pose IS NOT NULL \
    AND coco_done IS NULL \
    AND id > ${req.body.id} \
    ORDER BY id ASC LIMIT 1`);
    if ("rows" in result && result.rows.length >= 1) {
      res.end(JSON.stringify({id: result.rows[0].id, image: result.rows[0].download}));
    } else {
      res.end(JSON.stringify({message: "we are done"}));
    }

  } else {
    res.end(JSON.stringify({message: "empty"}));
  }
});

app.listen(5679, () => {
  process.stdout.write("Example app listening on port 5679!\n");
});
