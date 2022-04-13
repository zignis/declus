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

const isValidNumber = (parameter) => {
  if (!parameter || Number.isNaN(parameter)) {
    return false;
  }
  return true;
};

const declus = ({
  width,
  height,
  baseLayer,
  layers,
  repeat = 0,
  quality = 10,
  delay,
  frameRate,
  alphaColor,
  alpha = true,
  coalesce = true,
  stretchLayers = false,
  encoderOptions = {},
  initCanvasContext = () => {},
  encoderOnData = () => {},
  encoderOnEnd = () => {},
  encoderOnError = () => {},
  encoderOnReadable = () => {},
  encoderOnWriteHeader = () => {},
  encoderOnFrame = () => {},
  encoderOnFinish = () => {},
  beforeBaseLayerDraw = () => {},
  afterBaseLayerDraw = () => {},
  beforeLayerDraw = () => {},
  afterLayerDraw = () => {},
  outputDir = '.',
  inMemory = false,
  frameExtension = 'png',
  outputFilename = nanoid(),
// eslint-disable-next-line no-async-promise-executor
}) => new Promise(async (resolve, reject) => {
  if (!isValidNumber(height)) {
    reject(
      new Error(
        'A valid "height" option must be provided',
      ),
    );
  }

  if (!isValidNumber(width)) {
    reject(
      new Error(
        'A valid "width" option must be provided',
      ),
    );
  }

  if (!baseLayer || typeof baseLayer !== 'object') {
    reject(
      new Error(
        'A valid "baseLayer" must be provided',
      ),
    );
  }

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
      input: baseLayer.data,
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
      { alpha },
    );

    initCanvasContext(ctx);

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

    // Prepare base layer
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

    // Render frames
    for (const i of countArray) {
      ctx.clearRect(0, 0, width, height);

      beforeBaseLayerDraw(
        ctx,
        frames[i],
        i,
        countArray.length,
      );

      // Draw base frame
      if (
        baseLayer.skipIndexes
        && Array.isArray(baseLayer.skipIndexes)
        && baseLayer.skipIndexes.includes(i)
      ) {
        // eslint-disable-next-line no-continue
        continue;
      } else if (
        baseLayer.skipFunction
        && typeof baseLayer.skipFunction === 'function'
      ) {
        const shouldSkip = baseLayer.skipFunction(
          i,
          countArray.length,
        );
        // eslint-disable-next-line no-continue
        if (shouldSkip) continue;
      } else if (
        baseLayer.drawFunction
        && typeof baseLayer.drawFunction === 'function'
      ) {
        baseLayer.drawFunction(
          ctx,
          frames[i],
          i,
          countArray.length,
        );
      } else if (stretchLayers) {
        ctx.drawImage(
          frames[i],
          0,
          0,
          width,
          height,
        );
      } else {
        ctx.drawImage(
          frames[i],
          baseLayer.marginLeft ?? 0,
          baseLayer.marginTop ?? 0,
          baseLayer.width ?? width,
          baseLayer.height ?? height,
        );
      }

      afterBaseLayerDraw(
        ctx,
        frames[i],
        i,
        countArray.length,
      );

      // Draw layers
      for (const layer of layers) {
        // eslint-disable-next-line no-continue
        if (layer.disabled) continue;

        let buffer;

        // Get layer image buffer
        if (Buffer.isBuffer(layer.data)) {
          buffer = layer.data;
        } else {
          const overlayResponse = await axios.get(
            layer.data,
            { responseType: 'arraybuffer' },
          );
          buffer = Buffer.from(overlayResponse.data, 'base64');
        }
        const layerImg = new Canvas.Image();
        layerImg.src = buffer;

        beforeLayerDraw(
          ctx,
          layerImg,
          i,
          countArray.length,
          layers.indexOf(layer),
        );

        // Custom draw function
        if (
          layer.skipIndexes
          && Array.isArray(layer.skipIndexes)
          && layer.skipIndexes.includes(i)
        ) {
          // eslint-disable-next-line no-continue
          continue;
        } else if (
          layer.skipFunction
          && typeof layer.skipFunction === 'function'
        ) {
          const shouldSkip = layer.skipFunction(
            i,
            countArray.length,
          );
          // eslint-disable-next-line no-continue
          if (shouldSkip) continue;
        } else if (
          layer.drawFunction
          && typeof layer.drawFunction === 'function'
        ) {
          layer.drawFunction(
            ctx,
            layerImg,
            i,
            countArray.length,
          );
        } else if (stretchLayers) {
          ctx.drawImage(
            layerImg,
            0,
            0,
            width,
            height,
          );
        } else {
          ctx.drawImage(
            layerImg,
            layer.marginLeft ?? 0,
            layer.marginTop ?? 0,
            layer.width ?? width,
            layer.height ?? height,
          );
        }

        afterLayerDraw(
          ctx,
          layerImg,
          i,
          countArray.length,
          layers.indexOf(layer),
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
