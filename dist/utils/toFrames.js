"use strict";
/* eslint-disable no-await-in-loop */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require('fs');
const path = require('path');
const pify = require('pify');
const pump = require('pump-promise');
const getPixels = pify(require('get-pixels'));
const savePixels = require('save-pixels');
const { MemoryStream } = require('./memoryStore');
// Supported frame formats
const supportedFormats = new Set([
    'jpg',
    'png',
    'gif',
]);
function saveFrame(data, format, filename) {
    const stream = savePixels(data, format);
    return pump(stream, fs.createWriteStream(filename));
}
function saveFrameToMemory(data, format, filename) {
    const stream = savePixels(data, format);
    const memStream = new MemoryStream(filename);
    return pump(stream, memStream);
}
module.exports = ({ input, output, coalesce = true, inMemory = false, }) => __awaiter(void 0, void 0, void 0, function* () {
    const format = output
        ? path.extname(output).substring(1)
        : undefined;
    if (format && !supportedFormats.has(format)) {
        throw new Error(`Invalid output format "${format}"`);
    }
    const results = yield getPixels(input);
    const { shape } = results;
    if (shape.length === 4) {
        const [frames, width, height, channels,] = shape;
        const numPixelsInFrame = width * height;
        for (let i = 0; i < frames; i += 1) {
            if (i > 0 && coalesce) {
                const currIndex = results.index(i, 0, 0, 0);
                const prevIndex = results.index(i - 1, 0, 0, 0);
                for (let j = 0; j < numPixelsInFrame; j += 1) {
                    const curr = currIndex + j * channels;
                    if (results.data[curr + channels - 1] === 0) {
                        const prev = prevIndex + j * channels;
                        for (let k = 0; k < channels; k += 1) {
                            results.data[curr + k] = results.data[prev + k];
                        }
                    }
                }
            }
            if (output) {
                if (inMemory) {
                    yield saveFrameToMemory(results.pick(i), format, output.replace('%d', String(i)));
                }
                else {
                    yield saveFrame(results.pick(i), format, output.replace('%d', String(i)));
                }
            }
        }
    }
    else if (output) {
        if (inMemory) {
            yield saveFrameToMemory(results, format, output.replace('%d', '0'));
        }
        else {
            yield saveFrame(results, format, output.replace('%d', '0'));
        }
    }
    return results;
});
//# sourceMappingURL=toFrames.js.map