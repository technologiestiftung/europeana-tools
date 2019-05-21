var width = 553;
var height = 800;
/*
const width = 940;
const height = 580;
*/
var colors = d3.schemeCategory10;
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
var svg = d3.select("#container")
    .append("svg")
    .attr("width", width)
    .attr("height", height);
svg.append("image")
    .attr("xlink:href", "./assets/images/people.jpeg")
    .attr("width", width)
    .attr("height", height);
var legend = d3.select("#container")
    .append("ul");
d3.json("./assets/images/people.json").then(function (data) {
    data.forEach(function (d, di) {
        legend.append("li")
            .style("color", colors[di])
            .text(d.score)
            .append("span")
            .attr("style", "display:inline-block;width:10px;height:10px;background-color:" + colors[di]);
        svg.append("g")
            .selectAll("circle")
            .data(d.keypoints)
            .enter()
            .append("circle")
            .style("fill", colors[di])
            .attr("cx", function (dd) { return dd.position.x; })
            .attr("cy", function (dd) { return dd.position.y; })
            .attr("title", function (dd) { return dd.part; })
            .attr("r", 5);
        svg.append("g")
            .selectAll("line")
            .data(pairs)
            .enter()
            .append("line")
            .style("stroke", colors[di])
            .attr("x1", function (dd) { return getPart(d.keypoints, dd[0]).x; })
            .attr("y1", function (dd) { return getPart(d.keypoints, dd[0]).y; })
            .attr("x2", function (dd) { return getPart(d.keypoints, dd[1]).x; })
            .attr("y2", function (dd) { return getPart(d.keypoints, dd[1]).y; });
    });
}).catch(function (err) {
    throw err;
});
//# sourceMappingURL=testPose.js.map