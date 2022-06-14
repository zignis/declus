import util from 'util';
import { Writable } from 'stream-browserify';

const memStore: any = {};

function MemoryStream(key: any, options: any) {
  if (!(this instanceof MemoryStream)) {
    return new (MemoryStream as any)(key, options);
  }

  Writable.call(this, options);
  this.key = key;
  memStore[key] = Buffer.from('');
}

util.inherits(MemoryStream, Writable);

// eslint-disable-next-line no-underscore-dangle
MemoryStream.prototype._write = function write(
  chunk: any,
  enc: any,
  cb: () => void,
) {
  const buffer = (Buffer.isBuffer(chunk))
    ? chunk
    : Buffer.from(chunk, enc);

  memStore[this.key] = Buffer.concat([memStore[this.key], buffer]);
  cb();
};

export { memStore, MemoryStream };
