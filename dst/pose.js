"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("@tensorflow/tfjs-node");
var canvas_1 = require("canvas");
var fs = require("fs");
var posenet = require("@tensorflow-models/posenet");
var xhr2 = require("xhr2");
global.XMLHttpRequest = xhr2;
var getData = function (fileName) {
    return new Promise(function (resolve, reject) {
        fs.readFile(fileName, function (err, data) {
            err ? reject(err) : resolve(data);
        });
    });
};
var imageScaleFactor = 0.5;
var flipHorizontal = false;
var outputStride = 8;
var multiplier = 0.5;
var net = null;
posenet.load(multiplier)
    .then(function (tNet) {
    net = tNet;
    return getData("./assets/images/people.jpg");
})
    .then(function (buffer) {
    var img = new canvas_1.Image();
    img.src = buffer;
    var canvas = canvas_1.createCanvas(img.width, img.height);
    canvas.getContext("2d").drawImage(img, 0, 0);
    return net.estimateMultiplePoses(canvas, imageScaleFactor, flipHorizontal, outputStride);
}).then(function (pose) {
    fs.writeFileSync("./assets/images/people.json", JSON.stringify(pose), "utf8");
});
//# sourceMappingURL=pose.js.map