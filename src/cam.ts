import * as posenet from "@tensorflow-models/posenet";
import * as tf from "@tensorflow/tfjs";
import * as d3 from "d3";
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
	let len = x.length;
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
					s = 1 + s*r*r;
					t = abs;
				} else {
					r = val / t;
					s = s + r*r;
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
					s = 1 + s*r*r;
					t = abs;
				} else {
					r = val / t;
					s = s + r*r;
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
	return a / ( b*c );
}

// posenet config
const multiplier = 0.75;
const flipHorizontal = false;
const outputStride = 8;
const imageScaleFactor = 1;
let net;
let video;
let svg;
let poses;
const poseKeys = {};
let vptree;
const canvas = document.querySelector("#canvas") as HTMLCanvasElement;
const context = canvas.getContext('2d');

const videoWidth = 640; // 1280
const videoHeight = 360; // 720

function cosineDistanceMatching(poseVector1, poseVector2) {
  const cosineSimilarity = similarity(poseVector1, poseVector2);
  const distance = 2 * (1 - cosineSimilarity);
  return Math.sqrt(distance);
}

async function setup() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error("Browser API navigator.mediaDevices.getUserMedia not available");
  }

  const poseData = [];
  poses.forEach((p, pi) => {
    p.poses.forEach((pp) => {
      poseData.push(pp);
      poseKeys[poseData.length - 1] = pi;
    });
  });

  vptree = VPTreeFactory.build(poseData, cosineDistanceMatching);

  svg = d3.select("body").append("svg")
    .attr("width", videoHeight)
    .attr("height", videoWidth);

  video = document.getElementById("video") as HTMLVideoElement;
  video.width = videoWidth;
  video.height = videoHeight;

  // load posenet
  net = await posenet.load(multiplier);

  canvas.width  = videoHeight;
  canvas.height = videoWidth;
  context.translate(canvas.width/2,canvas.height/2);
  context.rotate(-Math.PI/2);

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

async function detectPose() {

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

    if (resp.length > 0) {

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

      const nearestImage = vptree.search(cBody); // include n > number of similar samples

      // ToDo check if the image was already shown
      const result = poses[poseKeys[nearestImage[0].i]];
      d3.select("#image").attr("src", "http://localhost:9000" + result.image.split("europeana_downloads_complete")[1]);

      svg.selectAll("*").remove();

      const groups = svg.selectAll("g").data(resp).enter().append("g");
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

    window.requestAnimationFrame(detectPose);

  };

  context.drawImage(video, -canvas.height/2, -canvas.width/2);
  imageElement.src = canvas.toDataURL("image/png");
}

d3.json("poses.json")
  .then((importPoses) => {
    poses = importPoses;
    setup();
  })
  .catch((err) => {
    throw err;
  });
