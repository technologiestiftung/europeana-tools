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
const canvas_1 = require("canvas");
const child_process_1 = require("child_process");
const express = require("express");
const fs = require("fs");
let images;
const app = express();
app.use(bodyParser.urlencoded({ extended: false, limit: "16mb" }));
app.use(bodyParser.json({ limit: "16mb" }));
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
app.post("/print", (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    const path = "temp.png";
    const imgdata = req.body.currentVideo;
    const base64Data = imgdata.replace(/^data:([A-Za-z-+/]+);base64,/, "");
    fs.writeFileSync(path, base64Data, { encoding: "base64" });
    const out = fs.createWriteStream("export/print.png");
    const canvas = canvas_1.createCanvas(2526, 1785);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(images[0], 0, 0, 2526, 1785);
    const images1 = yield canvas_1.loadImage("temp.png");
    const images2 = yield canvas_1.loadImage("dst/europeana_downloads_complete/" + req.body.id + ".jpg");
    const scale1 = scaleFactor(images1, 285 * 3, 371 * 3, 360, 640);
    const scale2 = scaleFactor(images2, 285 * 3, 371 * 3, 700, 700);
    const gap = (1830 - images1.width * scale1[0] - images2.width * scale2[0]) / 2;
    ctx.drawImage(images1, 29 * 3, 125 * 3, images1.width * scale1[0], images1.height * scale1[0]);
    ctx.rect(29 * 3, 125 * 3, images1.width * scale1[0], images1.height * scale1[0]);
    ctx.strokeStyle = "rgba(0,0,0,1)";
    ctx.lineWidth = 2;
    ctx.stroke();
    const pose1 = req.body.pose1;
    drawPose(pose1, 29 * 3, 125 * 3, scale1[1], ctx);
    ctx.drawImage(images2, 29 * 3 + images1.width * scale1[0] + gap, 125 * 3, images2.width * scale2[0], images2.height * scale2[0]);
    ctx.rect(29 * 3 + images1.width * scale1[0] + gap, 125 * 3, images2.width * scale2[0], images2.height * scale2[0]);
    ctx.strokeStyle = "rgba(0,0,0,1)";
    ctx.lineWidth = 2;
    ctx.stroke();
    const pose2 = req.body.pose2;
    drawPose(pose2, 29 * 3 + images1.width * scale1[0] + gap, 125 * 3, scale2[1], ctx);
    ctx.fillStyle = "rgba(0,0,0,1)";
    // Funding text
    ctx.font = "24px \"ClanCompPro-Book\"";
    wrapText(ctx, "Dieses Projekt der Technologiestiftung Berlin wird gefördert \
von der Senatsverwaltung für Kultur und Europa.", 259 * 3, 550 * 3, 240 * 3, 35);
    const colWidth = 165;
    let lastY = wrapText(ctx, "Titel", 639 * 3, 131 * 3, colWidth * 3, 35);
    ctx.font = "24px \"ClanCompPro-Bold\"";
    lastY = wrapText(ctx, req.body.title, 639 * 3, lastY, colWidth * 3, 35);
    ctx.font = "24px \"ClanCompPro-Book\"";
    lastY = wrapText(ctx, "Museum", 639 * 3, lastY + 35, colWidth * 3, 35);
    ctx.font = "24px \"ClanCompPro-Bold\"";
    lastY = wrapText(ctx, req.body.museum, 639 * 3, lastY, colWidth * 3, 35);
    ctx.font = "24px \"ClanCompPro-Book\"";
    lastY = wrapText(ctx, "Quelle:", 639 * 3, lastY + 35, colWidth * 3, 35);
    ctx.font = "24px \"ClanCompPro-Bold\"";
    lastY = wrapText(ctx, "Europeana, " + req.body.date, 639 * 3, lastY, colWidth * 3, 35);
    ctx.font = "24px \"ClanCompPro-Book\"";
    lastY = wrapText(ctx, "Die Europeana ist eine offene Datenbank, entwickelt um \
das kulturelle Erbe Europas verfügbar zu machen. Sie umfasst mittlerweile über \
50 Millionen Kunstwerke. Mit Hilfe von Verfahren aus dem Bereich der künstlichen \
Intelligenz, haben wir die Bilder von Berliner Kulturinstitutionen in der Europeana \
analysiert und eine interaktive Anwendung entwickelt, welche es Besucher*innen \
erlaubt, Bilder basierend auf der eigenen, zuvor fotografierten Pose, zu finden. \
Das hier gezeigte Experiment ist ein Beispiel für neue Ansätze, wie das kulturelle \
Erbe der Hauptstadt zugänglich und individuell erlebbar gemacht werden kann.", 639 * 3, lastY + 70, colWidth * 3, 35);
    lastY = wrapText(ctx, "Erfahren Sie mehr über das Projekt kulturBdigital unter:", 639 * 3, lastY + 70, colWidth * 3, 35);
    ctx.font = "24px \"ClanCompPro-Bold\"";
    wrapText(ctx, "https://kultur-b-digital.de", 639 * 3, lastY, colWidth * 3, 35);
    const stream = canvas.createPNGStream();
    stream.pipe(out);
    out.on("finish", () => {
        // ADD PATH TO PRINT.PNG
        child_process_1.exec("C:\\Users\\labrat\\Documents\\GitHub\\europeana-tools\\print.bat", { windowsHide: true }, (code, stdout, stderr) => {
            res.end(JSON.stringify({ message: "Printing..." }));
        });
    });
}));
// Source: https://codepen.io/bramus/pen/eZYqoO
const wrapText = (context, text, x, y, maxWidth, lineHeight) => {
    const words = text.split(" ");
    let line = "";
    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + " ";
        const metrics = context.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
            context.fillText(line, x, y);
            line = words[n] + " ";
            y += lineHeight;
        }
        else {
            line = testLine;
        }
    }
    context.fillText(line, x, y);
    return y + lineHeight;
};
const scaleFactor = (image, maxWidth, maxHeight, detectWidth, detectHeight) => {
    const scaleWidth = maxWidth / image.width;
    const scaleHeight = maxHeight / image.height;
    let scale = scaleWidth;
    let poseScale = 1 / detectWidth * maxWidth;
    if (scaleWidth > scaleHeight) {
        scale = scaleHeight;
        poseScale = 1 / detectHeight * maxHeight;
    }
    return [scale, poseScale];
};
const getData = (fileName, type) => {
    return new Promise((resolve, reject) => {
        fs.readFile(fileName, type, (err, data) => {
            err ? reject(err) : resolve(data);
        });
    });
};
const pairs = [
    ["nose", "leftEye"],
    ["nose", "rightEye"],
    ["leftEar", "leftEye"],
    ["rightEar", "rightEye"],
    ["leftShoulder", "rightShoulder"],
    ["leftShoulder", "leftElbow"],
    ["rightElbow", "rightShoulder"],
    ["leftWrist", "leftElbow"],
    ["rightElbow", "rightWrist"],
    ["leftShoulder", "leftHip"],
    ["rightShoulder", "rightHip"],
    ["leftHip", "rightHip"],
    ["leftHip", "leftKnee"],
    ["rightKnee", "rightHip"],
    ["leftAnkle", "leftKnee"],
    ["rightKnee", "rightAnkle"],
];
const getPart = (arr, key) => {
    let r = { x: 0, y: 0 };
    arr.forEach((a) => {
        if (a.part === key) {
            r = a.position;
        }
    });
    return r;
};
const drawPose = (pose, x, y, scale, context) => {
    context.strokeStyle = "rgba(216,36,42,1)";
    context.fillStyle = "rgba(30,55,144,1)";
    context.lineWidth = 5;
    const keyPairs = [];
    pairs.forEach((p) => {
        const p1 = getPart(pose.keypoints, p[0]);
        const p2 = getPart(pose.keypoints, p[1]);
        context.beginPath();
        context.moveTo(p1.x * scale + x, p1.y * scale + y);
        context.lineTo(p2.x * scale + x, p2.y * scale + y);
        context.stroke();
    });
    pose.keypoints.forEach((key) => {
        context.beginPath();
        context.arc(key.position.x * scale + x, key.position.y * scale + y, 5, 0, 2 * Math.PI);
        context.stroke();
        context.fill();
    });
};
// Load the background
const setup = () => {
    Promise.all([
        canvas_1.loadImage("assets/images/print_bg.png"),
    ]).then((importImages) => {
        images = importImages;
    }).catch((err) => {
        console.log("err", err);
    });
};
setup();
app.listen(5656, () => {
    process.stdout.write("Print App listening on port 5656!\n");
});
//# sourceMappingURL=render.js.map