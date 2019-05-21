import * as posenet from "@tensorflow-models/posenet";
import * as tf from "@tensorflow/tfjs";

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
            } else {
                console.log("Looks like we are done here!");
            }

        } else {
            console.log("SHIT");
        }
    };
    xhr.send(JSON.stringify({data, id}));
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
    imageElement.onload = async () => {

        const input = tf.browser.fromPixels(imageElement);
        const resp = await net.estimatePoses(input, {
            decodingMethod: "multi-person",
            flipHorizontal,
            imageScaleFactor,
            multiplier,
            outputStride,
        });

        console.log(resp);

        // window.requestAnimationFrame(function(){ sendReceive(resp, id);});
    };
}

export function start() {
    posenet
        .load(multiplier)
        .then((pnet) => {
            net = pnet;
            sendReceive([], 0);
        });
}
