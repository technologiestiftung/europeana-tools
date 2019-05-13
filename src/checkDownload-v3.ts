import * as fs from "fs";
import { Pool } from "pg";
import * as request from "request";
import { promisify } from "util";

const readFile = promisify(fs.readFile);

const config = JSON.parse(fs.readFileSync("config.json", "utf8"));

const client = new Pool(config.db);
client.connect();

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}

client.query(`SELECT id, download, value FROM metadata WHERE download IS NOT NULL AND image_problem = TRUE`)
    .then((result) => {

        asyncForEach(result.rows, async (r) => {
            await checkImage(r.download, r.id, r.value);
        });
       
    });

const checkImage = (imagePath: string, imageID: number, imageLocation: string) => {
    return readFile(imagePath, "utf8")
        .then((file) => {
            if (file.indexOf("<img src=\"") < 10) {
                const re = new RegExp("src=\"([^\"]+)\"");
                const imageUri = file.match(re)[1];

                console.log(imageLocation.substr(0, imageLocation.lastIndexOf("/")) + imageUri);

                return new Promise((resolve, reject) => {
                    request
                        .get({
                            encoding: null,
                            //family: 4,
                            uri: imageLocation.substr(0, imageLocation.lastIndexOf("/")) + imageUri,
                        })
                        .on("error", (err) => {
                            console.log(imagePath, err);
                            reject();
                        })
                        .pipe(fs.createWriteStream(imagePath + ".bk.jpg"))
                        .on("close", () => {
                            console.log(imagePath);
                            resolve();
                        })
                        .on("error", (err) => {
                            console.log(imagePath, err);
                            reject();
                        });
                });

            } else {
                throw new Error("does not match");
            }
        })
        .catch((err) => {
            // Does not match this special case (likely a 404)
        });
};
