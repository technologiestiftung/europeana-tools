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
const fs = require("fs");
const pg_1 = require("pg");
const request = require("request");
const util_1 = require("util");
const readFile = util_1.promisify(fs.readFile);
const config = JSON.parse(fs.readFileSync("config.json", "utf8"));
const client = new pg_1.Pool(config.db);
client.connect();
function asyncForEach(array, callback) {
    return __awaiter(this, void 0, void 0, function* () {
        for (let index = 0; index < array.length; index++) {
            yield callback(array[index], index, array);
        }
    });
}
client.query(`SELECT id, download, value FROM metadata WHERE download IS NOT NULL AND image_problem = TRUE`)
    .then((result) => {
    asyncForEach(result.rows, (r) => __awaiter(this, void 0, void 0, function* () {
        yield checkImage(r.download, r.id, r.value);
    }));
});
const checkImage = (imagePath, imageID, imageLocation) => {
    return readFile(imagePath, "utf8")
        .then((file) => {
        if (file.indexOf("<img src=\"") < 10) {
            const re = new RegExp("src=\"([^\"]+)\"");
            const imageUri = file.match(re)[1];
            process.stdout.write(imageLocation.substr(0, imageLocation.lastIndexOf("/")) + imageUri + "\n");
            return new Promise((resolve, reject) => {
                request
                    .get({
                    encoding: null,
                    // family: 4,
                    uri: imageLocation.substr(0, imageLocation.lastIndexOf("/")) + imageUri,
                })
                    .on("error", (err) => {
                    process.stdout.write(imagePath + err + "\n");
                    reject();
                })
                    .pipe(fs.createWriteStream(imagePath + ".bk.jpg"))
                    .on("close", () => {
                    process.stdout.write(imagePath + "\n");
                    resolve();
                })
                    .on("error", (err) => {
                    process.stdout.write(imagePath + err + "\n");
                    reject();
                });
            });
        }
        else {
            throw new Error("does not match");
        }
    })
        .catch((err) => {
        // Does not match this special case (likely a 404)
    });
};
//# sourceMappingURL=checkDownload-v3.js.map