# Declus - GIF manipulation

![npm](https://img.shields.io/npm/v/declus?style=for-the-badge)
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

### Overlaying an image on a GIF

Grab images from absolute URLs and output Buffer data

```js
const fs = require('fs');
const declus = require('declus');

declus({
  imageData: 'https://raw.githubusercontent.com/HexM7/declus/master/assets/transparentKitten.png',
  gifData: 'https://raw.githubusercontent.com/HexM7/declus/master/assets/sample.gif',
  fillImage: true,
}).then((buffer) => {
  fs.createWriteStream('./myImage.gif')
    .write(buffer);
});
```

Accepts Buffer, absolute URLs and paths to images

```js
imageData: myBuffer,
gifData: './sampleImage.gif',
```

Decide the coordinates

```js
imageCoordinates: {
  marginLeft: 100,
  marginTop: 120,
  width: 64,
  height: 64,
}
```

```js
gifCoordinates: {
  marginLeft: 0,
  marginTop: 0,
  width: 640,
  height: 360,
}
```

### Options

#### `width` (number)

Width of the output image. Defaults to `640` pixels.

#### `height` (number)

Height of the output image. Defaults to `320` pixels.

#### [`repeat`](https://github.com/twolfson/gif-encoder#setrepeatn) (number)

Amount of times to repeat the output GIF.

- `-1`: play once
- `0`: default, loop indefinitely
- `Positive number`: loop specific times

#### [`quality`](https://github.com/twolfson/gif-encoder#setqualityquality) (number)

The quality of output GIF (computational/performance trade-off).

- `1`: best colors, worst performance
- `20`: suggested maximum but there is no limit
- `10`: default, provided an even trade-off

#### [`delay`](https://github.com/twolfson/gif-encoder#gifsetdelayms) (number, ms)

Amount of milliseconds to delay between frames.

#### [`frameRate`](https://github.com/twolfson/gif-encoder#setframerateframespersecond) (number)

Frames per second.

| :warning: `delay` and `frameRate` cannot be used together |
| --- |

#### [`alphaColor`](https://github.com/twolfson/gif-encoder#settransparentcolor) (hexadecimal number)

Defines the color which represents transparency in the output GIF.

#### [`coalesce`](https://github.com/transitive-bullshit/gif-extract-frames#optscoalesce) (boolean)

Whether or not to perform inter-frame coalescing, defaults to `true`.

#### `fillImage` (boolean)

Whether or not to stretch the overlay image to the dimensions of the canvas, defaults to `false`.

#### [`encoderOptions`](https://github.com/twolfson/gif-encoder#documentation) (object)

Options passed to [gif-encoder](https://github.com/twolfson/gif-encoder).

- `highWaterMark`: Number, in bytes, to store in internal buffer. Defaults to `64kB`. Increase if you face `GIF memory limit exceeded` error.

#### `outputDir` (string)

Directory to store temporary frames extracted from the GIF, defaults to `.` (root). A new folder is created and automatically gets removed after the encoding has been finished.

#### `frameExtension` (string)

Extension of the extracted frames from the GIF, defaults to `png`.

Allowed formats:

- `png`
- `jpg`
- `gif`(static)

#### `gifData` (buffer / URL / path)

A buffer resolvable, absolute URL or path to the source GIF image.

#### `imageData` (buffer / URL / path)

A buffer resolvable, absolute URL or path to the source overlay image.

#### `outputFilename` (string)

Filename for the output GIF image. Defaults to a unique ID generated through `nanoid`.

#### `gifCoordinates` (object)

An object specifying the position of source GIF image.

- `marginLeft`: number
- `marginTop`: number
- `width`: number
- `height`: number

#### `imageCoordinates` (object)

An object specifying the position of source overlay image.

- `marginLeft`: number
- `marginTop`: number
- `width`: number
- `height`: number

### Events

#### [`encoderOnData`](https://github.com/twolfson/gif-encoder#event-data) (function(buffer))

Emits a Buffer containing either header bytes, frame bytes, or footer bytes.

#### [`encoderOnEnd`](https://github.com/twolfson/gif-encoder#event-end) (function())

Signifies end of the encoding has been reached.

#### [`encoderOnError`](https://github.com/twolfson/gif-encoder#event-error) (function(error))

Emits an Error when internal buffer is exceeded.

#### [`encoderOnReadable`](https://github.com/twolfson/gif-encoder#event-readable) (function())

Emits when the stream is ready to be `.read()` from.

#### [`encoderOnWriteHeader`](https://github.com/twolfson/gif-encoder#event-writeheaderstartstop) (function())

Emits when at the start and end of `.writeHeader()`.

#### [`encoderOnFrame`](https://github.com/twolfson/gif-encoder#event-framestartstop) (function())

Emits when a new frame is being rendered.

#### [`encoderOnFinish`](https://github.com/twolfson/gif-encoder#event-finishstartstop) (function())

Emits when encoding has been finished.

### Credits

- [@transitive-bullshit](https://github.com/transitive-bullshit) for [gif-extract-frames](https://github.com/transitive-bullshit/gif-extract-frames)
