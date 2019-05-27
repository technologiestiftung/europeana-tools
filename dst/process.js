"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const bodyParser = require("body-parser");
const express = require("express");
const fs = require("fs");
const pg_1 = require("pg");
const config = JSON.parse(fs.readFileSync("config.json", "utf8"));
const client = new pg_1.Pool(config.db);
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
    }
    else {
        // move on
        next();
    }
});
app.use((req, res) => __awaiter(this, void 0, void 0, function* () {
    res.setHeader("Content-Type", "text/plain");
    console.log(req.body);
    if ("body" in req && "data" in req.body) {
        if (req.body.data.length >= 1) {
            const rel = JSON.parse(JSON.stringify(req.body.data));
            const compress = [];
            rel.forEach((body) => {
                const cBody = [];
                let minX = Number.MAX_VALUE;
                let minY = Number.MAX_VALUE;
                let maxX = -Number.MAX_VALUE;
                let maxY = -Number.MAX_VALUE;
                body.keypoints.forEach((point) => {
                    if (point.position.x > maxX) {
                        maxX = point.position.x;
                    }
                    if (point.position.y > maxY) {
                        maxY = point.position.y;
                    }
                    if (point.position.x < minX) {
                        minX = point.position.x;
                    }
                    if (point.position.y < minY) {
                        minY = point.position.y;
                    }
                });
                const width = maxX - minX;
                const height = maxY - minY;
                body.keypoints.forEach((point) => {
                    point.position.x = (point.position.x - minX) / width;
                    point.position.y = (point.position.y - minY) / height;
                    cBody.push(point.position.x);
                    cBody.push(point.position.y);
                });
                compress.push(cBody);
            });
            yield client.query(`UPDATE metadata SET has_pose = TRUE, pose_done = TRUE, compress_pose = '${JSON.stringify(compress)}', abs_pose = '${JSON.stringify(req.body.data)}', rel_pose = '${JSON.stringify(rel)}' WHERE id = ${req.body.id}`);
        }
        else if (req.body.id !== 0 && req.body.id !== "0") {
            yield client.query(`UPDATE metadata SET pose_done = TRUE WHERE id = ${req.body.id}`);
        }
        const result = yield client.query(`SELECT id, download FROM metadata WHERE download IS NOT NULL AND image_problem IS NULL AND pose_done IS NULL AND id > ${req.body.id} ORDER BY id ASC LIMIT 1`);
        if ("rows" in result && result.rows.length >= 1) {
            res.end(JSON.stringify({ id: result.rows[0].id, image: result.rows[0].download }));
        }
        else {
            res.end(JSON.stringify({ message: "we are done" }));
        }
    }
    else {
        res.end(JSON.stringify({ message: "empty" }));
    }
}));
app.listen(5678, () => {
    console.log("Example app listening on port 5678!");
});
//# sourceMappingURL=process.js.map