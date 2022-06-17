/* eslint-disable global-require */
/* eslint-disable no-underscore-dangle */
/* eslint-disable func-names */

export {};

const stream = require('stream');
const util = require('util');
const { Writable } = stream || require('readable-stream');

const memStore: any = {};

function MemoryStream(this: any, key: any, options: any): any {
  if (!(this as any instanceof MemoryStream)) {
    return new (MemoryStream as any)(key, options);
  }

  Writable.call(this, options);
  this.key = key;
  memStore[key] = Buffer.from('');
}

util.inherits(MemoryStream, Writable);

MemoryStream.prototype._write = function (chunk: any, enc: any, cb: any) {
  const buffer = (Buffer.isBuffer(chunk))
    ? chunk
    : Buffer.from(chunk, enc);

  memStore[this.key] = Buffer.concat([memStore[this.key], buffer]);
  cb();
};

module.exports = { memStore, MemoryStream };
