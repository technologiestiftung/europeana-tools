import * as posenet from "@tensorflow-models/posenet";
import * as tf from "@tensorflow/tfjs";
import * as d3 from "d3";

// declare var d3: any;
// declare var posenet: any;

import * as VPTreeFactory from "vptree";

// import * as similarity from "compute-cosine-similarity";

const isFunction = ( value ) => {
  return ( typeof value === "function" );
};

const isArray = ( value ) => {
  return Object.prototype.toString.call( value ) === "[object Array]";
};

const dot = ( x, y, clbk? ) => {
  if ( !isArray( x ) ) {
    throw new TypeError( "dot()::invalid input argument. First argument must be an array. Value: `" + x + "`." );
  }
  if ( !isArray( y ) ) {
    throw new TypeError( "dot()::invalid input argument. Second argument must be an array. Value: `" + y + "`." );
  }
  if ( clbk ) {
    if ( !isFunction( clbk ) ) {
      throw new TypeError( "dot()::invalid input argument. Accessor must be a function. Value: `" + clbk + "`." );
    }
  }

  const len = x.length;
  let sum = 0;
  let i;

  if ( len !== y.length ) {
    throw new Error( "dot()::invalid input argument. Arrays must be of equal length." );
  }
  if ( !len ) {
    return null;
  }
  if ( clbk ) {
    for ( i = 0; i < len; i++ ) {
      sum += clbk( x[ i ], i, 0 ) * clbk( y[ i ], i, 1 );
    }
  } else {
    for ( i = 0; i < len; i++ ) {
      sum += x[ i ] * y[ i ];
    }
  }
  return sum;
};

const l2norm = ( arr, clbk? ) => {
  if ( !isArray( arr ) ) {
    throw new TypeError( "l2norm()::invalid input argument. Must provide an array.  Value: `" + arr + "`." );
  }
  if ( clbk ) {
    if ( !isFunction( clbk ) ) {
      throw new TypeError( "l2norm()::invalid input argument. Accessor must be a function. Value: `" + clbk + "`." );
    }
  }
  const len = arr.length;
  let t = 0;
  let s = 1;
  let r;
  let val;
  let abs;
  let i;

  if ( !len ) {
    return null;
  }
  if ( clbk ) {
    for ( i = 0; i < len; i++ ) {
      val = clbk( arr[ i ], i );
      abs = ( val < 0 ) ? -val : val;
      if ( abs > 0 ) {
        if ( abs > t ) {
          r = t / val;
          s = 1 + s * r * r;
          t = abs;
        } else {
          r = val / t;
          s = s + r * r;
        }
      }
    }
  } else {
    for ( i = 0; i < len; i++ ) {
      val = arr[ i ];
      abs = ( val < 0 ) ? -val : val;
      if ( abs > 0 ) {
        if ( abs > t ) {
          r = t / val;
          s = 1 + s * r * r;
          t = abs;
        } else {
          r = val / t;
          s = s + r * r;
        }
      }
    }
  }
  return t * Math.sqrt( s );
};

function partial( fn, j ) {
  return function accessor( d, i ) {
    return fn( d, i, j );
  };
}

function similarity( x, y, clbk? ) {
  let a;
  let b;
  let c;
  if ( !isArray( x ) ) {
    throw new TypeError( "cosine-similarity()::invalid input argument. First argument must be an array. Value: `" + x + "`." );
  }
  if ( !isArray( y ) ) {
    throw new TypeError( "cosine-similarity()::invalid input argument. Second argument must be an array. Value: `" + y + "`." );
  }
  if ( arguments.length > 2 ) {
    if ( !isFunction( clbk ) ) {
      throw new TypeError( "cosine-similarity()::invalid input argument. Accessor must be a function. Value: `" + clbk + "`." );
    }
  }
  if ( x.length !== y.length ) {
    throw new Error( "cosine-similarity()::invalid input argument. Input arrays must have the same length." );
  }
  if ( !x.length ) {
    return null;
  }
  if ( clbk ) {
    a = dot( x, y, clbk );
    b = l2norm( x, partial( clbk, 0 ) );
    c = l2norm( y, partial( clbk, 1 ) );
  } else {
    a = dot( x, y );
    b = l2norm( x );
    c = l2norm( y );
  }
  return a / ( b * c );
}

// posenet config
const multiplier = 0.75;
const flipHorizontal = false;
const outputStride = 8;
const imageScaleFactor = 1;
let net;
let video;
let svg;
const images = [];
let poses;
const poseKeys = {};
let vptree;
const canvas = document.querySelector("#canvas") as HTMLCanvasElement;
const context = canvas.getContext("2d");

const videoWidth = 640; // 1280
const videoHeight = 360; // 720

const windowHeight = window.innerHeight;
const windowWidth = window.innerWidth;

function cosineDistanceMatching(poseVector1, poseVector2) {
  const cosineSimilarity = similarity(poseVector1, poseVector2);
  const distance = 2 * (1 - cosineSimilarity);
  return Math.sqrt(distance);
}

let state = 1;
let keyStart;
const imageCount = 1;
let imageMaxWidth = 0;
const imageSpace = 20;
let realVideoWidth;

let currentPose;
let currentPoseId;
let currentPoseTitle;
let currentPoseMuseum;
let currentPoseDate;
let currentVideo;
let currentVideoPose;

let titleContainer;
let museumContainer;

async function setup() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error("Browser API navigator.mediaDevices.getUserMedia not available");
  }

  const poseData = [];
  poses.forEach((p, pi) => {
    p.poses.forEach((pp, ppi) => {
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
    .attr("viewBox", `0 0 ${videoHeight} ${videoWidth}`)
    .attr("preserveAspectRatio", "xMinYMin meet");

  imageMaxWidth = windowWidth - imageSpace - realVideoWidth;

  video = document.getElementById("video") as HTMLVideoElement;
  video.width = videoWidth;
  video.height = videoHeight;
  d3.select("#video")
    .style("width", windowHeight + "px")
    .style("height", "auto");
  // load posenet
  net = await posenet.load(multiplier);

  for (let i = 1; i <= imageCount; i += 1) {
    const container = d3.select("body")
      .append("div").attr("id", "image" + i)
      .style("left", realVideoWidth + imageSpace + "px");
    const cImage = container.append("img");
    const cSvg = container.append("svg")
      .attr("preserveAspectRatio", "xMinYMin meet");
    images.push({
      container,
      image: cImage,
      svg: cSvg,
    });
  }

  canvas.width  = videoHeight;
  canvas.height = videoWidth;
  context.translate(canvas.width / 2, canvas.height / 2);
  context.rotate(-Math.PI / 2);
  context.scale(1, -1);

  const stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      facingMode: "user",
      height: videoHeight,
      width: videoWidth,
    },
  });

  video.srcObject = stream;
  video.onloadedmetadata = () => {
    video.play();
    detectPose();
  };

  document.addEventListener("keydown", keyDown);
  document.addEventListener("keyup", keyUp);

  const infoContainer = d3.select("body").append("div")
    .attr("id", "infoContainer");

  titleContainer = infoContainer.append("h1");
  museumContainer = infoContainer.append("h2");
}

let keyState = false;

function keyDown(e) {
  if (e.key === "4" && !keyState) {
    keyStart = Date.now();
    keyState = true;
  }
}

function keyUp(e) {
  if (e.key === "4") {
    const duration = Date.now() - keyStart;
    console.log(duration);
    if (state === 1) {
      state = 2;
      console.log("state 2");
    } else if (duration > 1000) {
      // send print job
      console.log("print", "state 1");

      const xhr = new XMLHttpRequest();
      xhr.open("POST", "http://localhost:5656/print", true);
      xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
      xhr.onreadystatechange = () => {
          if (xhr.readyState === 4 && xhr.status === 200) {
              console.log(JSON.parse(xhr.responseText));
          } else if ( xhr.status === 200) {
              console.log("OPTIONS RESPONSE");
          } else {
              console.log("SHIT");
          }
      };

      xhr.send(JSON.stringify({
        currentVideo,
        date: currentPoseDate,
        id: currentPoseId,
        museum: currentPoseMuseum,
        pose1: currentVideoPose,
        pose2: currentPose,
        title: currentPoseTitle,
      }));

      state = 1;
    } else {
      console.log("state 1");
      state = 1;
    }
  }
  keyState = false;
}

const getPart = (arr, key) => {
  let r = {x: 0, y: 0};
  arr.forEach( (a) => {
      if (a.part === key) {
          r = a.position;
      }
  });
  return r;
};

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

let poseTime = Date.now();

async function detectPose() {

  if (state === 1) {

    const imageElement = new Image();
    imageElement.crossOrigin = "Anonymous";
    imageElement.onload = async () => {

      // estimateSinglePose
      const resp = await net.estimateMultiplePoses(imageElement, imageScaleFactor, flipHorizontal, outputStride);

      let highestScore = -Number.MAX_VALUE;
      let highestPose;

      // remove poses with low probability
      for (let i = resp.length - 1; i >= 0; i--) {
          if (resp[i].score < 0.1) {
              resp.splice(i, 1);
          } else {
            if (resp[i].score > highestScore) {
              highestScore = resp[i].score;
              highestPose = resp[i];
            }
            resp[i].pairs = [];
            pairs.forEach((p) => {
              const p1 = getPart(resp[i].keypoints, p[0]);
              const p2 = getPart(resp[i].keypoints, p[1]);
              resp[i].pairs.push([p1.x, p1.y, p2.x, p2.y]);
            });
          }
      }

      if (resp.length > 0 && highestScore > 0.5) {

        const cBody = [];

        let minX = Number.MAX_VALUE;
        let minY = Number.MAX_VALUE;
        let maxX = -Number.MAX_VALUE;
        let maxY = -Number.MAX_VALUE;
        highestPose.keypoints.forEach((point) => {
          if (point.position.x > maxX) { maxX = point.position.x; }
          if (point.position.y > maxY) { maxY = point.position.y; }
          if (point.position.x < minX) { minX = point.position.x; }
          if (point.position.y < minY) { minY = point.position.y; }
        });

        const width = maxX - minX;
        const height = maxY - minY;

        highestPose.keypoints.forEach((point) => {
          cBody.push((point.position.x - minX) / width);
          cBody.push((point.position.y - minY) / height);
        });

        const nowTime = Date.now();

        if (nowTime - poseTime > 2000) {
          poseTime = Date.now();

          const nearestImage = vptree.search(cBody); // include n > number of similar samples

          // ToDo check if the image was already shown
          const result = poses[poseKeys[nearestImage[0].i][0]];
          images[0].image.attr("src", "http://localhost:8000/dst/europeana_downloads_complete/" + result.id + ".jpg");

          titleContainer.html(result.title);
          museumContainer.html(result.museum);

          let outputHeight = windowHeight;
          let outputWidth = imageMaxWidth;

          if (outputWidth / result.width * result.height > outputHeight) {
            outputWidth = outputHeight / result.height * result.width;
          }

          outputHeight = outputWidth / result.width * result.height;

          images[0].container
            .style("left", realVideoWidth + imageSpace + (imageMaxWidth - outputWidth) / 2 + "px")
            .style("top", (windowHeight - outputHeight) / 2 + "px")
            .style("width", outputWidth + "px")
            .style("height", "auto");

          const imageSize = 700;
          const svgScaleFactor = (result.height > result.width) ? imageSize / result.height : imageSize / result.width;
          images[0].svg.attr("viewBox", `0 0 ${result.width * svgScaleFactor}  ${result.height * svgScaleFactor}`);
          images[0].svg.selectAll("*").remove();
          const resultKeypoints = result.abs_poses[poseKeys[nearestImage[0].i][1]].keypoints;
          images[0].svg.selectAll("circle").data(resultKeypoints).enter().append("circle")
            .attr("cx", (d) => d.position.x)
            .attr("cy", (d) => d.position.y)
            .attr("r", (d) => 5)
            .style("fill", (d) => `rgba(255,0,0,${d.score})`);

          result.pairs = [];
          pairs.forEach((p) => {
            const p1 = getPart(resultKeypoints, p[0]);
            const p2 = getPart(resultKeypoints, p[1]);
            result.pairs.push([p1.x, p1.y, p2.x, p2.y]);
          });

          images[0].svg.selectAll("line").data(result.pairs).enter().append("line")
            .attr("x1", (d) => d[0])
            .attr("y1", (d) => d[1])
            .attr("x2", (d) => d[2])
            .attr("y2", (d) => d[3]);

          currentPoseId = result.id;
          currentPoseTitle = result.title;
          currentPoseMuseum = result.museum;
          currentPoseDate = result.date;
          currentPose = result.abs_poses[poseKeys[nearestImage[0].i][1]];
          currentVideo = imageElement.src;
          currentVideoPose = highestPose;

        }

        svg.selectAll("*").remove();

        // [highestPose] > resp

        const groups = svg.selectAll("g").data([highestPose]).enter().append("g");
        groups.selectAll("circle").data((d) => d.keypoints).enter().append("circle")
          .attr("cx", (d) => d.position.x)
          .attr("cy", (d) => d.position.y)
          .attr("r", (d) => 5)
          .style("fill", (d) => `rgba(255,0,0,${d.score})`);

        groups.selectAll("line").data((d) => d.pairs).enter().append("line")
          .attr("x1", (d) => d[0])
          .attr("y1", (d) => d[1])
          .attr("x2", (d) => d[2])
          .attr("y2", (d) => d[3]);
      } else {
        svg.selectAll("*").remove();
      }

      window.requestAnimationFrame(detectPose);

    };

    context.drawImage(video, -canvas.height / 2, -canvas.width / 2);
    imageElement.src = canvas.toDataURL("image/png");

    d3.select("#video").style("display", "block");

  } else {

    d3.select("#image").attr("src", currentVideo);
    d3.select("#video").style("display", "none");

    // Draw poses
    svg.selectAll("*").remove();

    const groups = svg.selectAll("g").data([currentVideoPose]).enter().append("g");

    groups.selectAll("circle").data((d) => d.keypoints).enter().append("circle")
      .attr("cx", (d) => d.position.x)
      .attr("cy", (d) => d.position.y)
      .attr("r", (d) => 5)
      .style("fill", (d) => `rgba(255,0,0,${d.score})`);

    groups.selectAll("line").data((d) => d.pairs).enter().append("line")
      .attr("x1", (d) => d[0])
      .attr("y1", (d) => d[1])
      .attr("x2", (d) => d[2])
      .attr("y2", (d) => d[3]);
  }
}

d3.json("poses.json")
  .then((importPoses) => {
    poses = importPoses;
    setup();
  })
  .catch((err) => {
    throw err;
  });
