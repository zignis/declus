/* eslint-disable no-unused-vars */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */

const fs = require('fs');
const { nanoid } = require('nanoid');
const axios = require('axios');
const GifEncoder = require('gif-encoder');
const Canvas = require('canvas');
const extractFrames = require('./utils/toFrames');
const { memStore } = require('./utils/memoryStore');

type DrawFunction = (
  context: CanvasRenderingContext2D,
  layerImg: HTMLImageElement,
  index: number,
  totalFrames: number,
) => void;

type SkipFunction = (
  index: number,
  totalFrames: number,
) => boolean;

type EncoderOptions = {
  highWaterMark?: number
};

type BaseLayerDraw = (
  context: CanvasRenderingContext2D,
  layerImg: HTMLImageElement,
  index: number,
  totalFrames: number,
) => void

type LayerDraw = (
  context: CanvasRenderingContext2D,
  layerImg: HTMLImageElement,
  index: number,
  totalFrames: number,
  layerIndex: number,
) => void

interface BaseLayer {
  data: Buffer | string,
  marginLeft?: number,
  marginTop?: number,
  width?: number,
  height?: number,
  drawFunction?: DrawFunction,
  skipFunction?: SkipFunction,
  skipIndexes?: Array<number>,
}

interface Layer {
  data: Buffer | string,
  marginLeft?: number,
  marginTop?: number,
  width?: number,
  height?: number,
  drawFunction?: DrawFunction,
  skipFunction?: SkipFunction,
  skipIndexes?: Array<number>,
  disabled?: boolean,
}

const isValidNumber = (parameter: any): boolean => {
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
} : {
  width: number,
  height: number,
  baseLayer: BaseLayer,
  layers: Array<Layer>,
  repeat?: number,
  quality?: number,
  delay?: number,
  frameRate?: number,
  alphaColor?: number,
  alpha?: boolean,
  coalesce?: boolean,
  stretchLayers?: boolean,
  encoderOptions?: EncoderOptions,
  initCanvasContext?: (ctx: CanvasRenderingContext2D) => void,
  encoderOnData?: (data: Buffer) => void,
  encoderOnEnd?: () => void,
  encoderOnError?: (error: any) => void,
  encoderOnReadable?: () => void,
  encoderOnWriteHeader?: () => void,
  encoderOnFrame?: () => void,
  encoderOnFinish?: () => void,
  beforeBaseLayerDraw?: BaseLayerDraw,
  afterBaseLayerDraw?: BaseLayerDraw,
  beforeLayerDraw?: LayerDraw,
  afterLayerDraw?: LayerDraw,
  outputDir?: string,
  inMemory?: boolean,
  frameExtension?: 'png' | 'jpg' | 'gif',
  outputFilename?: string | number,
// eslint-disable-next-line no-async-promise-executor
}): Promise<Buffer | Error> => new Promise<any>(async (resolve, reject) => {
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
    if (!inMemory) {
      await fs.mkdirSync(dir);
    }

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

    let frameCount: number;

    if (inMemory) {
      const currentFrames = Object.keys(memStore)
        .filter((key) => key.startsWith(dir))
        .reduce((obj: any, key) => {
          // eslint-disable-next-line no-param-reassign
          obj[key] = memStore[key];
          return obj;
        }, {});
      frameCount = Object.keys(currentFrames).length as number;
    } else {
      frameCount = await fs.readdirSync(backPath).length as number;
    }

    // Create canvas context
    const canvas = Canvas.createCanvas(width, height) as HTMLCanvasElement;
    const ctx = canvas.getContext(
      '2d',
      { alpha },
    ) as CanvasRenderingContext2D;

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

    // Prepare base layer
    if (frames.length === 0) {
      for (let i = 0; i < frameCount; i += 1) {
        const frame = i.toString();
        const backgroundFile = `${backPath}${backFilePrefix}${frame}${backFileSuffix}`;
        const image = await Canvas.loadImage(
          inMemory
            ? memStore[backgroundFile]
            : backgroundFile,
        );
        frames.push(image);
      }
    }

    const dataArray: Array<Buffer> = [];

    // Encoder events
    encoder.on('data', (buffer: Buffer) => {
      encoderOnData(buffer);
      dataArray.push(buffer);
    });

    encoder.on('end', () => {
      encoderOnEnd();
      resolve({
        buffer: Buffer.concat(dataArray),
        filename: `${outputFilename}.gif`,
      });
    });

    encoder.on('error', (error: Error) => {
      encoderOnError(error);
      reject(error);
    });

    encoder.on('readable', encoderOnReadable);
    encoder.on('writeHeader', encoderOnWriteHeader);
    encoder.on('frame', encoderOnFrame);
    encoder.on('finish', encoderOnFinish);

    // Render frames
    for (let i = 0; i < frameCount; i += 1) {
      ctx.clearRect(0, 0, width, height);

      beforeBaseLayerDraw(
        ctx,
        frames[i],
        i,
        frameCount,
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
          frameCount,
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
          frameCount,
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
          baseLayer.marginLeft || 0,
          baseLayer.marginTop || 0,
          baseLayer.width || width,
          baseLayer.height || height,
        );
      }

      afterBaseLayerDraw(
        ctx,
        frames[i],
        i,
        frameCount,
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
          frameCount,
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
            frameCount,
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
            frameCount,
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
            layer.marginLeft || 0,
            layer.marginTop || 0,
            layer.width || width,
            layer.height || height,
          );
        }

        afterLayerDraw(
          ctx,
          layerImg,
          i,
          frameCount,
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
