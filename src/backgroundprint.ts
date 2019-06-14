import * as d3 from "d3";

const width = 3370;
const height = 2384;

const svg = d3.select("body").append("svg")
  .attr("width", width)
  .attr("height", height);

const poseWidth =  168.5;
const poseHeight = 140.28;
const border = 20;

const rows = width / poseWidth;
const cols = height / poseHeight;

const pairs = [
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

const getPart = (arr, key) => {
  let r = {x: 0, y: 0};
  arr.forEach( (a) => {
      if (a.part === key) {
          r = a.position;
      }
  });
  return r;
};

d3.json("poses-temp.json")
  .then((poses) => {

    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        const poseId = Math.floor(Math.random() * (poses.length - 1));
        const pose = poses[poseId];
        const keypoints = pose.abs_poses[0].keypoints;

        let g = svg.append("g")
          .attr("transform", `translate(${r * poseWidth}, ${c * poseHeight})`);

        let xMin = Number.MAX_VALUE;
        let yMin = Number.MAX_VALUE;
        let xMax = -Number.MAX_VALUE;
        let yMax = -Number.MAX_VALUE;

        keypoints.forEach( (keypoint) => {
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

        const xRatio = (poseWidth - border * 2) / (xMax - xMin);
        const yRatio = (poseHeight - border * 2) / (yMax - yMin);
        const ratio = (poseHeight < poseWidth) ? yRatio : xRatio;

        g = g.append("g")
          .attr("transform", `translate(${border + (poseWidth - (xMax - xMin) * ratio) / 2},${border + (poseHeight - (yMax - yMin) * ratio) / 2})`);

        keypoints.forEach( (keypoint) => {
          g.append("circle")
            .attr("cx", (keypoint.position.x - xMin) * ratio)
            .attr("cy", (keypoint.position.y - yMin) * ratio)
            .attr("r", 2)
            .style("fill", "#000")
            .style("stroke", "#000");
        });

        pairs.forEach( (pair) => {
          const p1 = getPart(keypoints, pair[0]);
          const p2 = getPart(keypoints, pair[1]);
          g.append("line")
            .attr("x1", (p1.x - xMin) * ratio)
            .attr("x2", (p2.x - xMin) * ratio)
            .attr("y1", (p1.y - yMin) * ratio)
            .attr("y2", (p2.y - yMin) * ratio)
            .style("stroke", "black");
        });

        poses.splice(poseId, 1);
      }
    }

  })
  .catch((err) => {
    throw err;
  });
