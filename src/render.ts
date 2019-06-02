import { createCanvas, loadImage, PNGStream } from "canvas";
import * as fs from "fs";

const out = fs.createWriteStream("export/print.png");

const canvas = createCanvas(2526, 1785);
const ctx = canvas.getContext("2d");

 // Draw line under text
// var text = ctx.measureText('Awesome!')
// ctx.strokeStyle = 'rgba(0,0,0,0.5)'
// ctx.beginPath()
// ctx.lineTo(50, 102)
// ctx.lineTo(50 + text.width, 102)
// ctx.stroke()

// Source: https://codepen.io/bramus/pen/eZYqoO
function wrapText(context, text, x, y, maxWidth, lineHeight) {
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
    } else {
      line = testLine;
    }
  }
  context.fillText(line, x, y);

  return y + lineHeight;
}

const scaleFactor = (image, maxWidth, maxHeight) => {
  const scaleWidth = maxWidth / image.width;
  const scaleHeight = maxHeight / image.height;
  let scale = scaleWidth;

  if ( scaleWidth > scaleHeight ) {
    scale = scaleHeight;
  }

  const poseScaleWidth = maxWidth / 700;
  const poseScaleHeight = maxHeight / 700;
  let poseScale = poseScaleWidth;

  if ( poseScaleWidth > poseScaleHeight ) {
    poseScale = poseScaleHeight;
  }

  return [scale, poseScale];
};

// Load the background

Promise.all([
  loadImage("assets/images/print_bg.png"),
  loadImage("assets/images/people.jpeg"),
  loadImage("assets/images/people.jpg"),
]).then((images) => {
  ctx.drawImage(images[0], 0, 0, 2526, 1785);

  const scale1 = scaleFactor(images[1], 285 * 3, 371 * 3);
  const scale2 = scaleFactor(images[2], 285 * 3, 371 * 3);

  const gap = (1830 - images[1].width * scale1[0] - images[2].width * scale2[0]) / 2;

  ctx.drawImage(images[1], 29 * 3, 125 * 3, images[1].width * scale1[0], images[1].height * scale1[0]);
  ctx.rect(29 * 3, 125 * 3, images[1].width * scale1[0], images[1].height * scale1[0]);
  ctx.stroke();

  ctx.drawImage(images[2], 29 * 3 + images[1].width * scale1[0] + gap, 125 * 3, images[2].width * scale2[0], images[2].height * scale2[0]);
  ctx.rect(29 * 3 + images[1].width * scale1[0] + gap, 125 * 3, images[2].width * scale2[0], images[2].height * scale2[0]);
  ctx.stroke();

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

  lastY = wrapText(ctx, "Erfahren Sie mehr über das Projekt kulturBdigital unter:",
    639 * 3, lastY + 70, 145 * 3, 35);

  ctx.font = "24px \"ClanCompPro-Bold\"";

  wrapText(ctx, "https://kultur-b-digital.de",
    639 * 3, lastY, 145 * 3, 35);

  const stream = canvas.createPNGStream();
  stream.pipe(out);
  out.on("finish", () => console.log("The PNG file was created."));
});
