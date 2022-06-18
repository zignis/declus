export type DrawFunction = (
  context: CanvasRenderingContext2D,
  layerImg: HTMLImageElement,
  index: number,
  totalFrames: number,
) => void;

export type SkipFunction = (
  index: number,
  totalFrames: number,
) => boolean;

export interface EncoderOptions = {
  highWaterMark?: number
};

export type BaseLayerDraw = (
  context: CanvasRenderingContext2D,
  layerImg: HTMLImageElement,
  index: number,
  totalFrames: number,
) => void

export type LayerDraw = (
  context: CanvasRenderingContext2D,
  layerImg: HTMLImageElement,
  index: number,
  totalFrames: number,
  layerIndex: number,
) => void

export interface BaseLayer {
  data: Buffer | string,
  marginLeft?: number,
  marginTop?: number,
  width?: number,
  height?: number,
  drawFunction?: DrawFunction,
  skipFunction?: SkipFunction,
  skipIndexes?: Array<number>,
}

export interface Layer {
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
