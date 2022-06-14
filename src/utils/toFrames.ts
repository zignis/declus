import path from 'path-browserify';
import pify from 'pify';
import pump from 'pump-promise';
import savePixels from 'save-pixels';
import getPixels from 'get-pixels';
import { MemoryStream } from './memoryStore';

const getPixelsPromise = pify(getPixels);

// Supported frame formats
const supportedFormats: Set<string> = new Set([
  'jpg',
  'png',
  'gif',
]);

function saveFrameToMemory(data: any, format: any, filename: string): any {
  const stream = savePixels(data, format);
  const memStream = new (MemoryStream as any)(filename);
  return pump(stream, memStream);
}

const toFrames = async ({
  input,
  output,
  coalesce = true,
} : {
  input: Buffer,
  output: string,
  coalesce?: boolean,
}) => {
  const format = output
    ? path.extname(output).substring(1)
    : undefined;

  if (format && !supportedFormats.has(format)) {
    throw new Error(`Invalid output format "${format}"`);
  }

  const results = await getPixelsPromise(input);
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
        // eslint-disable-next-line no-await-in-loop
        await saveFrameToMemory(
          results.pick(i),
          format,
          output.replace('%d', String(i)),
        );
      }
    }
  } else if (output) {
    await saveFrameToMemory(
      results,
      format,
      output.replace('%d', '0'),
    );
  }

  return results;
};

export default toFrames;
