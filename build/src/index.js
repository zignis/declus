var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
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
import { nanoid } from 'nanoid';
import axios from 'axios';
import GifEncoder from 'gif-encoder';
import extractFrames from './utils/toFrames';
import { memStore } from './utils/memoryStore';
function loadImage(url) {
    return new Promise(function (resolve) {
        var image = new Image();
        image.onload = (function () { return resolve(image); });
        image.src = url;
    });
}
var declus = function (_a) {
    var width = _a.width, height = _a.height, baseLayer = _a.baseLayer, layers = _a.layers, _b = _a.repeat, repeat = _b === void 0 ? 0 : _b, _c = _a.quality, quality = _c === void 0 ? 10 : _c, delay = _a.delay, frameRate = _a.frameRate, alphaColor = _a.alphaColor, _d = _a.alpha, alpha = _d === void 0 ? true : _d, _e = _a.coalesce, coalesce = _e === void 0 ? true : _e, _f = _a.stretchLayers, stretchLayers = _f === void 0 ? false : _f, _g = _a.encoderOptions, encoderOptions = _g === void 0 ? {} : _g, _h = _a.initCanvasContext, initCanvasContext = _h === void 0 ? function () { } : _h, _j = _a.encoderOnData, encoderOnData = _j === void 0 ? function () { } : _j, _k = _a.encoderOnEnd, encoderOnEnd = _k === void 0 ? function () { } : _k, _l = _a.encoderOnError, encoderOnError = _l === void 0 ? function () { } : _l, _m = _a.encoderOnReadable, encoderOnReadable = _m === void 0 ? function () { } : _m, _o = _a.encoderOnWriteHeader, encoderOnWriteHeader = _o === void 0 ? function () { } : _o, _p = _a.encoderOnFrame, encoderOnFrame = _p === void 0 ? function () { } : _p, _q = _a.encoderOnFinish, encoderOnFinish = _q === void 0 ? function () { } : _q, _r = _a.beforeBaseLayerDraw, beforeBaseLayerDraw = _r === void 0 ? function () { } : _r, _s = _a.afterBaseLayerDraw, afterBaseLayerDraw = _s === void 0 ? function () { } : _s, _t = _a.beforeLayerDraw, beforeLayerDraw = _t === void 0 ? function () { } : _t, _u = _a.afterLayerDraw, afterLayerDraw = _u === void 0 ? function () { } : _u, _v = _a.outputDir, outputDir = _v === void 0 ? '.' : _v, _w = _a.frameExtension, frameExtension = _w === void 0 ? 'png' : _w;
    return new Promise(function (resolve, reject) { return __awaiter(void 0, void 0, void 0, function () {
        var dir, backPath, backFilePrefix, backFileSuffix, frames_1, currentFrames, frameCount, canvas, ctx, encoder, countArray, _i, countArray_1, chunk, frame, backgroundFile, image, dataArray_1, _a, countArray_2, i, shouldSkip, _b, layers_1, layer, buffer, overlayResponse, layerImg, shouldSkip, pixels, error_1;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (frameRate && delay) {
                        reject(new Error('The "frameRate" option cannot be used with the "delay" option'));
                    }
                    dir = "".concat(outputDir, "/").concat(nanoid());
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 16, 17, 18]);
                    return [4 /*yield*/, extractFrames({
                            input: baseLayer.data,
                            output: "".concat(dir, "/frame_%d.").concat(frameExtension),
                            coalesce: coalesce,
                        })];
                case 2:
                    _c.sent();
                    backPath = "".concat(dir, "/");
                    backFilePrefix = 'frame_';
                    backFileSuffix = ".".concat(frameExtension);
                    frames_1 = [];
                    currentFrames = Object.keys(memStore)
                        .filter(function (key) { return key.startsWith(dir); })
                        .reduce(function (obj, key) {
                        // eslint-disable-next-line no-param-reassign
                        obj[key] = memStore[key];
                        return obj;
                    }, {});
                    frameCount = Object.keys(currentFrames).length;
                    canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    ctx = canvas.getContext('2d');
                    ctx.globalAlpha = alpha ? 0 : 1;
                    initCanvasContext(ctx);
                    encoder = new GifEncoder(width, height, encoderOptions);
                    encoder.setRepeat(Number(repeat));
                    encoder.setQuality(quality);
                    if (delay) {
                        encoder.setDelay(delay);
                    }
                    if (frameRate) {
                        encoder.setFrameRate(Number(frameRate));
                    }
                    if (alphaColor) {
                        encoder.setTransparent(alphaColor);
                    }
                    encoder.writeHeader();
                    countArray = Array
                        .apply(null, { length: frameCount })
                        .map(Number.call, Number);
                    if (!(frames_1.length === 0)) return [3 /*break*/, 6];
                    _i = 0, countArray_1 = countArray;
                    _c.label = 3;
                case 3:
                    if (!(_i < countArray_1.length)) return [3 /*break*/, 6];
                    chunk = countArray_1[_i];
                    frame = chunk.toString();
                    backgroundFile = "".concat(backPath).concat(backFilePrefix).concat(frame).concat(backFileSuffix);
                    return [4 /*yield*/, loadImage(memStore[backgroundFile])];
                case 4:
                    image = _c.sent();
                    frames_1.push(image);
                    _c.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6:
                    dataArray_1 = [];
                    // Encoder events
                    encoder.on('data', function (buffer) {
                        encoderOnData(buffer);
                        dataArray_1.push(buffer);
                    });
                    encoder.on('end', function () {
                        encoderOnEnd();
                        resolve(Buffer.concat(dataArray_1));
                    });
                    encoder.on('error', function (error) {
                        encoderOnError(error);
                        reject(error);
                    });
                    encoder.on('readable', encoderOnReadable);
                    encoder.on('writeHeader#start', encoderOnWriteHeader);
                    encoder.on('frame#start', encoderOnFrame);
                    encoder.on('finish#start', encoderOnFinish);
                    _a = 0, countArray_2 = countArray;
                    _c.label = 7;
                case 7:
                    if (!(_a < countArray_2.length)) return [3 /*break*/, 15];
                    i = countArray_2[_a];
                    ctx.clearRect(0, 0, width, height);
                    beforeBaseLayerDraw(ctx, frames_1[i], i, countArray.length);
                    // Draw base frame
                    if (baseLayer.skipIndexes
                        && Array.isArray(baseLayer.skipIndexes)
                        && baseLayer.skipIndexes.includes(i)) {
                        // eslint-disable-next-line no-continue
                        return [3 /*break*/, 14];
                    }
                    else if (baseLayer.skipFunction) {
                        shouldSkip = baseLayer.skipFunction(i, countArray.length);
                        // eslint-disable-next-line no-continue
                        if (shouldSkip)
                            return [3 /*break*/, 14];
                    }
                    else if (baseLayer.drawFunction) {
                        baseLayer.drawFunction(ctx, frames_1[i], i, countArray.length);
                    }
                    else if (stretchLayers) {
                        ctx.drawImage(frames_1[i], 0, 0, width, height);
                    }
                    else {
                        ctx.drawImage(frames_1[i], baseLayer.marginLeft || 0, baseLayer.marginTop || 0, baseLayer.width || width, baseLayer.height || height);
                    }
                    afterBaseLayerDraw(ctx, frames_1[i], i, countArray.length);
                    _b = 0, layers_1 = layers;
                    _c.label = 8;
                case 8:
                    if (!(_b < layers_1.length)) return [3 /*break*/, 13];
                    layer = layers_1[_b];
                    // eslint-disable-next-line no-continue
                    if (layer.disabled)
                        return [3 /*break*/, 12];
                    buffer = void 0;
                    if (!Buffer.isBuffer(layer.data)) return [3 /*break*/, 9];
                    buffer = layer.data;
                    return [3 /*break*/, 11];
                case 9: return [4 /*yield*/, axios.get(layer.data, { responseType: 'arraybuffer' })];
                case 10:
                    overlayResponse = _c.sent();
                    buffer = Buffer.from(overlayResponse.data, 'base64');
                    _c.label = 11;
                case 11:
                    layerImg = new Image();
                    layerImg.src = buffer.toString();
                    beforeLayerDraw(ctx, layerImg, i, countArray.length, layers.indexOf(layer));
                    // Custom draw function
                    if (layer.skipIndexes
                        && Array.isArray(layer.skipIndexes)
                        && layer.skipIndexes.includes(i)) {
                        // eslint-disable-next-line no-continue
                        return [3 /*break*/, 12];
                    }
                    else if (layer.skipFunction) {
                        shouldSkip = layer.skipFunction(i, countArray.length);
                        // eslint-disable-next-line no-continue
                        if (shouldSkip)
                            return [3 /*break*/, 12];
                    }
                    else if (layer.drawFunction) {
                        layer.drawFunction(ctx, layerImg, i, countArray.length);
                    }
                    else if (stretchLayers) {
                        ctx.drawImage(layerImg, 0, 0, width, height);
                    }
                    else {
                        ctx.drawImage(layerImg, layer.marginLeft || 0, layer.marginTop || 0, layer.width || width, layer.height || height);
                    }
                    afterLayerDraw(ctx, layerImg, i, countArray.length, layers.indexOf(layer));
                    _c.label = 12;
                case 12:
                    _b++;
                    return [3 /*break*/, 8];
                case 13:
                    ctx.restore();
                    pixels = ctx.getImageData(0, 0, width, height).data;
                    encoder.addFrame(pixels);
                    _c.label = 14;
                case 14:
                    _a++;
                    return [3 /*break*/, 7];
                case 15:
                    // Return data
                    encoder.finish();
                    return [3 /*break*/, 18];
                case 16:
                    error_1 = _c.sent();
                    reject(error_1);
                    return [3 /*break*/, 18];
                case 17:
                    // Flushing frames stored in memory
                    Object.keys(memStore).forEach(function (key) {
                        if (key.startsWith(dir)) {
                            delete memStore[key];
                        }
                    });
                    return [7 /*endfinally*/];
                case 18: return [2 /*return*/];
            }
        });
    }); });
};
export default declus;
