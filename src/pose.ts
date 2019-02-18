import * as XMLHttpRequest from "xhr2";
(global as any).XMLHttpRequest = XMLHttpRequest;

import * as posenet from "@tensorflow-models/posenet";
import * as tf from "@tensorflow/tfjs-node";
import {createCanvas, Image} from "canvas";
import { readdirSync, readFileSync } from "fs";
import * as jpeg from "jpeg-js";

const config = JSON.parse(readFileSync("../config.json", "utf8"));

let net: posenet.PoseNet;
let files: string[];
let imageCount = 0;

const imageScaleFactor = 0.5; // 0.2 > 1.0
const outputStride = 8; // 32,16,8 > smaller better performance
const flipHorizontal = false; // mirror mode

const NUMBER_OF_CHANNELS = 3;

const readImage = (path) => {
  const buf = readFileSync(path);
  const pixels = jpeg.decode(buf, true);
  return pixels;
};

const imageByteArray = (image, numChannels) => {
  const pixels = image.data;
  const numPixels = image.width * image.height;
  const values = new Int32Array(numPixels * numChannels);

  for (let i = 0; i < numPixels; i++) {
    for (let channel = 0; channel < numChannels; ++channel) {
      values[i * numChannels + channel] = pixels[i * 4 + channel];
    }
  }

  return values;
};

const imageToInput = (image, numChannels) => {
  const values = imageByteArray(image, numChannels);
  const outShape = [image.height, image.width, numChannels];
  const input = tf.tensor3d(values, outShape, "int32");

  return input;
};

function processImage() {
    // const file = readFileSync(config.download + files[imageCount]);
    // const image = new Image();
    // image.src = Buffer.from(file).toString("base64");
    // const canvas = createCanvas(image.width, image.height);
    // canvas.getContext("2d").drawImage(image, 0, 0);

    // Make rectangular

    const image = readImage(config.download + files[imageCount]);
    const input = imageToInput(image, NUMBER_OF_CHANNELS);

    net.estimateSinglePose(input, imageScaleFactor, flipHorizontal, outputStride)
        .then((res) => {
            process.stdout.write("RESULT");
            imageCount++;
            process.stdout.write(JSON.stringify(res));
        }).catch((err) => {
            process.stdout.write("ERR");
            process.stderr.write(err);
        });
}

const extRegEx = /\.(?:jpg|jpeg|png|tiff|gif|bmp)$/;

posenet.load().then((loadedNet: posenet.PoseNet) => {
    net = loadedNet;
    files = readdirSync(config.download).filter( (f) => (f.match(extRegEx) === null) ? false : true );
    processImage();
}).catch((err) => {
    process.stderr.write(err);
});
