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
const posenet = require("@tensorflow-models/posenet");
const tf = require("@tensorflow/tfjs");
const url = "//localhost:5678/sendReceive";
function sendReceive(data, id) {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.onreadystatechange = () => {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const json = JSON.parse(xhr.responseText);
            if ("image" in json) {
                console.log(json.image);
                compute(json.image, json.id);
            }
            else {
                console.log("Looks like we are done here!");
            }
        }
        else {
            console.log("SHIT");
        }
    };
    xhr.send(JSON.stringify({ data, id }));
}
const multiplier = 0.5;
const imageScaleFactor = 0.5;
const flipHorizontal = false;
const outputStride = 8;
let net;
function compute(src, id) {
    const imageElement = new Image();
    const srcParts = src.split("europeana_downloads_complete/");
    imageElement.src = "http://127.0.0.1:9000/" + srcParts[srcParts.length - 1];
    imageElement.crossOrigin = "Anonymous";
    imageElement.onload = () => __awaiter(this, void 0, void 0, function* () {
        const input = tf.browser.fromPixels(imageElement);
        const resp = yield net.estimatePoses(input, {
            decodingMethod: "multi-person",
            flipHorizontal,
            imageScaleFactor,
            multiplier,
            outputStride,
        });
        console.log(resp);
        // window.requestAnimationFrame(function(){ sendReceive(resp, id);});
    });
}
function start() {
    posenet
        .load(multiplier)
        .then((pnet) => {
        net = pnet;
        sendReceive([], 0);
    });
}
exports.start = start;
//# sourceMappingURL=process_html.js.map