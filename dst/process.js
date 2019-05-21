"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var bodyParser = require("body-parser");
var express = require("express");
var fs = require("fs");
var pg_1 = require("pg");
var config = JSON.parse(fs.readFileSync("config.json", "utf8"));
var client = new pg_1.Pool(config.db);
client.connect();
var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    //intercepts OPTIONS method
    if ('OPTIONS' === req.method) {
        //respond with 200
        res.send(200);
    }
    else {
        //move on
        next();
    }
});
app.use(function (req, res) {
    res.setHeader("Content-Type", "text/plain");
    console.log(req.body);
    if ("body" in req && "data" in req.body) {
        if (req.body.data.length >= 1) {
            var rel = JSON.parse(JSON.stringify(req.body.data));
            rel.forEach(function (body) {
                var minX = Number.MAX_VALUE;
                var minY = Number.MAX_VALUE;
                var maxX = -Number.MAX_VALUE;
                var maxY = -Number.MAX_VALUE;
                body.keypoints.forEach(function (point) {
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
                var width = maxX - minX;
                var height = maxY - minY;
                body.keypoints.forEach(function (point) {
                    point.position.x = (point.position.x - minX) / width;
                    point.position.x = (point.position.x - minY) / height;
                });
            });
            client.query("UPDATE metadata SET hasPose = TRUE, absPose = '" + req.body.data + "', relPose = '" + rel + "' WHERE id = " + req.body.id);
        }
        client.query("SELECT id, download FROM metadata WHERE download IS NOT NULL AND image_problem IS NULL AND id > " + req.body.id + " ORDER BY id ASC LIMIT 1")
            .then(function (result) {
            if ("rows" in result && result.rows.length >= 1) {
                res.end(JSON.stringify({ id: result.rows[0].id, image: result.rows[0].download }));
            }
            else {
                res.end(JSON.stringify({ message: "we are done" }));
            }
        });
    }
    else {
        res.end(JSON.stringify({ message: "empty" }));
    }
});
app.listen(5678, function () {
    console.log("Example app listening on port 5678!");
});
//# sourceMappingURL=process.js.map