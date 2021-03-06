(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../common/@tensorflow/tfjs-226186fd.js"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tfjs_226186fd_js_1 = require("../common/@tensorflow/tfjs-226186fd.js");
    // @tensorflow/tfjs-models Copyright 2019 Google
    function __awaiter(e, t, r, n) { return new (r || (r = Promise))(function (o, i) { function a(e) { try {
        u(n.next(e));
    }
    catch (e) {
        i(e);
    } } function s(e) { try {
        u(n.throw(e));
    }
    catch (e) {
        i(e);
    } } function u(e) { e.done ? o(e.value) : new r(function (t) { t(e.value); }).then(a, s); } u((n = n.apply(e, t || [])).next()); }); }
    function __generator(e, t) { var r, n, o, i, a = { label: 0, sent: function () { if (1 & o[0])
            throw o[1]; return o[1]; }, trys: [], ops: [] }; return i = { next: s(0), throw: s(1), return: s(2) }, "function" == typeof Symbol && (i[Symbol.iterator] = function () { return this; }), i; function s(i) { return function (s) { return function (i) { if (r)
        throw new TypeError("Generator is already executing."); for (; a;)
        try {
            if (r = 1, n && (o = 2 & i[0] ? n.return : i[0] ? n.throw || ((o = n.return) && o.call(n), 0) : n.next) && !(o = o.call(n, i[1])).done)
                return o;
            switch (n = 0, o && (i = [2 & i[0], o.value]), i[0]) {
                case 0:
                case 1:
                    o = i;
                    break;
                case 4: return a.label++, { value: i[1], done: !1 };
                case 5:
                    a.label++, n = i[1], i = [0];
                    continue;
                case 7:
                    i = a.ops.pop(), a.trys.pop();
                    continue;
                default:
                    if (!(o = (o = a.trys).length > 0 && o[o.length - 1]) && (6 === i[0] || 2 === i[0])) {
                        a = 0;
                        continue;
                    }
                    if (3 === i[0] && (!o || i[1] > o[0] && i[1] < o[3])) {
                        a.label = i[1];
                        break;
                    }
                    if (6 === i[0] && a.label < o[1]) {
                        a.label = o[1], o = i;
                        break;
                    }
                    if (o && a.label < o[2]) {
                        a.label = o[2], a.ops.push(i);
                        break;
                    }
                    o[2] && a.ops.pop(), a.trys.pop();
                    continue;
            }
            i = t.call(e, a);
        }
        catch (e) {
            i = [6, e], n = 0;
        }
        finally {
            r = o = 0;
        } if (5 & i[0])
        throw i[1]; return { value: i[0] ? i[1] : void 0, done: !0 }; }([i, s]); }; } }
    var MANIFEST_FILE = "manifest.json", CheckpointLoader = function () { function e(e) { this.urlPath = e, "/" !== this.urlPath.charAt(this.urlPath.length - 1) && (this.urlPath += "/"); } return e.prototype.loadManifest = function () { var e = this; return new Promise(function (t, r) { return __awaiter(e, void 0, void 0, function () { var e, r, n; return __generator(this, function (o) { switch (o.label) {
        case 0: return o.trys.push([0, 3, , 4]), [4, tfjs_226186fd_js_1.a.fetch(this.urlPath + MANIFEST_FILE)];
        case 1:
            if (!(e = o.sent()).ok)
                throw new Error("Not found manifest " + (this.urlPath + MANIFEST_FILE));
            return r = this, [4, e.json()];
        case 2: return r.checkpointManifest = o.sent(), t(), [3, 4];
        case 3: throw n = o.sent(), new Error(MANIFEST_FILE + " not found at " + this.urlPath + ". " + n);
        case 4: return [2];
    } }); }); }); }, e.prototype.getCheckpointManifest = function () { var e = this; return null == this.checkpointManifest ? new Promise(function (t, r) { e.loadManifest().then(function () { t(e.checkpointManifest); }); }) : new Promise(function (t, r) { t(e.checkpointManifest); }); }, e.prototype.getAllVariables = function () { var e = this; return null != this.variables ? new Promise(function (t, r) { t(e.variables); }) : new Promise(function (t, r) { e.getCheckpointManifest().then(function (r) { for (var n = Object.keys(e.checkpointManifest), o = [], i = 0; i < n.length; i++)
        o.push(e.getVariable(n[i])); Promise.all(o).then(function (r) { e.variables = {}; for (var o = 0; o < r.length; o++)
        e.variables[n[o]] = r[o]; t(e.variables); }); }); }); }, e.prototype.getVariable = function (e) { var t = this; if (!(e in this.checkpointManifest))
        throw new Error("Cannot load non-existant variable " + e); var r = function (r, n) { return __awaiter(t, void 0, void 0, function () { var t, n, o, i, a, s; return __generator(this, function (u) { switch (u.label) {
        case 0: t = this.checkpointManifest[e].filename, u.label = 1;
        case 1: return u.trys.push([1, 4, , 5]), [4, tfjs_226186fd_js_1.a.fetch(this.urlPath + t)];
        case 2:
            if (!(n = u.sent()).ok)
                throw new Error("Not found variable " + e);
            return i = Float32Array.bind, [4, n.arrayBuffer()];
        case 3: return o = new (i.apply(Float32Array, [void 0, u.sent()])), a = tfjs_226186fd_js_1.l(o, this.checkpointManifest[e].shape, "float32"), r(a), [3, 5];
        case 4: throw s = u.sent(), new Error("Could not fetch variable " + e + ": " + s);
        case 5: return [2];
    } }); }); }; return null == this.checkpointManifest ? new Promise(function (e, n) { t.loadManifest().then(function () { new Promise(r).then(e); }); }) : new Promise(r); }, e; }(), mobileNet100Architecture = [["conv2d", 2], ["separableConv", 1], ["separableConv", 2], ["separableConv", 1], ["separableConv", 2], ["separableConv", 1], ["separableConv", 2], ["separableConv", 1], ["separableConv", 1], ["separableConv", 1], ["separableConv", 1], ["separableConv", 1], ["separableConv", 2], ["separableConv", 1]], mobileNet75Architecture = [["conv2d", 2], ["separableConv", 1], ["separableConv", 2], ["separableConv", 1], ["separableConv", 2], ["separableConv", 1], ["separableConv", 2], ["separableConv", 1], ["separableConv", 1], ["separableConv", 1], ["separableConv", 1], ["separableConv", 1], ["separableConv", 1], ["separableConv", 1]], mobileNet50Architecture = [["conv2d", 2], ["separableConv", 1], ["separableConv", 2], ["separableConv", 1], ["separableConv", 2], ["separableConv", 1], ["separableConv", 2], ["separableConv", 1], ["separableConv", 1], ["separableConv", 1], ["separableConv", 1], ["separableConv", 1], ["separableConv", 1], ["separableConv", 1]], mobileNet25Architecture = mobileNet50Architecture, VALID_OUTPUT_STRIDES = [8, 16, 32];
    exports.CheckpointLoader = CheckpointLoader;
    function assertValidOutputStride(e) { tfjs_226186fd_js_1.a.assert("number" == typeof e, function () { return "outputStride is not a number"; }), tfjs_226186fd_js_1.a.assert(VALID_OUTPUT_STRIDES.indexOf(e) >= 0, function () { return "outputStride of " + e + " is invalid. It must be either 8, 16, or 32"; }); }
    function assertValidScaleFactor(e) { tfjs_226186fd_js_1.a.assert("number" == typeof e, function () { return "imageScaleFactor is not a number"; }), tfjs_226186fd_js_1.a.assert(e >= .2 && e <= 1, function () { return "imageScaleFactor must be between 0.2 and 1.0"; }); }
    var mobileNetArchitectures = { 100: mobileNet100Architecture, 75: mobileNet75Architecture, 50: mobileNet50Architecture, 25: mobileNet25Architecture };
    exports.mobileNetArchitectures = mobileNetArchitectures;
    function toOutputStridedLayers(e, t) { var r = 1, n = 1; return e.map(function (e, o) { var i, a, s = e[0], u = e[1]; return r === t ? (i = 1, a = n, n *= u) : (i = u, a = 1, r *= u), { blockId: o, convType: s, stride: i, rate: a, outputStride: r }; }); }
    var MobileNet = function () { function e(e, t) { this.PREPROCESS_DIVISOR = tfjs_226186fd_js_1.f(127.5), this.ONE = tfjs_226186fd_js_1.f(1), this.modelWeights = e, this.convolutionDefinitions = t; } return e.prototype.predict = function (e, t) { var r = this, n = tfjs_226186fd_js_1.b(e.toFloat(), this.PREPROCESS_DIVISOR), o = tfjs_226186fd_js_1.c(n, this.ONE); return toOutputStridedLayers(this.convolutionDefinitions, t).reduce(function (e, t) { var n = t.blockId, o = t.stride, i = t.convType, a = t.rate; if ("conv2d" === i)
        return r.conv(e, o, n); if ("separableConv" === i)
        return r.separableConv(e, o, n, a); throw Error("Unknown conv type of " + i); }, o); }, e.prototype.convToOutput = function (e, t) { return e.conv2d(this.weights(t), 1, "same").add(this.convBias(t)); }, e.prototype.conv = function (e, t, r) { var n = this.weights("Conv2d_" + String(r)); return e.conv2d(n, t, "same").add(this.convBias("Conv2d_" + String(r))).clipByValue(0, 6); }, e.prototype.separableConv = function (e, t, r, n) { void 0 === n && (n = 1); var o = "Conv2d_" + String(r) + "_depthwise", i = "Conv2d_" + String(r) + "_pointwise"; return e.depthwiseConv2D(this.depthwiseWeights(o), t, "same", "NHWC", n).add(this.depthwiseBias(o)).clipByValue(0, 6).conv2d(this.weights(i), [1, 1], "same").add(this.convBias(i)).clipByValue(0, 6); }, e.prototype.weights = function (e) { return this.modelWeights.weights(e); }, e.prototype.convBias = function (e) { return this.modelWeights.convBias(e); }, e.prototype.depthwiseBias = function (e) { return this.modelWeights.depthwiseBias(e); }, e.prototype.depthwiseWeights = function (e) { return this.modelWeights.depthwiseWeights(e); }, e.prototype.dispose = function () { this.modelWeights.dispose(); }, e; }(), partNames = ["nose", "leftEye", "rightEye", "leftEar", "rightEar", "leftShoulder", "rightShoulder", "leftElbow", "rightElbow", "leftWrist", "rightWrist", "leftHip", "rightHip", "leftKnee", "rightKnee", "leftAnkle", "rightAnkle"], NUM_KEYPOINTS = partNames.length, partIds = partNames.reduce(function (e, t, r) { return e[t] = r, e; }, {}), connectedPartNames = [["leftHip", "leftShoulder"], ["leftElbow", "leftShoulder"], ["leftElbow", "leftWrist"], ["leftHip", "leftKnee"], ["leftKnee", "leftAnkle"], ["rightHip", "rightShoulder"], ["rightElbow", "rightShoulder"], ["rightElbow", "rightWrist"], ["rightHip", "rightKnee"], ["rightKnee", "rightAnkle"], ["leftShoulder", "rightShoulder"], ["leftHip", "rightHip"]], poseChain = [["nose", "leftEye"], ["leftEye", "leftEar"], ["nose", "rightEye"], ["rightEye", "rightEar"], ["nose", "leftShoulder"], ["leftShoulder", "leftElbow"], ["leftElbow", "leftWrist"], ["leftShoulder", "leftHip"], ["leftHip", "leftKnee"], ["leftKnee", "leftAnkle"], ["nose", "rightShoulder"], ["rightShoulder", "rightElbow"], ["rightElbow", "rightWrist"], ["rightShoulder", "rightHip"], ["rightHip", "rightKnee"], ["rightKnee", "rightAnkle"]], connectedPartIndices = connectedPartNames.map(function (e) { var t = e[0], r = e[1]; return [partIds[t], partIds[r]]; }), partChannels = ["left_face", "right_face", "right_upper_leg_front", "right_lower_leg_back", "right_upper_leg_back", "left_lower_leg_front", "left_upper_leg_front", "left_upper_leg_back", "left_lower_leg_back", "right_feet", "right_lower_leg_front", "left_feet", "torso_front", "torso_back", "right_upper_arm_front", "right_upper_arm_back", "right_lower_arm_back", "left_lower_arm_front", "left_upper_arm_front", "left_upper_arm_back", "left_lower_arm_back", "right_hand", "right_lower_arm_front", "left_hand"];
    exports.MobileNet = MobileNet;
    exports.partNames = partNames;
    exports.partIds = partIds;
    exports.poseChain = poseChain;
    exports.partChannels = partChannels;
    function eitherPointDoesntMeetConfidence(e, t, r) { return e < r || t < r; }
    function getAdjacentKeyPoints(e, t) { return connectedPartIndices.reduce(function (r, n) { var o = n[0], i = n[1]; return eitherPointDoesntMeetConfidence(e[o].score, e[i].score, t) ? r : (r.push([e[o], e[i]]), r); }, []); }
    exports.getAdjacentKeyPoints = getAdjacentKeyPoints;
    var NEGATIVE_INFINITY = Number.NEGATIVE_INFINITY, POSITIVE_INFINITY = Number.POSITIVE_INFINITY;
    function getBoundingBox(e) { return e.reduce(function (e, t) { var r = e.maxX, n = e.maxY, o = e.minX, i = e.minY, a = t.position, s = a.x, u = a.y; return { maxX: Math.max(r, s), maxY: Math.max(n, u), minX: Math.min(o, s), minY: Math.min(i, u) }; }, { maxX: NEGATIVE_INFINITY, maxY: NEGATIVE_INFINITY, minX: POSITIVE_INFINITY, minY: POSITIVE_INFINITY }); }
    exports.getBoundingBox = getBoundingBox;
    function getBoundingBoxPoints(e) { var t = getBoundingBox(e), r = t.minX, n = t.minY, o = t.maxX, i = t.maxY; return [{ x: r, y: n }, { x: o, y: n }, { x: o, y: i }, { x: r, y: i }]; }
    exports.getBoundingBoxPoints = getBoundingBoxPoints;
    function toTensorBuffer(e, t) { return void 0 === t && (t = "float32"), __awaiter(this, void 0, void 0, function () { var r; return __generator(this, function (n) { switch (n.label) {
        case 0: return [4, e.data()];
        case 1: return r = n.sent(), [2, tfjs_226186fd_js_1.d(e.shape, t, r)];
    } }); }); }
    function toTensorBuffers3D(e) { return __awaiter(this, void 0, void 0, function () { return __generator(this, function (t) { return [2, Promise.all(e.map(function (e) { return toTensorBuffer(e, "float32"); }))]; }); }); }
    function scalePose(e, t, r) { return { score: e.score, keypoints: e.keypoints.map(function (e) { var n = e.score, o = e.part, i = e.position; return { score: n, part: o, position: { x: i.x * r, y: i.y * t } }; }) }; }
    exports.scalePose = scalePose;
    function scalePoses(e, t, r) { return 1 === r && 1 === t ? e : e.map(function (e) { return scalePose(e, t, r); }); }
    function getValidResolution(e, t, r) { var n = t * e - 1; return n - n % r + 1; }
    function getInputTensorDimensions(e) { return e instanceof tfjs_226186fd_js_1.i ? [e.shape[0], e.shape[1]] : [e.height, e.width]; }
    function toInputTensor(e) { return e instanceof tfjs_226186fd_js_1.i ? e : tfjs_226186fd_js_1.j.fromPixels(e); }
    function toResizedInputTensor(e, t, r, n) { return tfjs_226186fd_js_1.e(function () { var o = toInputTensor(e); return n ? o.reverse(1).resizeBilinear([t, r]) : o.resizeBilinear([t, r]); }); }
    function half(e) { return Math.floor(e / 2); }
    var MaxHeap = function () { function e(e, t) { this.priorityQueue = new Array(e), this.numberOfElements = -1, this.getElementValue = t; } return e.prototype.enqueue = function (e) { this.priorityQueue[++this.numberOfElements] = e, this.swim(this.numberOfElements); }, e.prototype.dequeue = function () { var e = this.priorityQueue[0]; return this.exchange(0, this.numberOfElements--), this.sink(0), this.priorityQueue[this.numberOfElements + 1] = null, e; }, e.prototype.empty = function () { return -1 === this.numberOfElements; }, e.prototype.size = function () { return this.numberOfElements + 1; }, e.prototype.all = function () { return this.priorityQueue.slice(0, this.numberOfElements + 1); }, e.prototype.max = function () { return this.priorityQueue[0]; }, e.prototype.swim = function (e) { for (; e > 0 && this.less(half(e), e);)
        this.exchange(e, half(e)), e = half(e); }, e.prototype.sink = function (e) { for (; 2 * e <= this.numberOfElements;) {
        var t = 2 * e;
        if (t < this.numberOfElements && this.less(t, t + 1) && t++, !this.less(e, t))
            break;
        this.exchange(e, t), e = t;
    } }, e.prototype.getValueAt = function (e) { return this.getElementValue(this.priorityQueue[e]); }, e.prototype.less = function (e, t) { return this.getValueAt(e) < this.getValueAt(t); }, e.prototype.exchange = function (e, t) { var r = this.priorityQueue[e]; this.priorityQueue[e] = this.priorityQueue[t], this.priorityQueue[t] = r; }, e; }();
    function scoreIsMaximumInLocalWindow(e, t, r, n, o, i) { for (var a = i.shape, s = a[0], u = a[1], l = !0, c = Math.max(r - o, 0), p = Math.min(r + o + 1, s), f = c; f < p; ++f) {
        for (var h = Math.max(n - o, 0), d = Math.min(n + o + 1, u), v = h; v < d; ++v)
            if (i.get(f, v, e) > t) {
                l = !1;
                break;
            }
        if (!l)
            break;
    } return l; }
    function buildPartWithScoreQueue(e, t, r) { for (var n = r.shape, o = n[0], i = n[1], a = n[2], s = new MaxHeap(o * i * a, function (e) { return e.score; }), u = 0; u < o; ++u)
        for (var l = 0; l < i; ++l)
            for (var c = 0; c < a; ++c) {
                var p = r.get(u, l, c);
                p < e || scoreIsMaximumInLocalWindow(c, p, u, l, t, r) && s.enqueue({ score: p, part: { heatmapY: u, heatmapX: l, id: c } });
            } return s; }
    function getOffsetPoint(e, t, r, n) { return { y: n.get(e, t, r), x: n.get(e, t, r + NUM_KEYPOINTS) }; }
    function getImageCoords(e, t, r) { var n = getOffsetPoint(e.heatmapY, e.heatmapX, e.id, r), o = n.y, i = n.x; return { x: e.heatmapX * t + i, y: e.heatmapY * t + o }; }
    function clamp(e, t, r) { return e < t ? t : e > r ? r : e; }
    function squaredDistance(e, t, r, n) { var o = r - e, i = n - t; return o * o + i * i; }
    function addVectors(e, t) { return { x: e.x + t.x, y: e.y + t.y }; }
    var parentChildrenTuples = poseChain.map(function (e) { var t = e[0], r = e[1]; return [partIds[t], partIds[r]]; }), parentToChildEdges = parentChildrenTuples.map(function (e) { return e[1]; }), childToParentEdges = parentChildrenTuples.map(function (e) { return e[0]; });
    function getDisplacement(e, t, r) { var n = r.shape[2] / 2; return { y: r.get(t.y, t.x, e), x: r.get(t.y, t.x, n + e) }; }
    function getStridedIndexNearPoint(e, t, r, n) { return { y: clamp(Math.round(e.y / t), 0, r - 1), x: clamp(Math.round(e.x / t), 0, n - 1) }; }
    function traverseToTargetKeypoint(e, t, r, n, o, i, a) { var s = n.shape, u = s[0], l = s[1], c = getDisplacement(e, getStridedIndexNearPoint(t.position, i, u, l), a), p = getStridedIndexNearPoint(addVectors(t.position, c), i, u, l), f = getOffsetPoint(p.y, p.x, r, o), h = n.get(p.y, p.x, r); return { position: addVectors({ x: p.x * i, y: p.y * i }, { x: f.x, y: f.y }), part: partNames[r], score: h }; }
    function decodePose(e, t, r, n, o, i) { var a = t.shape[2], s = parentToChildEdges.length, u = new Array(a), l = e.part, c = e.score, p = getImageCoords(l, n, r); u[l.id] = { score: c, part: partNames[l.id], position: p }; for (var f = s - 1; f >= 0; --f) {
        var h = parentToChildEdges[f], d = childToParentEdges[f];
        u[h] && !u[d] && (u[d] = traverseToTargetKeypoint(f, u[h], d, t, r, n, i));
    } for (f = 0; f < s; ++f) {
        h = childToParentEdges[f], d = parentToChildEdges[f];
        u[h] && !u[d] && (u[d] = traverseToTargetKeypoint(f, u[h], d, t, r, n, o));
    } return u; }
    function withinNmsRadiusOfCorrespondingPoint(e, t, r, n) { var o = r.x, i = r.y; return e.some(function (e) { var r = e.keypoints[n].position; return squaredDistance(i, o, r.y, r.x) <= t; }); }
    function getInstanceScore(e, t, r) { return r.reduce(function (r, n, o) { var i = n.position, a = n.score; return withinNmsRadiusOfCorrespondingPoint(e, t, i, o) || (r += a), r; }, 0) / r.length; }
    var kLocalMaximumRadius = 1;
    function decodeMultiplePoses(e, t, r, n, o, i, a, s) { return void 0 === a && (a = .5), void 0 === s && (s = 20), __awaiter(this, void 0, void 0, function () { var u, l, c, p, f, h, d, v, m, g, b, _; return __generator(this, function (y) { switch (y.label) {
        case 0: return u = [], [4, toTensorBuffers3D([e, t, r, n])];
        case 1:
            for (l = y.sent(), c = l[0], p = l[1], f = l[2], h = l[3], d = buildPartWithScoreQueue(a, kLocalMaximumRadius, c), v = s * s; u.length < i && !d.empty();)
                m = d.dequeue(), g = getImageCoords(m.part, o, p), withinNmsRadiusOfCorrespondingPoint(u, v, g, m.part.id) || (b = decodePose(m, c, p, o, f, h), _ = getInstanceScore(u, v, b), u.push({ keypoints: b, score: _ }));
            return [2, u];
    } }); }); }
    exports.decodeMultiplePoses = decodeMultiplePoses;
    function mod(e, t) { return tfjs_226186fd_js_1.e(function () { var r = e.div(tfjs_226186fd_js_1.f(t, "int32")); return e.sub(r.mul(tfjs_226186fd_js_1.f(t, "int32"))); }); }
    function argmax2d(e) { var t = e.shape, r = t[0], n = t[1], o = t[2]; return tfjs_226186fd_js_1.e(function () { var t = e.reshape([r * n, o]).argMax(0), i = t.div(tfjs_226186fd_js_1.f(n, "int32")).expandDims(1), a = mod(t, n).expandDims(1); return tfjs_226186fd_js_1.g([i, a], 1); }); }
    function getPointsConfidence(e, t) { for (var r = t.shape[0], n = new Float32Array(r), o = 0; o < r; o++) {
        var i = t.get(o, 0), a = t.get(o, 1);
        n[o] = e.get(i, a, o);
    } return n; }
    function getOffsetPoint$1(e, t, r, n) { return { y: n.get(e, t, r), x: n.get(e, t, r + NUM_KEYPOINTS) }; }
    function getOffsetVectors(e, t) { for (var r = [], n = 0; n < NUM_KEYPOINTS; n++) {
        var o = getOffsetPoint$1(e.get(n, 0).valueOf(), e.get(n, 1).valueOf(), n, t), i = o.x, a = o.y;
        r.push(a), r.push(i);
    } return tfjs_226186fd_js_1.h(r, [NUM_KEYPOINTS, 2]); }
    function getOffsetPoints(e, t, r) { return tfjs_226186fd_js_1.e(function () { var n = getOffsetVectors(e, r); return e.toTensor().mul(tfjs_226186fd_js_1.f(t, "int32")).toFloat().add(n); }); }
    function decodeSinglePose(e, t, r) { return __awaiter(this, void 0, void 0, function () { var n, o, i, a, s, u, l, c, p, f; return __generator(this, function (h) { switch (h.label) {
        case 0: return n = 0, o = argmax2d(e), [4, Promise.all([toTensorBuffer(e), toTensorBuffer(t), toTensorBuffer(o, "int32")])];
        case 1: return i = h.sent(), a = i[0], s = i[1], u = i[2], [4, toTensorBuffer(l = getOffsetPoints(u, r, s))];
        case 2: return c = h.sent(), p = Array.from(getPointsConfidence(a, u)), f = p.map(function (e, t) { return n += e, { position: { y: c.get(t, 0), x: c.get(t, 1) }, part: partNames[t], score: e }; }), o.dispose(), l.dispose(), [2, { keypoints: f, score: n / f.length }];
    } }); }); }
    exports.decodeSinglePose = decodeSinglePose;
    var BASE_URL = "https://storage.googleapis.com/tfjs-models/weights/posenet/", checkpoints = { 1.01: { url: BASE_URL + "mobilenet_v1_101/", architecture: mobileNetArchitectures[100] }, 1: { url: BASE_URL + "mobilenet_v1_100/", architecture: mobileNetArchitectures[100] }, .75: { url: BASE_URL + "mobilenet_v1_075/", architecture: mobileNetArchitectures[75] }, .5: { url: BASE_URL + "mobilenet_v1_050/", architecture: mobileNetArchitectures[50] } }, ModelWeights = function () { function e(e) { this.variables = e; } return e.prototype.weights = function (e) { return this.variables["MobilenetV1/" + e + "/weights"]; }, e.prototype.depthwiseBias = function (e) { return this.variables["MobilenetV1/" + e + "/biases"]; }, e.prototype.convBias = function (e) { return this.depthwiseBias(e); }, e.prototype.depthwiseWeights = function (e) { return this.variables["MobilenetV1/" + e + "/depthwise_weights"]; }, e.prototype.dispose = function () { for (var e in this.variables)
        this.variables[e].dispose(); }, e; }(), _this = void 0, PoseNet = function () { function e(e) { this.mobileNet = e; } return e.prototype.predictForSinglePose = function (e, t) { var r = this; return void 0 === t && (t = 16), assertValidOutputStride(t), tfjs_226186fd_js_1.e(function () { var n = r.mobileNet.predict(e, t), o = r.mobileNet.convToOutput(n, "heatmap_2"), i = r.mobileNet.convToOutput(n, "offset_2"); return { heatmapScores: o.sigmoid(), offsets: i }; }); }, e.prototype.predictForMultiPose = function (e, t) { var r = this; return void 0 === t && (t = 16), tfjs_226186fd_js_1.e(function () { var n = r.mobileNet.predict(e, t), o = r.mobileNet.convToOutput(n, "heatmap_2"), i = r.mobileNet.convToOutput(n, "offset_2"), a = r.mobileNet.convToOutput(n, "displacement_fwd_2"), s = r.mobileNet.convToOutput(n, "displacement_bwd_2"); return { heatmapScores: o.sigmoid(), offsets: i, displacementFwd: a, displacementBwd: s }; }); }, e.prototype.estimateSinglePose = function (e, t, r, n) { return void 0 === t && (t = .5), void 0 === r && (r = !1), void 0 === n && (n = 16), __awaiter(this, void 0, void 0, function () { var o, i, a, s, u, l, c, p, f, h, d, v = this; return __generator(this, function (m) { switch (m.label) {
        case 0: return assertValidOutputStride(n), assertValidScaleFactor(t), o = getInputTensorDimensions(e), i = o[0], a = o[1], s = getValidResolution(t, i, n), u = getValidResolution(t, a, n), l = tfjs_226186fd_js_1.e(function () { var t = toResizedInputTensor(e, s, u, r); return v.predictForSinglePose(t, n); }), c = l.heatmapScores, p = l.offsets, [4, decodeSinglePose(c, p, n)];
        case 1: return f = m.sent(), h = i / s, d = a / u, c.dispose(), p.dispose(), [2, scalePose(f, h, d)];
    } }); }); }, e.prototype.estimateMultiplePoses = function (e, t, r, n, o, i, a) { return void 0 === t && (t = .5), void 0 === r && (r = !1), void 0 === n && (n = 16), void 0 === o && (o = 5), void 0 === i && (i = .5), void 0 === a && (a = 20), __awaiter(this, void 0, void 0, function () { var s, u, l, c, p, f, h, d, v, m, g, b = this; return __generator(this, function (_) { switch (_.label) {
        case 0: return assertValidOutputStride(n), assertValidScaleFactor(t), s = getInputTensorDimensions(e), u = s[0], l = s[1], c = getValidResolution(t, u, n), p = getValidResolution(t, l, n), f = tfjs_226186fd_js_1.e(function () { var t = toResizedInputTensor(e, c, p, r); return b.predictForMultiPose(t, n); }), h = f.heatmapScores, d = f.offsets, v = f.displacementFwd, m = f.displacementBwd, [4, decodeMultiplePoses(h, d, v, m, n, o, i, a)];
        case 1: return g = _.sent(), h.dispose(), d.dispose(), v.dispose(), m.dispose(), [2, scalePoses(g, u / c, l / p)];
    } }); }); }, e.prototype.dispose = function () { this.mobileNet.dispose(); }, e; }();
    exports.checkpoints = checkpoints;
    exports.PoseNet = PoseNet;
    function load(e) { return void 0 === e && (e = 1.01), __awaiter(this, void 0, void 0, function () { var t, r; return __generator(this, function (n) { switch (n.label) {
        case 0:
            if (null == tfjs_226186fd_js_1.k)
                throw new Error("Cannot find TensorFlow.js. If you are using a <script> tag, please also include @tensorflow/tfjs on the page before using this model.");
            return t = Object.keys(checkpoints), tfjs_226186fd_js_1.a.assert("number" == typeof e, function () { return "got multiplier type of " + typeof e + " when it should be a number."; }), tfjs_226186fd_js_1.a.assert(t.indexOf(e.toString()) >= 0, function () { return "invalid multiplier value of " + e + ".  No checkpoint exists for that multiplier. Must be one of " + t.join(",") + "."; }), [4, mobilenetLoader.load(e)];
        case 1: return r = n.sent(), [2, new PoseNet(r)];
    } }); }); }
    exports.load = load;
    var mobilenetLoader = { load: function (e) { return __awaiter(_this, void 0, void 0, function () { var t, r, n; return __generator(this, function (o) { switch (o.label) {
            case 0: return t = checkpoints[e], [4, new CheckpointLoader(t.url).getAllVariables()];
            case 1: return r = o.sent(), n = new ModelWeights(r), [2, new MobileNet(n, t.architecture)];
        } }); }); } };
});
//# sourceMappingURL=posenet.js.map
//# sourceMappingURL=posenet.js.map