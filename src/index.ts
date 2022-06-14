import { nanoid } from 'nanoid';
import axios from 'axios';
import GifEncoder from 'gif-encoder';
import extractFrames from './utils/toFrames';
import { memStore } from './utils/memoryStore';

export type DrawFunction = (
  context: CanvasRenderingContext2D,
  layerImg: HTMLImageElement,
  index: number,
  totalFrames: number,
) => void;

export type PseudoDrawFunction = (
  context: CanvasRenderingContext2D,
  layerImg: HTMLImageElement,
  index: number,
  totalFrames: number,
  layerIndex: number,
) => void;

export type SkipFunction = (
  index: number,
  totalFrames: number,
) => boolean;

export interface Layer {
  data: string | Buffer;
  marginLeft?: number;
  marginTop?: number;
  width?: number;
  height?: number;
  drawFunction?: DrawFunction;
  skipFunction?: SkipFunction;
  skipIndexes?: Array<number>;
  disabled?: boolean,
}

function loadImage(url: string): any {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = (() => resolve(image));
    image.src = url;
  });
}

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
  frameExtension = 'png',
} : {
  width: number,
  height: number,
  baseLayer: Layer,
  layers: Array<Layer>,
  repeat?: number,
  quality?: number,
  delay?: number,
  frameRate?: number,
  alphaColor?: number,
  alpha?: boolean,
  coalesce?: boolean,
  stretchLayers?: boolean,
  encoderOptions?: {
    highWaterMark?: number;
  },
  initCanvasContext?: (context?: CanvasRenderingContext2D) => void,
  encoderOnData?: (buffer?: Buffer) => void,
  encoderOnEnd?: () => void,
  encoderOnError?: (error?: any) => void,
  encoderOnReadable?: () => void,
  encoderOnWriteHeader?: () => void,
  encoderOnFrame?: () => void,
  encoderOnFinish?: () => void,
  beforeBaseLayerDraw?: DrawFunction,
  afterBaseLayerDraw?: DrawFunction,
  beforeLayerDraw?: PseudoDrawFunction,
  afterLayerDraw?: PseudoDrawFunction,
  outputDir?: string,
  frameExtension?: string,
  outputFilename?: number | string,
  // eslint-disable-next-line no-async-promise-executor
}): Promise<any> => new Promise(async (resolve, reject) => {
  if (frameRate && delay) {
    reject(
      new Error(
        'The "frameRate" option cannot be used with the "delay" option',
      ),
    );
  }

  const dir = `${outputDir}/${nanoid()}`;

  try {
    await extractFrames({
      input: baseLayer.data as Buffer,
      output: `${dir}/frame_%d.${frameExtension}` as string,
      coalesce: coalesce as boolean,
    });

    const backPath = `${dir}/`;
    const backFilePrefix = 'frame_';
    const backFileSuffix = `.${frameExtension}`;
    const frames: Array<any> = [];

    const currentFrames = Object.keys(memStore)
      .filter((key) => key.startsWith(dir))
      .reduce((obj: any, key) => {
        // eslint-disable-next-line no-param-reassign
        obj[key] = memStore[key];
        return obj;
      }, {});

    const frameCount = Object.keys(currentFrames).length as number;

    const canvas = document.createElement('canvas') as HTMLCanvasElement;

    canvas.width = width;
    canvas.height = height;

    const ctx: CanvasRenderingContext2D = canvas.getContext('2d');

    ctx.globalAlpha = alpha ? 0 : 1;

    initCanvasContext(ctx);

    // Initialize encoder
    const encoder = new GifEncoder(
      width,
      height,
      encoderOptions,
    );

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

    // eslint-disable-next-line prefer-spread
    const countArray = Array
      .apply(null, { length: frameCount })
      .map(Number.call, Number);

    // Prepare base layer
    if (frames.length === 0) {
      for (const chunk of countArray) {
        const frame = chunk.toString();
        const backgroundFile = `${backPath}${backFilePrefix}${frame}${backFileSuffix}`;
        // eslint-disable-next-line no-await-in-loop
        const image = await loadImage(
          memStore[backgroundFile],
        );
        frames.push(image);
      }
    }

    const dataArray: any = [];

    // Encoder events
    encoder.on('data', (buffer: Buffer) => {
      encoderOnData(buffer);
      dataArray.push(buffer);
    });

    encoder.on('end', () => {
      encoderOnEnd();
      resolve(
        Buffer.concat(dataArray),
      );
    });

    encoder.on('error', (error) => {
      encoderOnError(error);
      reject(error);
    });

    encoder.on('readable', encoderOnReadable);
    encoder.on('writeHeader#start', encoderOnWriteHeader);
    encoder.on('frame#start', encoderOnFrame);
    encoder.on('finish#start', encoderOnFinish);

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
      ) {
        const shouldSkip = baseLayer.skipFunction(
          i,
          countArray.length,
        );
        // eslint-disable-next-line no-continue
        if (shouldSkip) continue;
      } else if (
        baseLayer.drawFunction
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
          // eslint-disable-next-line no-await-in-loop
          const overlayResponse = await axios.get(
            layer.data,
            { responseType: 'arraybuffer' },
          );
          buffer = Buffer.from(overlayResponse.data, 'base64');
        }
        const layerImg = new Image();
        layerImg.src = buffer.toString();

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
        ) {
          const shouldSkip = layer.skipFunction(
            i,
            countArray.length,
          );
          // eslint-disable-next-line no-continue
          if (shouldSkip) continue;
        } else if (
          layer.drawFunction
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
    // Flushing frames stored in memory
    Object.keys(memStore).forEach((key) => {
      if (key.startsWith(dir)) {
        delete memStore[key];
      }
    });
  }
});

export default declus;
