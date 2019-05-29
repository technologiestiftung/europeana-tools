var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "/web_modules/@tensorflow-models/posenet.js", "/web_modules/d3.js", "/web_modules/vptree.js", "/web_modules/compute-cosine-similarity.js"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var posenet = require("/web_modules/@tensorflow-models/posenet.js");
    var d3 = require("/web_modules/d3.js");
    var VPTreeFactory = require("/web_modules/vptree.js");
    var similarity = require("/web_modules/compute-cosine-similarity.js");
    // posenet config
    var multiplier = 0.75;
    var flipHorizontal = false;
    var outputStride = 8;
    var imageScaleFactor = 1;
    var net;
    var video;
    var svg;
    var poses;
    var pose_keys = {};
    var vptree;
    var videoWidth = 640; // 1280
    var videoHeight = 360; // 720
    function cosineDistanceMatching(poseVector1, poseVector2) {
        var cosineSimilarity = similarity(poseVector1, poseVector2);
        var distance = 2 * (1 - cosineSimilarity);
        return Math.sqrt(distance);
    }
    function setup() {
        return __awaiter(this, void 0, void 0, function () {
            var poseData, stream;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                            throw new Error("Browser API navigator.mediaDevices.getUserMedia not available");
                        }
                        poseData = [];
                        poses.forEach(function (p, pi) {
                            p.poses.forEach(function (pp) {
                                poseData.push(pp);
                                pose_keys[poseData.length - 1] = pi;
                            });
                        });
                        vptree = VPTreeFactory.build(poseData, cosineDistanceMatching);
                        svg = d3.select("body").append("svg")
                            .attr("width", videoWidth)
                            .attr("height", videoHeight);
                        video = document.getElementById("video");
                        video.width = videoWidth;
                        video.height = videoHeight;
                        return [4 /*yield*/, posenet.load(multiplier)];
                    case 1:
                        // load posenet
                        net = _a.sent();
                        return [4 /*yield*/, navigator.mediaDevices.getUserMedia({
                                audio: false,
                                video: {
                                    facingMode: "user",
                                    height: videoHeight,
                                    width: videoWidth,
                                },
                            })];
                    case 2:
                        stream = _a.sent();
                        video.srcObject = stream;
                        video.onloadedmetadata = function () {
                            video.play();
                            detectPose();
                        };
                        return [2 /*return*/];
                }
            });
        });
    }
    var getPart = function (arr, key) {
        var r = { x: 0, y: 0 };
        arr.forEach(function (a) {
            if (a.part === key) {
                r = a.position;
            }
        });
        return r;
    };
    var pairs = [
        ["nose", "leftEye"],
        ["nose", "rightEye"],
        ["leftEar", "leftEye"],
        ["rightEar", "rightEye"],
        ["leftShoulder", "rightShoulder"],
        ["leftShoulder", "leftElbow"],
        ["rightElbow", "rightShoulder"],
        ["leftWrist", "leftElbow"],
        ["rightElbow", "rightWrist"],
        ["leftHip", "rightHip"],
        ["leftHip", "leftKnee"],
        ["rightKnee", "rightHip"],
        ["leftAnkle", "leftKnee"],
        ["rightKnee", "rightAnkle"],
    ];
    function detectPose() {
        return __awaiter(this, void 0, void 0, function () {
            var resp, highestScore, highestPose, _loop_1, i, cBody, minX, minY, maxX, maxY, width, height, nearestImage, groups;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, net.estimateMultiplePoses(video, imageScaleFactor, flipHorizontal, outputStride)];
                    case 1:
                        resp = _a.sent();
                        highestScore = -Number.MAX_VALUE;
                        _loop_1 = function (i) {
                            if (resp[i].score < 0.1) {
                                resp.splice(i, 1);
                            }
                            else {
                                if (resp[i].score > highestScore) {
                                    highestScore = resp[i].score;
                                    highestPose = resp[i];
                                }
                                resp[i].pairs = [];
                                pairs.forEach(function (p) {
                                    var p1 = getPart(resp[i].keypoints, p[0]);
                                    var p2 = getPart(resp[i].keypoints, p[1]);
                                    resp[i].pairs.push([p1.x, p1.y, p2.x, p2.y]);
                                });
                            }
                        };
                        // remove poses with low probability
                        for (i = resp.length - 1; i >= 0; i--) {
                            _loop_1(i);
                        }
                        cBody = [];
                        minX = Number.MAX_VALUE;
                        minY = Number.MAX_VALUE;
                        maxX = -Number.MAX_VALUE;
                        maxY = -Number.MAX_VALUE;
                        highestPose.keypoints.forEach(function (point) {
                            if (point.position.x > maxX) {
                                maxX = point.position.x;
                            }
                            if (point.position.y > maxY) {
                                maxY = point.position.y;
                            }
                            if (point.position.x < minX) {
                                minX = point.position.x;
                            }
                            if (point.position.y < minY) {
                                minY = point.position.y;
                            }
                        });
                        width = maxX - minX;
                        height = maxY - minY;
                        highestPose.keypoints.forEach(function (point) {
                            cBody.push((point.position.x - minX) / width);
                            cBody.push((point.position.y - minY) / height);
                        });
                        nearestImage = vptree.search(cBody);
                        console.log(nearestImage);
                        svg.selectAll("*").remove();
                        groups = svg.selectAll("g").data(resp).enter().append("g");
                        groups.selectAll("circle").data(function (d) { return d.keypoints; }).enter().append("circle")
                            .attr("cx", function (d) { return d.position.x; })
                            .attr("cy", function (d) { return d.position.y; })
                            .attr("r", function (d) { return 5; })
                            .style("fill", function (d) { return "rgba(255,0,0," + d.score + ")"; });
                        groups.selectAll("line").data(function (d) { return d.pairs; }).enter().append("line")
                            .attr("x1", function (d) { return d[0]; })
                            .attr("y1", function (d) { return d[1]; })
                            .attr("x2", function (d) { return d[2]; })
                            .attr("y2", function (d) { return d[3]; });
                        window.requestAnimationFrame(detectPose);
                        return [2 /*return*/];
                }
            });
        });
    }
    d3.json("poses.json")
        .then(function (importPoses) {
        poses = importPoses;
        setup();
    })
        .catch(function (err) {
        throw err;
    });
});
//# sourceMappingURL=cam.js.map