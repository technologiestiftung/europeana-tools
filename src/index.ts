import { readSync } from "fs";
import * as request from "request";

request("europeana", { json: true }, (err, res, body) => {
  if (err) { return console.log(err); }
});
