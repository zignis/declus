var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try {
            step(generator.next(value));
        }
        catch (e) {
            reject(e);
        } }
        function rejected(value) { try {
            step(generator["throw"](value));
        }
        catch (e) {
            reject(e);
        } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function () { if (t[0] & 1)
            throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function () { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f)
            throw new TypeError("Generator is already executing.");
        while (_)
            try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done)
                    return t;
                if (y = 0, t)
                    op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0:
                    case 1:
                        t = op;
                        break;
                    case 4:
                        _.label++;
                        return { value: op[1], done: false };
                    case 5:
                        _.label++;
                        y = op[1];
                        op = [0];
                        continue;
                    case 7:
                        op = _.ops.pop();
                        _.trys.pop();
                        continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                            _ = 0;
                            continue;
                        }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                            _.label = op[1];
                            break;
                        }
                        if (op[0] === 6 && _.label < t[1]) {
                            _.label = t[1];
                            t = op;
                            break;
                        }
                        if (t && _.label < t[2]) {
                            _.label = t[2];
                            _.ops.push(op);
                            break;
                        }
                        if (t[2])
                            _.ops.pop();
                        _.trys.pop();
                        continue;
                }
                op = body.call(thisArg, _);
            }
            catch (e) {
                op = [6, e];
                y = 0;
            }
            finally {
                f = t = 0;
            }
        if (op[0] & 5)
            throw op[1];
        return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import path from 'path';
import pify from 'pify';
import pump from 'pump-promise';
import savePixels from 'save-pixels';
import { MemoryStream } from './memoryStore';
var getPixels = pify(require('get-pixels'));
// Supported frame formats
var supportedFormats = new Set([
    'jpg',
    'png',
    'gif',
]);
function saveFrameToMemory(data, format, filename) {
    var stream = savePixels(data, format);
    var memStream = new MemoryStream(filename);
    return pump(stream, memStream);
}
var toFrames = function (_a) {
    var input = _a.input, output = _a.output, _b = _a.coalesce, coalesce = _b === void 0 ? true : _b;
    return __awaiter(void 0, void 0, void 0, function () {
        var format, results, shape, frames_1, width, height, channels, numPixelsInFrame, i, currIndex, prevIndex, j, curr, prev, k;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    format = output
                        ? path.extname(output).substring(1)
                        : undefined;
                    if (format && !supportedFormats.has(format)) {
                        throw new Error("Invalid output format \"".concat(format, "\""));
                    }
                    return [4 /*yield*/, getPixels(input)];
                case 1:
                    results = _c.sent();
                    shape = results.shape;
                    if (!(shape.length === 4))
                        return [3 /*break*/, 6];
                    frames_1 = shape[0], width = shape[1], height = shape[2], channels = shape[3];
                    numPixelsInFrame = width * height;
                    i = 0;
                    _c.label = 2;
                case 2:
                    if (!(i < frames_1))
                        return [3 /*break*/, 5];
                    if (i > 0 && coalesce) {
                        currIndex = results.index(i, 0, 0, 0);
                        prevIndex = results.index(i - 1, 0, 0, 0);
                        for (j = 0; j < numPixelsInFrame; j += 1) {
                            curr = currIndex + j * channels;
                            if (results.data[curr + channels - 1] === 0) {
                                prev = prevIndex + j * channels;
                                for (k = 0; k < channels; k += 1) {
                                    results.data[curr + k] = results.data[prev + k];
                                }
                            }
                        }
                    }
                    if (!output)
                        return [3 /*break*/, 4];
                    return [4 /*yield*/, saveFrameToMemory(results.pick(i), format, output.replace('%d', String(i)))];
                case 3:
                    _c.sent();
                    _c.label = 4;
                case 4:
                    i += 1;
                    return [3 /*break*/, 2];
                case 5: return [3 /*break*/, 8];
                case 6:
                    if (!output)
                        return [3 /*break*/, 8];
                    return [4 /*yield*/, saveFrameToMemory(results, format, output.replace('%d', '0'))];
                case 7:
                    _c.sent();
                    _c.label = 8;
                case 8: return [2 /*return*/, results];
            }
        });
    });
};
export default toFrames;
