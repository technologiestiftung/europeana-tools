// require("@tensorflow/tfjs-node");

import * as posenet from "@tensorflow-models/posenet";
import {createCanvas, Image} from "canvas";
import * as fs from "fs";
import * as fetch from "node-fetch";
import * as tf from "@tensorflow/tfjs";
import * as xhr2 from "xhr2";
(global as any).XMLHttpRequest = xhr2;

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
  .then((buffer: Buffer) => {
    const img = new Image();
    img.src = buffer;
    const canvas = createCanvas(img.width, img.height);
    canvas.getContext("2d").drawImage(img, 0, 0);
    return net.estimateMultiplePoses(canvas, imageScaleFactor, flipHorizontal, outputStride);
  }).then((pose) => {
    fs.writeFileSync("./assets/images/people.json", JSON.stringify(pose), "utf8");
  });
