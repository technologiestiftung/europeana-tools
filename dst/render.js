"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const canvas_1 = require("canvas");
const fs = require("fs");
const out = fs.createWriteStream("export/print.png");
const canvas = canvas_1.createCanvas(2526, 1785);
const ctx = canvas.getContext("2d");
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
const scaleFactor = (image, maxWidth, maxHeight) => {
    const scaleWidth = maxWidth / image.width;
    const scaleHeight = maxHeight / image.height;
    let scale = scaleWidth;
    let poseScale = 1 / 700 * maxWidth;
    if (scaleWidth > scaleHeight) {
        scale = scaleHeight;
        poseScale = 1 / 700 * maxHeight;
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
Promise.all([
    canvas_1.loadImage("assets/images/print_bg.png"),
    canvas_1.loadImage("assets/images/people.jpeg"),
    canvas_1.loadImage("assets/images/people.jpg"),
    getData("assets/images/people-jpeg.json", "utf8"),
    getData("assets/images/people-jpg.json", "utf8"),
]).then((images) => {
    ctx.drawImage(images[0], 0, 0, 2526, 1785);
    const scale1 = scaleFactor(images[1], 285 * 3, 371 * 3);
    const scale2 = scaleFactor(images[2], 285 * 3, 371 * 3);
    const gap = (1830 - images[1].width * scale1[0] - images[2].width * scale2[0]) / 2;
    ctx.drawImage(images[1], 29 * 3, 125 * 3, images[1].width * scale1[0], images[1].height * scale1[0]);
    ctx.rect(29 * 3, 125 * 3, images[1].width * scale1[0], images[1].height * scale1[0]);
    ctx.strokeStyle = "rgba(0,0,0,1)";
    ctx.lineWidth = 2;
    ctx.stroke();
    const pose1 = JSON.parse(images[3]);
    drawPose(pose1[0], 29 * 3, 125 * 3, scale1[1], ctx);
    ctx.drawImage(images[2], 29 * 3 + images[1].width * scale1[0] + gap, 125 * 3, images[2].width * scale2[0], images[2].height * scale2[0]);
    ctx.rect(29 * 3 + images[1].width * scale1[0] + gap, 125 * 3, images[2].width * scale2[0], images[2].height * scale2[0]);
    ctx.strokeStyle = "rgba(0,0,0,1)";
    ctx.lineWidth = 2;
    ctx.stroke();
    const pose2 = JSON.parse(images[4]);
    drawPose(pose2[0], 29 * 3 + images[1].width * scale1[0] + gap, 125 * 3, scale2[1], ctx);
    ctx.fillStyle = "rgba(0,0,0,1)";
    // Funding text
    ctx.font = "24px \"ClanCompPro-Book\"";
    wrapText(ctx, "Dieses Projekt der Technologiestiftung Berlin wird gefördert \
von der Senatsverwaltung für Kultur und Europa.", 259 * 3, 550 * 3, 240 * 3, 35);
    let lastY = wrapText(ctx, "Titel", 639 * 3, 131 * 3, 145 * 3, 35);
    ctx.font = "24px \"ClanCompPro-Bold\"";
    lastY = wrapText(ctx, "Ein sehr schöner Titel eines Werkes", 639 * 3, lastY, 145 * 3, 35);
    ctx.font = "24px \"ClanCompPro-Book\"";
    lastY = wrapText(ctx, "Museum", 639 * 3, lastY + 35, 145 * 3, 35);
    ctx.font = "24px \"ClanCompPro-Bold\"";
    lastY = wrapText(ctx, "Berlinische Gallerie", 639 * 3, lastY, 145 * 3, 35);
    ctx.font = "24px \"ClanCompPro-Book\"";
    lastY = wrapText(ctx, "Quelle:", 639 * 3, lastY + 35, 145 * 3, 35);
    ctx.font = "24px \"ClanCompPro-Bold\"";
    lastY = wrapText(ctx, "Europeana, 2019", 639 * 3, lastY, 145 * 3, 35);
    ctx.font = "24px \"ClanCompPro-Book\"";
    lastY = wrapText(ctx, "Die Europeana ist eine offene Datenbank, entwickelt um das \
kulturelle Erbe Europas verfügbar zu machen. Mit Hilfe von Verfahren aus \
dem Bereich der künstlichen Intelligenz, haben wir die Bilder von Berliner \
Institutionen in der Europeana analysiert und eine interaktive Anwendung \
entwickelt, welche es Besucher*innen erlaubt Bilder basierend auf der \
eigenen Pose zu finden. Das hier gezeigte Experiment ist ein Beispiel für \
neue Ansätze, wie das kulturelle Erbe der Hauptstadt zugänglich und erlebbar \
gemacht werden kann.", 639 * 3, lastY + 70, 145 * 3, 35);
    lastY = wrapText(ctx, "Erfahren Sie mehr über das Projekt kulturBdigital unter:", 639 * 3, lastY + 70, 145 * 3, 35);
    ctx.font = "24px \"ClanCompPro-Bold\"";
    wrapText(ctx, "https://kultur-b-digital.de", 639 * 3, lastY, 145 * 3, 35);
    const stream = canvas.createPNGStream();
    stream.pipe(out);
    out.on("finish", () => console.log("The PNG file was created."));
});
//# sourceMappingURL=render.js.map