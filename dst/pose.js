"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var XMLHttpRequest = require("xhr2");
global.XMLHttpRequest = XMLHttpRequest;
var posenet = require("@tensorflow-models/posenet");
var tf = require("@tensorflow/tfjs-node");
var canvas_1 = require("canvas");
var fs_1 = require("fs");
var jpeg = require("jpeg-js");
var config = JSON.parse(fs_1.readFileSync("../config.json", "utf8"));
var net;
var files;
var imageCount = 0;
var imageScaleFactor = 0.5; // 0.2 > 1.0
var outputStride = 8; // 32,16,8 > smaller better performance
var flipHorizontal = false; // mirror mode
var NUMBER_OF_CHANNELS = 3;
var readImage = function (path) {
    var buf = fs.readFileSync(path);
    var pixels = jpeg.decode(buf, true);
    return pixels;
};
var imageByteArray = function (image, numChannels) {
    var pixels = image.data;
    var numPixels = image.width * image.height;
    var values = new Int32Array(numPixels * numChannels);
    for (var i = 0; i < numPixels; i++) {
        for (var channel = 0; channel < numChannels; ++channel) {
            values[i * numChannels + channel] = pixels[i * 4 + channel];
        }
    }
    return values;
};
var imageToInput = function (image, numChannels) {
    var values = imageByteArray(image, numChannels);
    var outShape = [image.height, image.width, numChannels];
    var input = tf.tensor3d(values, outShape, 'int32');
    return input;
};
function processImage() {
    var file = fs_1.readFileSync(config.download + files[imageCount]);
    var image = new canvas_1.Image();
    image.src = Buffer.from(file).toString("base64");
    var canvas = canvas_1.createCanvas(image.width, image.height);
    canvas.getContext("2d").drawImage(image, 0, 0);
    // Make rectangular
    net.estimateSinglePose(canvas, imageScaleFactor, flipHorizontal, outputStride)
        .then(function (res) {
        process.stdout.write("RESULT");
        imageCount++;
        process.stdout.write(JSON.stringify(res));
    }).catch(function (err) {
        process.stdout.write("ERR");
        process.stderr.write(err);
    });
}
var extRegEx = /\.(?:jpg|jpeg|png|tiff|gif|bmp)$/;
posenet.load().then(function (loadedNet) {
    net = loadedNet;
    files = fs_1.readdirSync(config.download).filter(function (f) { return (f.match(extRegEx) === null) ? false : true; });
    processImage();
}).catch(function (err) {
    process.stderr.write(err);
});
//# sourceMappingURL=pose.js.map