# Declus - GIF manipulation

![npm](https://img.shields.io/npm/v/declus?style=for-the-badge)
![npm](https://img.shields.io/npm/dw/declus?style=for-the-badge)
![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/HexM7/declus?style=for-the-badge)
![GitHub](https://img.shields.io/github/license/HexM7/declus?style=for-the-badge)
![GitHub Repo stars](https://img.shields.io/github/stars/HexM7/declus?style=for-the-badge)
![GitHub forks](https://img.shields.io/github/forks/HexM7/declus?style=for-the-badge)
![GitHub Sponsors](https://img.shields.io/github/sponsors/HexM7?style=for-the-badge)

## Playing with GIF images made much easier

### Installation & Usage

```console
npm i declus
```

```js
const declus = require('declus');

// Using callback
declus(options)
  .then((buffer) => {
    ...
  })
  .catch(console.error);

// Inside an async function, using await
const buffer = await declus(options);
```

| :warning: Requires access to write extracted frames to a directory. If file-system is restricted, use the `inMemory` option to store extracted frames in memory |
| --- |

### Getting started

Basic example

```js
const fs = require('fs');
const declus = require('declus');

declus({
  height: 360,
  width: 640,
  baseLayer: {
    data: 'https://raw.githubusercontent.com/HexM7/declus/master/assets/sample.gif',
  },
  layers: [
    {
      data: 'https://raw.githubusercontent.com/HexM7/declus/master/assets/transparentKitten.png',
    }
  ],
  stretchLayers: true,
}).then((buffer) => {
  fs.createWriteStream('./myImage.gif')
    .write(buffer);
});
```

Accepts Buffer, absolute URLs and paths to images

```js
data: myBuffer,
data: './sampleImage.gif',
```

### Layer options

```js
layer: {
  data: Buffer | URL | Path, // Required
  marginLeft: Number,
  marginTop: Number,
  width: Number,
  height: Number,
  drawFunction: function(context, layerImg, index, totalFrames),
  skipFunction: function(index, totalFrames),
  skipIndexes: Array,
}
```

- `data` - Layer data, can be an image buffer, URL or path.
- `marginLeft` - Left layer margin relative to the base width.
- `marginTop` - Top layer margin relative to the base height.
- `width` - Layer width.
- `height` - Layer height.
- `drawFunction` - A custom function to draw the layer onto the base layer.

```js
{
  drawFunction: function(context, layerImg, index, totalFrames) {
    const drawProgress = (index / totalFrames).toFixed(1);

    context.drawImage(
      layerImg,
      width * drawProgress,
      height * drawProgress,
      64,
      64,
    );
  },
}
```

- `skipFunction` - Function to decide wether or not to skip the current frame. Return `true` to skip and `false` to render the frame.

```js
{
  skipFunction: function(index, totalFrames) {
    // Skip all frames with even index
    if (index % 2 === 0) return true;
    return false;
  },
}
```

- `skipIndexes` - Frames indexes to skip layers.

```js
{
  skipIndexes: [5, 15, 25, 50],
}
```

### Options

#### *`width`  number

Width of the output image.

#### *`height` number

Height of the output image.

#### *`baseLayer` object

An object with data to build the base layer.

Check [baseLayer options](#layer-options).

#### `layers` array

An array of layer objects. The stacking order is defined by the position of the layer in the array.

Check [layer options](#layer-options).

#### [`repeat`](https://github.com/twolfson/gif-encoder#setrepeatn) number

Amount of times to repeat the output GIF.

- `-1`: play once
- `0`: default, loop indefinitely
- `Positive number`: loop specific times

#### [`quality`](https://github.com/twolfson/gif-encoder#setqualityquality) number

The quality of output GIF (computational/performance trade-off).

- `1`: best colors, worst performance
- `20`: suggested maximum but there is no limit
- `10`: default, provided an even trade-off

#### [`delay`](https://github.com/twolfson/gif-encoder#gifsetdelayms) number, ms

Amount of milliseconds to delay between frames.

#### [`frameRate`](https://github.com/twolfson/gif-encoder#setframerateframespersecond) number

Frames per second.

| :warning: `delay` and `frameRate` cannot be used together |
| --- |

#### `alpha` boolean

Wether or not to have a transparent background.

#### [`alphaColor`](https://github.com/twolfson/gif-encoder#settransparentcolor) number, hexadecimal

Defines the color which represents transparency in the output GIF.

#### [`coalesce`](https://github.com/transitive-bullshit/gif-extract-frames#optscoalesce) boolean

Whether or not to perform inter-frame coalescing, defaults to `true`.

#### `stretchLayers` boolean

Whether or not to stretch the layers to their maximum, defaults to `false`.

#### [`encoderOptions`](https://github.com/twolfson/gif-encoder#documentation) object

Options passed to [gif-encoder](https://github.com/twolfson/gif-encoder).

- `highWaterMark`: Number, in bytes, to store in internal buffer. Defaults to `64kB`. Increase if you face `GIF memory limit exceeded` error.

#### `outputDir` string

Directory to store temporary frames extracted from the GIF, defaults to `.` (root). A new folder is created and automatically gets removed after the encoding has been finished.

#### `inMemory` boolean

Whether or not to extract frames to memory store instead of writing them to a directory. If `true`, the GIF image will render faster as the frames will be written and read from the memory instead of a directory at cost of increasing memory usage such as when dealing with large images. Useful when you do not have access to write to the file system. Defaults to `false`.

#### `frameExtension` string

Extension of the extracted frames from the GIF, defaults to `png`.

Allowed formats:

- `png`
- `jpg`
- `gif`(static)

#### `outputFilename` string

Filename for the output GIF image. Defaults to a unique ID generated through `nanoid`.

### Events

#### `initCanvasContext` function(context)

A function called during the initialization of the Canvas context.

#### `beforeBaseLayerDraw` function(context, layerImg, index, totalFrames)

A function called each time before a frame of the base layer is drawn.

#### `afterBaseLayerDraw` function(context, layerImg, index, totalFrames)

A function called each time after a frame of the base layer is drawn.

#### `beforeLayerDraw` function(context, layerImg, index, totalFrames, layerIndex)

A function called each time before a frame of a layer is drawn.

#### `afterLayerDraw` function(context, layerImg, index, totalFrames, layerIndex)

A function called each time after a frame of a layer is drawn.

#### [`encoderOnData`](https://github.com/twolfson/gif-encoder#event-data) function(buffer)

Emits a Buffer containing either header bytes, frame bytes, or footer bytes.

#### [`encoderOnEnd`](https://github.com/twolfson/gif-encoder#event-end) function

Signifies end of the encoding has been reached.

#### [`encoderOnError`](https://github.com/twolfson/gif-encoder#event-error) function(error)

Emits an Error when internal buffer is exceeded.

#### [`encoderOnReadable`](https://github.com/twolfson/gif-encoder#event-readable) function

Emits when the stream is ready to be `.read()` from.

#### [`encoderOnWriteHeader`](https://github.com/twolfson/gif-encoder#event-writeheaderstartstop) function

Emits when at the start and end of `.writeHeader()`.

#### [`encoderOnFrame`](https://github.com/twolfson/gif-encoder#event-framestartstop) function

Emits when a new frame is being rendered.

#### [`encoderOnFinish`](https://github.com/twolfson/gif-encoder#event-finishstartstop) function

Emits when encoding has been finished.

### Credits

- [@transitive-bullshit](https://github.com/transitive-bullshit) for [gif-extract-frames](https://github.com/transitive-bullshit/gif-extract-frames)
