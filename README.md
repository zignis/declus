# Declus - GIF manipulation

![npm](https://img.shields.io/npm/v/declus?style=for-the-badge)
![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/HexM7/declus?style=for-the-badge)
![GitHub](https://img.shields.io/github/license/HexM7/declus?style=for-the-badge)
![GitHub Repo stars](https://img.shields.io/github/stars/HexM7/declus?style=for-the-badge)
![GitHub forks](https://img.shields.io/github/forks/HexM7/declus?style=for-the-badge)
![GitHub Sponsors](https://img.shields.io/github/sponsors/HexM7?style=for-the-badge)

## Playing with GIF images made much easier!

### Installation

```
npm i declus
```

```js
const declus = require('declus');
```

### Overlaying an image on a GIF

Grabs images from absolute URLs and outputs Buffer data
```js
const fs = require('fs');
const declus = require('declus');

declus({
  imageData: 'https://github.com/HexM7/declus/blob/master/assets/transparentKitten.png',
  gifData: 'https://github.com/HexM7/declus/blob/master/assets/sample.gif',
  fillImage,
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
