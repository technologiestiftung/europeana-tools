import { readFileSync } from "fs";
import { Client } from "pg";
import * as request from "request";
import { StringDecoder } from "string_decoder";

const config = JSON.parse(readFileSync("../config.json", "utf8"));
const params = JSON.parse(readFileSync("../scrape_params.json", "utf8"));

const client = new Client(config.db);
client.connect();

function buildUrl(fncConfig: {api: {public_key: string}}, fncParams: {MEDIA: string}, cursor: string = "*"): string {
    return `https://www.europeana.eu/api/v2/search.json` +
        `?media=${fncParams.MEDIA}` +
        `&query=*` +
        `&wskey=${fncConfig.api.public_key}` +
        `&rows=2` +
        `&profile=rich` +
        `&cursor=${cursor}`;
}

function clStr( str: string): string {
  return str.split("'").join("\'");
}

function getData() {
  request(buildUrl(config, params), (err: string, res: object, body: string) => {
    if (err) { throw err; }

    const data = JSON.parse(body);

    /*
     * # Records Table
     * Inserting basic information about each object, ids etc.
     */

    // attribute name in data JSON, data type, if column name different from attribute in database
    const columns = [
      ["id", "s", "europeana_id"],
      ["guid", "s"],
      ["link", "s"],
      ["previewNoDistribute", "b", "preview_no_distribute"],
      ["europeanaCompleteness", "i", "europeana_completeness"],
      ["score", "f"],
      ["timestamp", "i"],
      ["timestamp_created", "t"],
      ["timestamp_created_epoch", "i"],
      ["timestamp_update", "t"],
      ["timestamp_update_epoch", "i"],
      ["type", "s"],
    ];

    const columnString = columns.map( (d) => {
      return (d.length === 3) ? d[2] : d[0];
    }).join(",");

    const valueString = data.items.map( (d) => {
      return "(" + columns.map( (c) => {
        if (d[c[0]] === undefined || !(c[0] in d)) {
          return "''";
        } else if (["i", "b", "f"].indexOf(c[1]) >= 0) {
          return d[c[0]];
        } else {
          return "'" + d[c[0]].split("'").join("\'") + "'";
        }
      }).join(",") + ")";
    }).join(",");

    client.query(`INSERT INTO records(${columnString}) VALUES ${valueString}`)
      .then( () => {
          process.stdout.write("INSERT GOOD");
      })
      .catch((error) => {
          throw error;
      });

    /*
     * # MetaData Table
     * Additional metadata is stored as key value pairs
     */

    const metaValueString = [];
    const metaNotInclude = columns.map( (d) => d[0]);

    data.items.forEach( (item) => {
      for (const key in item) {
        if (metaNotInclude.indexOf(key) === -1) {
          if ( Array.isArray(item[key]) ) {
            item[key].forEach( (a, ai) => {
              const metaValue = (typeof a === "string") ? clStr(a) : a;
              metaValueString.push(`('${item.id}','${key}','${metaValue}','',${ai})`);
            });
          } else if ((typeof item[key]) === "object") {
            let objI = 0;
            for (const objKey of Object.keys(item[key])) {
              const metaValue = (typeof item[key][objKey][0] === "string") ? clStr(item[key][objKey][0]) : item[key][objKey][0];
              metaValueString.push(`('${item.id}','${key}','${metaValue}','${objKey}',${objI})`);
              objI++;
            }
          } else {
            const metaValue = (typeof item[key] === "string") ? clStr(item[key]) : item[key];
            metaValueString.push(`('${item.id}','${key}','${metaValue}','',0)`);
          }
        }
      }
    });

    client.query(`INSERT INTO metadata(europeana_id, key, value, param, sort) VALUES ${metaValueString.join(",")}`)
      .then( () => {
          process.stdout.write("INSERT META GOOD");
      })
      .catch((error) => {
          throw error;
      });

  });
}

getData();
