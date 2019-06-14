(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "d3"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var d3 = require("d3");
    var width = 3370;
    var height = 2384;
    var svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height);
    var poseWidth = 168.5;
    var poseHeight = 140.28;
    var border = 20;
    var rows = width / poseWidth;
    var cols = height / poseHeight;
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
    var getPart = function (arr, key) {
        var r = { x: 0, y: 0 };
        arr.forEach(function (a) {
            if (a.part === key) {
                r = a.position;
            }
        });
        return r;
    };
    d3.json("poses-temp.json")
        .then(function (poses) {
        for (var r = 0; r < rows; r += 1) {
            var _loop_1 = function (c) {
                var poseId = Math.floor(Math.random() * (poses.length - 1));
                var pose = poses[poseId];
                var keypoints = pose.abs_poses[0].keypoints;
                var g = svg.append("g")
                    .attr("transform", "translate(" + r * poseWidth + ", " + c * poseHeight + ")");
                var xMin = Number.MAX_VALUE;
                var yMin = Number.MAX_VALUE;
                var xMax = -Number.MAX_VALUE;
                var yMax = -Number.MAX_VALUE;
                keypoints.forEach(function (keypoint) {
                    if (keypoint.position.x > xMax) {
                        xMax = keypoint.position.x;
                    }
                    if (keypoint.position.y > yMax) {
                        yMax = keypoint.position.y;
                    }
                    if (keypoint.position.x < xMin) {
                        xMin = keypoint.position.x;
                    }
                    if (keypoint.position.y < yMin) {
                        yMin = keypoint.position.y;
                    }
                });
                var xRatio = (poseWidth - border * 2) / (xMax - xMin);
                var yRatio = (poseHeight - border * 2) / (yMax - yMin);
                var ratio = (poseHeight < poseWidth) ? yRatio : xRatio;
                g = g.append("g")
                    .attr("transform", "translate(" + (border + (poseWidth - (xMax - xMin) * ratio) / 2) + "," + (border + (poseHeight - (yMax - yMin) * ratio) / 2) + ")");
                keypoints.forEach(function (keypoint) {
                    g.append("circle")
                        .attr("cx", (keypoint.position.x - xMin) * ratio)
                        .attr("cy", (keypoint.position.y - yMin) * ratio)
                        .attr("r", 2)
                        .style("fill", "#000")
                        .style("stroke", "#000");
                });
                pairs.forEach(function (pair) {
                    var p1 = getPart(keypoints, pair[0]);
                    var p2 = getPart(keypoints, pair[1]);
                    g.append("line")
                        .attr("x1", (p1.x - xMin) * ratio)
                        .attr("x2", (p2.x - xMin) * ratio)
                        .attr("y1", (p1.y - yMin) * ratio)
                        .attr("y2", (p2.y - yMin) * ratio)
                        .style("stroke", "black");
                });
                poses.splice(poseId, 1);
            };
            for (var c = 0; c < cols; c += 1) {
                _loop_1(c);
            }
        }
    })
        .catch(function (err) {
        throw err;
    });
});
//# sourceMappingURL=backgroundprint.js.map