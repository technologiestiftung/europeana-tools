"use strict";
// require("@tensorflow/tfjs-node");
Object.defineProperty(exports, "__esModule", { value: true });
const posenet = require("@tensorflow-models/posenet");
const canvas_1 = require("canvas");
const fs = require("fs");
const xhr2 = require("xhr2");
global.XMLHttpRequest = xhr2;
const getData = (fileName) => {
    return new Promise((resolve, reject) => {
        fs.readFile(fileName, (err, data) => {
            err ? reject(err) : resolve(data);
        });
    });
};
const imageScaleFactor = 0.5;
const flipHorizontal = false;
const outputStride = 8;
const multiplier = 0.5;
let net = null;
posenet.load(multiplier)
    .then((tNet) => {
    net = tNet;
    return getData("./assets/images/people.jpg");
})
    .then((buffer) => {
    const img = new canvas_1.Image();
    img.src = buffer;
    const canvas = canvas_1.createCanvas(img.width, img.height);
    canvas.getContext("2d").drawImage(img, 0, 0);
    return net.estimateMultiplePoses(canvas, imageScaleFactor, flipHorizontal, outputStride);
}).then((pose) => {
    fs.writeFileSync("./assets/images/people.json", JSON.stringify(pose), "utf8");
});
//# sourceMappingURL=pose.js.map