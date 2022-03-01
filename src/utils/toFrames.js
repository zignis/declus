/* eslint-disable no-await-in-loop */

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

module.exports = async (opts) => {
  const {
    input,
    output,
    coalesce = true,
    inMemory = false,
  } = opts;

  const format = output
    ? path.extname(output).substring(1)
    : undefined;

  if (format && !supportedFormats.has(format)) {
    throw new Error(`Invalid output format "${format}"`);
  }

  const results = await getPixels(input);
  const { shape } = results;

  if (shape.length === 4) {
    const [
      frames,
      width,
      height,
      channels,
    ] = shape;

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
          await saveFrameToMemory(
            results.pick(i),
            format,
            output.replace('%d', i),
          );
        } else {
          await saveFrame(
            results.pick(i),
            format,
            output.replace('%d', i),
          );
        }
      }
    }
  } else if (output) {
    if (inMemory) {
      await saveFrameToMemory(
        results,
        format,
        output.replace('%d', 0),
      );
    } else {
      await saveFrame(
        results,
        format,
        output.replace('%d', 0),
      );
    }
  }

  return results;
};
