"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var pg_1 = require("pg");
var request = require("request");
var config = JSON.parse(fs_1.readFileSync("../config.json", "utf8"));
var params = JSON.parse(fs_1.readFileSync("../scrape_params.json", "utf8"));
var client = new pg_1.Client(config.db);
client.connect();
function buildUrl(fncConfig, fncParams, cursor) {
    if (cursor === void 0) { cursor = "*"; }
    return "https://www.europeana.eu/api/v2/search.json" +
        ("?media=" + fncParams.MEDIA) +
        "&query=*" +
        ("&wskey=" + fncConfig.api.public_key) +
        "&rows=2" +
        "&profile=rich" +
        ("&cursor=" + cursor);
}
function clStr(str) {
    return str.split("'").join("\'");
}
function getData() {
    request(buildUrl(config, params), function (err, res, body) {
        if (err) {
            throw err;
        }
        var data = JSON.parse(body);
        /*
         * # Records Table
         * Inserting basic information about each object, ids etc.
         */
        // attribute name in data JSON, data type, if column name different from attribute in database
        var columns = [
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
        var columnString = columns.map(function (d) {
            return (d.length === 3) ? d[2] : d[0];
        }).join(",");
        var valueString = data.items.map(function (d) {
            return "(" + columns.map(function (c) {
                if (d[c[0]] === undefined || !(c[0] in d)) {
                    return "''";
                }
                else if (["i", "b", "f"].indexOf(c[1]) >= 0) {
                    return d[c[0]];
                }
                else {
                    return "'" + d[c[0]].split("'").join("\'") + "'";
                }
            }).join(",") + ")";
        }).join(",");
        client.query("INSERT INTO records(" + columnString + ") VALUES " + valueString)
            .then(function () {
            process.stdout.write("INSERT GOOD");
        })
            .catch(function (error) {
            throw error;
        });
        /*
         * # MetaData Table
         * Additional metadata is stored as key value pairs
         */
        var metaValueString = [];
        var metaNotInclude = columns.map(function (d) { return d[0]; });
        data.items.forEach(function (item) {
            var _loop_1 = function (key) {
                if (metaNotInclude.indexOf(key) === -1) {
                    if (Array.isArray(item[key])) {
                        item[key].forEach(function (a, ai) {
                            var metaValue = (typeof a === "string") ? clStr(a) : a;
                            metaValueString.push("('" + item.id + "','" + key + "','" + metaValue + "',''," + ai + ")");
                        });
                    }
                    else if ((typeof item[key]) === "object") {
                        var objI = 0;
                        for (var _i = 0, _a = Object.keys(item[key]); _i < _a.length; _i++) {
                            var objKey = _a[_i];
                            var metaValue = (typeof item[key][objKey][0] === "string") ? clStr(item[key][objKey][0]) : item[key][objKey][0];
                            metaValueString.push("('" + item.id + "','" + key + "','" + metaValue + "','" + objKey + "'," + objI + ")");
                            objI++;
                        }
                    }
                    else {
                        var metaValue = (typeof item[key] === "string") ? clStr(item[key]) : item[key];
                        metaValueString.push("('" + item.id + "','" + key + "','" + metaValue + "','',0)");
                    }
                }
            };
            for (var key in item) {
                _loop_1(key);
            }
        });
        client.query("INSERT INTO metadata(europeana_id, key, value, param, sort) VALUES " + metaValueString.join(","))
            .then(function () {
            process.stdout.write("INSERT META GOOD");
        })
            .catch(function (error) {
            throw error;
        });
    });
}
getData();
//# sourceMappingURL=index.js.map