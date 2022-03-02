/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
/* eslint-disable prefer-spread */

const fs = require('fs');
const { nanoid } = require('nanoid');
const axios = require('axios');
const GifEncoder = require('gif-encoder');
const Canvas = require('canvas');
const extractFrames = require('./utils/toFrames');
const { memStore } = require('./utils/memoryStore');

const declus = ({
  width = 640,
  height = 360,
  repeat = 0,
  quality = 10,
  delay,
  frameRate,
  alphaColor,
  coalesce = true,
  fillImage = false,
  encoderOptions = {},
  encoderOnData = () => {},
  encoderOnEnd = () => {},
  encoderOnError = () => {},
  encoderOnReadable = () => {},
  encoderOnWriteHeader = () => {},
  encoderOnFrame = () => {},
  encoderOnFinish = () => {},
  outputDir = '.',
  inMemory = false,
  frameExtension = 'png',
  gifData,
  imageData,
  outputFilename = nanoid(),
  gifCoordinates = {
    marginLeft: 0,
    marginTop: 0,
    width,
    height,
  },
  imageCoordinates = {
    marginLeft: 0,
    marginTop: 0,
    width,
    height,
  },
// eslint-disable-next-line no-async-promise-executor
}) => new Promise(async (resolve, reject) => {
  if (frameRate && delay) {
    reject(
      new Error(
        'The "frameRate" option cannot be used with the "delay" option',
      ),
    );
  }

  const dir = `${outputDir}/${nanoid()}`;

  try {
    // Create a temporary frame store
    if (!inMemory) await fs.mkdirSync(dir);

    await extractFrames({
      input: gifData,
      output: `${dir}/frame_%d.${frameExtension}`,
      coalesce,
      inMemory,
    });

    const backPath = `${dir}/`;
    const backFilePrefix = 'frame_';
    const backFileSuffix = `.${frameExtension}`;
    const frames = [];

    let frameCount;

    if (inMemory) {
      const currentFrames = Object.keys(memStore)
        .filter((key) => key.startsWith(dir))
        .reduce((obj, key) => {
          // eslint-disable-next-line no-param-reassign
          obj[key] = memStore[key];
          return obj;
        }, {});
      frameCount = Object.keys(currentFrames).length;
    } else {
      frameCount = await fs.readdirSync(backPath).length;
    }

    // Create canvas context
    const canvas = Canvas.createCanvas(width, height);
    const ctx = canvas.getContext(
      '2d',
      { alpha: true },
    );

    // Initialize encoder
    const encoder = new GifEncoder(
      width,
      height,
      encoderOptions,
    );

    encoder.setRepeat(Number(repeat));
    encoder.setQuality(quality);

    if (delay) encoder.setDelay(delay);
    if (frameRate) encoder.setFrameRate(Number(frameRate));
    if (alphaColor) encoder.setTransparent(alphaColor);

    encoder.writeHeader();

    const countArray = Array
      .apply(null, { length: frameCount })
      .map(Number.call, Number);

    // Render GIF frames
    if (frames.length === 0) {
      for (const chunk of countArray) {
        const frame = chunk.toString();
        const backgroundFile = `${backPath}${backFilePrefix}${frame}${backFileSuffix}`;
        const image = await Canvas.loadImage(
          inMemory
            ? memStore[backgroundFile]
            : backgroundFile,
        );
        frames.push(image);
      }
    }

    let overlayBuffer;

    // Get overlay buffer
    if (Buffer.isBuffer(imageData)) {
      overlayBuffer = imageData;
    } else {
      const overlayResponse = await axios.get(
        imageData,
        { responseType: 'arraybuffer' },
      );
      overlayBuffer = Buffer.from(overlayResponse.data, 'base64');
    }

    const compOverlay = new Canvas.Image();
    compOverlay.src = overlayBuffer;

    const dataArray = [];

    // Encoder events
    encoder.on('data', (buffer) => {
      encoderOnData(buffer);
      dataArray.push(buffer);
    });

    encoder.on('end', () => {
      encoderOnEnd();
      resolve(
        Buffer.concat(dataArray),
        `${outputFilename}.gif`,
      );
    });

    encoder.on('error', (error) => {
      encoderOnError(error);
      reject(error);
    });

    encoder.on('readable', encoderOnReadable);
    encoder.on('writeHeader', encoderOnWriteHeader);
    encoder.on('frame', encoderOnFrame);
    encoder.on('finish', encoderOnFinish);

    // Render overlay
    for (const i of countArray) {
      ctx.clearRect(0, 0, width, height);

      if (fillImage) {
        ctx.drawImage(frames[i], 0, 0, width, height);
        ctx.drawImage(compOverlay, 0, 0, width, height);
      } else {
        ctx.drawImage(
          frames[i],
          gifCoordinates.marginLeft,
          gifCoordinates.marginTop,
          gifCoordinates.width,
          gifCoordinates.height,
        );
        ctx.drawImage(
          compOverlay,
          imageCoordinates.marginLeft,
          imageCoordinates.marginTop,
          imageCoordinates.width,
          imageCoordinates.height,
        );
      }

      ctx.restore();

      const pixels = ctx.getImageData(0, 0, width, height).data;
      encoder.addFrame(pixels);
    }

    // Return data
    encoder.finish();
  } catch (error) {
    reject(error);
  } finally {
    // Delete the temporary frame store
    if (inMemory) {
      // Flushing frames stored in memory
      Object.keys(memStore).forEach((key) => {
        if (key.startsWith(dir)) {
          delete memStore[key];
        }
      });
    } else {
      fs.rm(
        dir,
        {
          recursive: true,
          force: true,
        },
        () => {},
      );
    }
  }
});

module.exports = declus;
