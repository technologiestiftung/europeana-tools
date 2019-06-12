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
        define(["require", "exports", "@tensorflow-models/posenet", "d3", "vptree"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var posenet = require("@tensorflow-models/posenet");
    var d3 = require("d3");
    // declare var d3: any;
    // declare var posenet: any;
    var VPTreeFactory = require("vptree");
    // import * as similarity from "compute-cosine-similarity";
    var isFunction = function (value) {
        return (typeof value === "function");
    };
    var isArray = function (value) {
        return Object.prototype.toString.call(value) === "[object Array]";
    };
    var dot = function (x, y, clbk) {
        if (!isArray(x)) {
            throw new TypeError("dot()::invalid input argument. First argument must be an array. Value: `" + x + "`.");
        }
        if (!isArray(y)) {
            throw new TypeError("dot()::invalid input argument. Second argument must be an array. Value: `" + y + "`.");
        }
        if (clbk) {
            if (!isFunction(clbk)) {
                throw new TypeError("dot()::invalid input argument. Accessor must be a function. Value: `" + clbk + "`.");
            }
        }
        var len = x.length;
        var sum = 0;
        var i;
        if (len !== y.length) {
            throw new Error("dot()::invalid input argument. Arrays must be of equal length.");
        }
        if (!len) {
            return null;
        }
        if (clbk) {
            for (i = 0; i < len; i++) {
                sum += clbk(x[i], i, 0) * clbk(y[i], i, 1);
            }
        }
        else {
            for (i = 0; i < len; i++) {
                sum += x[i] * y[i];
            }
        }
        return sum;
    };
    var l2norm = function (arr, clbk) {
        if (!isArray(arr)) {
            throw new TypeError("l2norm()::invalid input argument. Must provide an array.  Value: `" + arr + "`.");
        }
        if (clbk) {
            if (!isFunction(clbk)) {
                throw new TypeError("l2norm()::invalid input argument. Accessor must be a function. Value: `" + clbk + "`.");
            }
        }
        var len = arr.length;
        var t = 0;
        var s = 1;
        var r;
        var val;
        var abs;
        var i;
        if (!len) {
            return null;
        }
        if (clbk) {
            for (i = 0; i < len; i++) {
                val = clbk(arr[i], i);
                abs = (val < 0) ? -val : val;
                if (abs > 0) {
                    if (abs > t) {
                        r = t / val;
                        s = 1 + s * r * r;
                        t = abs;
                    }
                    else {
                        r = val / t;
                        s = s + r * r;
                    }
                }
            }
        }
        else {
            for (i = 0; i < len; i++) {
                val = arr[i];
                abs = (val < 0) ? -val : val;
                if (abs > 0) {
                    if (abs > t) {
                        r = t / val;
                        s = 1 + s * r * r;
                        t = abs;
                    }
                    else {
                        r = val / t;
                        s = s + r * r;
                    }
                }
            }
        }
        return t * Math.sqrt(s);
    };
    function partial(fn, j) {
        return function accessor(d, i) {
            return fn(d, i, j);
        };
    }
    function similarity(x, y, clbk) {
        var a;
        var b;
        var c;
        if (!isArray(x)) {
            throw new TypeError("cosine-similarity()::invalid input argument. First argument must be an array. Value: `" + x + "`.");
        }
        if (!isArray(y)) {
            throw new TypeError("cosine-similarity()::invalid input argument. Second argument must be an array. Value: `" + y + "`.");
        }
        if (arguments.length > 2) {
            if (!isFunction(clbk)) {
                throw new TypeError("cosine-similarity()::invalid input argument. Accessor must be a function. Value: `" + clbk + "`.");
            }
        }
        if (x.length !== y.length) {
            throw new Error("cosine-similarity()::invalid input argument. Input arrays must have the same length.");
        }
        if (!x.length) {
            return null;
        }
        if (clbk) {
            a = dot(x, y, clbk);
            b = l2norm(x, partial(clbk, 0));
            c = l2norm(y, partial(clbk, 1));
        }
        else {
            a = dot(x, y);
            b = l2norm(x);
            c = l2norm(y);
        }
        return a / (b * c);
    }
    // posenet config
    var multiplier = 0.75;
    var flipHorizontal = false;
    var outputStride = 8;
    var imageScaleFactor = 1;
    var net;
    var video;
    var svg;
    var images = [];
    var poses;
    var poseKeys = {};
    var vptree;
    var canvas = document.querySelector("#canvas");
    var context = canvas.getContext("2d");
    var earlyRefresh = 15 * 60 * 1000;
    var lateRefresh = 20 * 60 * 1000;
    var refreshTime = Date.now();
    var videoWidth = 640; // 1280
    var videoHeight = 360; // 720
    var windowHeight = window.innerHeight;
    var windowWidth = window.innerWidth;
    function cosineDistanceMatching(poseVector1, poseVector2) {
        var cosineSimilarity = similarity(poseVector1, poseVector2);
        var distance = 2 * (1 - cosineSimilarity);
        return Math.sqrt(distance);
    }
    var state = 1;
    var keyStart;
    var imageCount = 1;
    var imageMaxWidth = 0;
    var imageSpace = 20;
    var realVideoWidth;
    var currentPose;
    var currentPoseId;
    var currentPoseTitle;
    var currentPoseMuseum;
    var currentPoseDate;
    var currentVideo;
    var currentVideoPose;
    var titleContainer;
    var museumContainer;
    function setup() {
        return __awaiter(this, void 0, void 0, function () {
            var poseData, i, container, cImage, cSvg, stream, infoContainer;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                            throw new Error("Browser API navigator.mediaDevices.getUserMedia not available");
                        }
                        poseData = [];
                        poses.forEach(function (p, pi) {
                            p.poses.forEach(function (pp, ppi) {
                                poseData.push(pp);
                                poseKeys[poseData.length - 1] = [pi, ppi];
                            });
                        });
                        vptree = VPTreeFactory.build(poseData, cosineDistanceMatching);
                        realVideoWidth = windowHeight / videoWidth * videoHeight;
                        svg = d3.select("body").append("svg")
                            .attr("width", videoHeight)
                            .attr("height", videoWidth)
                            .style("height", windowHeight + "px")
                            .style("width", realVideoWidth + "px")
                            .attr("viewBox", "0 0 " + videoHeight + " " + videoWidth)
                            .attr("preserveAspectRatio", "xMinYMin meet");
                        imageMaxWidth = windowWidth - imageSpace - realVideoWidth;
                        return [4 /*yield*/, posenet.load(multiplier)];
                    case 1:
                        // load posenet
                        net = _a.sent();
                        video = document.getElementById("video");
                        video.width = videoWidth;
                        video.height = videoHeight;
                        d3.select("#video")
                            .style("width", windowHeight + "px")
                            .style("height", "auto");
                        d3.select("#background").style("display", "none");
                        for (i = 1; i <= imageCount; i += 1) {
                            container = d3.select("body")
                                .append("div").attr("id", "image" + i)
                                .style("left", realVideoWidth + imageSpace + "px");
                            cImage = container.append("img");
                            cSvg = container.append("svg")
                                .attr("preserveAspectRatio", "xMinYMin meet");
                            images.push({
                                container: container,
                                image: cImage,
                                svg: cSvg,
                            });
                        }
                        canvas.width = videoHeight;
                        canvas.height = videoWidth;
                        context.translate(canvas.width / 2, canvas.height / 2);
                        context.rotate(-Math.PI / 2);
                        context.scale(1, -1);
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
                        document.addEventListener("keydown", keyDown);
                        document.addEventListener("keyup", keyUp);
                        infoContainer = d3.select("body").append("div")
                            .attr("id", "infoContainer");
                        titleContainer = infoContainer.append("h1");
                        museumContainer = infoContainer.append("h2");
                        return [2 /*return*/];
                }
            });
        });
    }
    var keyState = false;
    function keyDown(e) {
        if (e.key === "4" && !keyState) {
            keyStart = Date.now();
            keyState = true;
        }
    }
    function keyUp(e) {
        if (e.key === "4") {
            var duration = Date.now() - keyStart;
            console.log(duration);
            if (state === 1) {
                state = 2;
                d3.select("#message span").html("Knopf kurz um zurückzukehren.<br />Lange drücken um Ergebnis zu drucken.");
                console.log("state 2");
            }
            else if (duration > 1000) {
                // send print job
                console.log("print", "state 1");
                var xhr_1 = new XMLHttpRequest();
                xhr_1.open("POST", "http://localhost:5656/print", true);
                xhr_1.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                xhr_1.onreadystatechange = function () {
                    if (xhr_1.readyState === 4 && xhr_1.status === 200) {
                        console.log(JSON.parse(xhr_1.responseText));
                    }
                    else if (xhr_1.status === 200) {
                        console.log("OPTIONS RESPONSE");
                    }
                    else {
                        console.log("SHIT");
                    }
                };
                xhr_1.send(JSON.stringify({
                    currentVideo: currentVideo,
                    date: currentPoseDate,
                    id: currentPoseId,
                    museum: currentPoseMuseum,
                    pose1: currentVideoPose,
                    pose2: currentPose,
                    title: currentPoseTitle,
                }));
                setTimeout(function () {
                    if (Date.now() - refreshTime > earlyRefresh) {
                        location.reload();
                    }
                }, 1000);
                state = 1;
                d3.select("#message span").html("Knopf drücken um Suche zu pausieren.");
                window.requestAnimationFrame(detectPose);
            }
            else {
                console.log("state 1");
                state = 1;
                d3.select("#message span").html("Knopf drücken um Suche zu pausieren.");
                window.requestAnimationFrame(detectPose);
            }
        }
        keyState = false;
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
        ["leftShoulder", "leftHip"],
        ["rightShoulder", "rightHip"],
        ["leftHip", "rightHip"],
        ["leftHip", "leftKnee"],
        ["rightKnee", "rightHip"],
        ["leftAnkle", "leftKnee"],
        ["rightKnee", "rightAnkle"],
    ];
    var poseTime = Date.now();
    function detectPose() {
        return __awaiter(this, void 0, void 0, function () {
            var imageElement_1, groups;
            var _this = this;
            return __generator(this, function (_a) {
                if (state === 1) {
                    imageElement_1 = new Image();
                    imageElement_1.crossOrigin = "Anonymous";
                    imageElement_1.onload = function () { return __awaiter(_this, void 0, void 0, function () {
                        var resp, highestScore, highestPose, _loop_1, i, cBody_1, minX_1, minY_1, maxX_1, maxY_1, width_1, height_1, nowTime, nearestImage, result_1, outputHeight, outputWidth, imageSize, svgScaleFactor, resultKeypoints_1, groups;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, net.estimateMultiplePoses(imageElement_1, imageScaleFactor, flipHorizontal, outputStride)];
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
                                    if (resp.length > 0 && highestScore > 0.5) {
                                        cBody_1 = [];
                                        minX_1 = Number.MAX_VALUE;
                                        minY_1 = Number.MAX_VALUE;
                                        maxX_1 = -Number.MAX_VALUE;
                                        maxY_1 = -Number.MAX_VALUE;
                                        highestPose.keypoints.forEach(function (point) {
                                            if (point.position.x > maxX_1) {
                                                maxX_1 = point.position.x;
                                            }
                                            if (point.position.y > maxY_1) {
                                                maxY_1 = point.position.y;
                                            }
                                            if (point.position.x < minX_1) {
                                                minX_1 = point.position.x;
                                            }
                                            if (point.position.y < minY_1) {
                                                minY_1 = point.position.y;
                                            }
                                        });
                                        width_1 = maxX_1 - minX_1;
                                        height_1 = maxY_1 - minY_1;
                                        highestPose.keypoints.forEach(function (point) {
                                            cBody_1.push((point.position.x - minX_1) / width_1);
                                            cBody_1.push((point.position.y - minY_1) / height_1);
                                        });
                                        nowTime = Date.now();
                                        if (nowTime - poseTime > 2000) {
                                            poseTime = Date.now();
                                            nearestImage = vptree.search(cBody_1);
                                            result_1 = poses[poseKeys[nearestImage[0].i][0]];
                                            images[0].image.attr("src", "http://localhost:8000/dst/europeana_downloads_complete/" + result_1.id + ".jpg");
                                            titleContainer.html(result_1.title);
                                            museumContainer.html(result_1.museum);
                                            outputHeight = windowHeight;
                                            outputWidth = imageMaxWidth;
                                            if (outputWidth / result_1.width * result_1.height > outputHeight) {
                                                outputWidth = outputHeight / result_1.height * result_1.width;
                                            }
                                            outputHeight = outputWidth / result_1.width * result_1.height;
                                            images[0].container
                                                .style("left", realVideoWidth + imageSpace + (imageMaxWidth - outputWidth) / 2 + "px")
                                                .style("top", (windowHeight - outputHeight) / 2 + "px")
                                                .style("width", outputWidth + "px")
                                                .style("height", "auto");
                                            imageSize = 700;
                                            svgScaleFactor = (result_1.height > result_1.width) ? imageSize / result_1.height : imageSize / result_1.width;
                                            images[0].svg.attr("viewBox", "0 0 " + result_1.width * svgScaleFactor + "  " + result_1.height * svgScaleFactor);
                                            images[0].svg.selectAll("*").remove();
                                            resultKeypoints_1 = result_1.abs_poses[poseKeys[nearestImage[0].i][1]].keypoints;
                                            images[0].svg.selectAll("circle").data(resultKeypoints_1).enter().append("circle")
                                                .attr("cx", function (d) { return d.position.x; })
                                                .attr("cy", function (d) { return d.position.y; })
                                                .attr("r", function (d) { return 5; })
                                                .style("fill", function (d) { return "rgba(255,0,0," + d.score + ")"; });
                                            result_1.pairs = [];
                                            pairs.forEach(function (p) {
                                                var p1 = getPart(resultKeypoints_1, p[0]);
                                                var p2 = getPart(resultKeypoints_1, p[1]);
                                                result_1.pairs.push([p1.x, p1.y, p2.x, p2.y]);
                                            });
                                            images[0].svg.selectAll("line").data(result_1.pairs).enter().append("line")
                                                .attr("x1", function (d) { return d[0]; })
                                                .attr("y1", function (d) { return d[1]; })
                                                .attr("x2", function (d) { return d[2]; })
                                                .attr("y2", function (d) { return d[3]; });
                                            currentPoseId = result_1.id;
                                            currentPoseTitle = result_1.title;
                                            currentPoseMuseum = result_1.museum;
                                            currentPoseDate = result_1.date;
                                            currentPose = result_1.abs_poses[poseKeys[nearestImage[0].i][1]];
                                            currentVideo = imageElement_1.src;
                                            currentVideoPose = highestPose;
                                        }
                                        svg.selectAll("*").remove();
                                        groups = svg.selectAll("g").data([highestPose]).enter().append("g");
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
                                    }
                                    else {
                                        svg.selectAll("*").remove();
                                    }
                                    window.requestAnimationFrame(detectPose);
                                    return [2 /*return*/];
                            }
                        });
                    }); };
                    context.drawImage(video, -canvas.height / 2, -canvas.width / 2);
                    imageElement_1.src = canvas.toDataURL("image/png");
                    d3.select("#video").style("display", "block");
                    d3.select("#image").style("display", "none");
                }
                else {
                    d3.select("#image").attr("src", currentVideo)
                        .style("display", "block");
                    d3.select("#video").style("display", "none");
                    // Draw poses
                    svg.selectAll("*").remove();
                    groups = svg.selectAll("g").data([currentVideoPose]).enter().append("g");
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
                }
                if (Date.now() - refreshTime > lateRefresh) {
                    location.reload();
                }
                return [2 /*return*/];
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