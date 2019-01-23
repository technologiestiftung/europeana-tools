import { readFileSync } from "fs";
import { Client } from "pg";
import * as pgFormat from "pg-format";
import * as readLine from "readline";
import * as request from "request";
import { StringDecoder } from "string_decoder";

const config = JSON.parse(readFileSync("../config.json", "utf8"));
const params = JSON.parse(readFileSync("../scrape_params.json", "utf8"));

const client = new Client(config.db);
client.connect();

// Check if tables exists, create if not...

// Temporary table for cursor storage and retrieval
client.query("CREATE TABLE IF NOT EXISTS temp ( \
id SERIAL PRIMARY KEY,\
key text,\
value text,\
created timestamp without time zone DEFAULT CURRENT_TIMESTAMP )");

client.query("CREATE UNIQUE INDEX IF NOT EXISTS temp_pkey ON temp(id int4_ops)");

// Table for storing identifiers and basics for each record
client.query(`CREATE TABLE IF NOT EXISTS records (\
id SERIAL PRIMARY KEY,\
guid text,\
europeana_id text,\
link text,\
preview_no_distribute boolean,\
score double precision,\
timestamp bigint,\
timestamp_created timestamp without time zone,\
timestamp_created_epoch bigint,\
timestamp_update timestamp without time zone,\
timestamp_update_epoch bigint,\
type text,\
added_to_db timestamp without time zone DEFAULT CURRENT_TIMESTAMP,\
europeana_completeness integer\
)`);

client.query("CREATE UNIQUE INDEX IF NOT EXISTS records_pkey ON records(id int4_ops)");

// Table for storing additional metadata for each record

client.query(`CREATE TABLE IF NOT EXISTS metadata (\
id SERIAL PRIMARY KEY,\
europeana_id text NOT NULL,\
key text,\
param text,\
value text,\
sort integer\
)`);

client.query("CREATE UNIQUE INDEX IF NOT EXISTS metadata_pkey ON metadata(id int4_ops)");

// If the --flush argument is provided empty all tables before giving it a fresh start
if (process.argv.indexOf("--flush") > 1) {
  client.query(`TRUNCATE temp RESTART IDENTITY CASCADE`);
  client.query(`TRUNCATE records RESTART IDENTITY CASCADE`);
  client.query(`TRUNCATE metadata RESTART IDENTITY CASCADE`);
}

function buildUrl(fncConfig: {api: {public_key: string}},
                  fncParams: {DATA_PROVIDER: string[], TYPE: string[], MEDIA: string, per_page: number},
                  cursor: string = "*"): string {
    return `https://www.europeana.eu/api/v2/search.json\
?media=${fncParams.MEDIA}\
&type=${fncParams.TYPE[0]}\
&query=*\
&wskey=${fncConfig.api.public_key}\
&rows=${fncParams.per_page}\
&qf=DATA_PROVIDER:${encodeURIComponent("\"" + fncParams.DATA_PROVIDER[providerCount] + "\"")}\
&profile=rich\
&cursor=${encodeURIComponent(cursor)}`;
}

let loopCount = 0;
let providerCount = 0;

function getData(cursor: string = "*") {
  request(buildUrl(config, params, cursor), (err: string, res: object, body: string) => {
    if (err) { throw err; }

    const data = JSON.parse(body);

    readLine.cursorTo(process.stdout, 0);
    process.stdout.write(`Provider: ${providerCount} of ${params.DATA_PROVIDER.length} | \
Current Loop: ${loopCount} | \
Total: ${data.totalResults}`);

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
          return pgFormat("%L", d[c[0]]);
        }
      }).join(",") + ")";
    }).join(",");

    client.query(`INSERT INTO records(${columnString}) VALUES ${valueString}`)
      .then( () => {
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
                    metaValueString.push(pgFormat("(%L, %L, %L, '', %s)", item.id, key, a, ai));
                  });
                } else if ((typeof item[key]) === "object") {
                  let objI = 0;
                  for (const objKey of Object.keys(item[key])) {
                    metaValueString.push(pgFormat("(%L, %L, %L, %L, %s)", item.id, key, item[key][objKey][0], objKey, objI));
                    objI++;
                  }
                } else {
                  metaValueString.push(pgFormat("(%L, %L, %L, '', %s)", item.id, key, item[key], 0));
                }
              }
            }
          });

          client.query(`INSERT INTO metadata(europeana_id, key, value, param, sort) VALUES ${metaValueString.join(",")}`)
            .then( () => {
                // Looks like we successfully inserted everything into the tables, let's store the next cursor for backup purposes
                client.query(`INSERT INTO temp(value,key) VALUES ('${data.nextCursor}','cursor'), ('${providerCount}','provider')`)
                  .then( () => {
                    // I could calculate the position of the cursor, but if the list size equals max list size, its likely there is more
                    if (data.itemsCount === params.per_page) {
                      loopCount++;
                      // Go to the next cursor
                      getData(data.nextCursor);
                    } else {
                      if (providerCount + 1 < params.DATA_PROVIDER.length) {
                        providerCount++;
                        loopCount = 0;
                        getData();
                      } else {
                        process.exit();
                      }
                    }
                  })
                  .catch((error) => {
                      throw error;
                  });
            })
            .catch((error) => {
                throw error;
            });
      })
      .catch((error) => {
          throw error;
      });

  });
}

// If the recover argument is passed, the script tries to recover the last stored cursor and start from there
if (process.argv.indexOf("--recover") > 1) {
  client.query(`SELECT \
(SELECT value FROM temp WHERE key = 'cursor' ORDER BY id DESC LIMIT 1) AS cursor, \
(SELECT value FROM temp WHERE key = 'provider' ORDER BY id DESC LIMIT 1) AS provider`)
    .then((res) => {
      providerCount = parseInt(res.rows[0].provider, 10);
      getData(res.rows[0].cursor);
    })
    .catch((e) => process.stderr.write(e.stack));
} else {
  getData();
}
