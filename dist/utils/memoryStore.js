"use strict";
/* eslint-disable global-require */
/* eslint-disable no-underscore-dangle */
/* eslint-disable func-names */
Object.defineProperty(exports, "__esModule", { value: true });
const stream = require('stream');
const util = require('util');
const { Writable } = stream || require('readable-stream');
const memStore = {};
function MemoryStream(key, options) {
    if (!(this instanceof MemoryStream)) {
        return new MemoryStream(key, options);
    }
    Writable.call(this, options);
    this.key = key;
    memStore[key] = Buffer.from('');
}
util.inherits(MemoryStream, Writable);
MemoryStream.prototype._write = function (chunk, enc, cb) {
    const buffer = (Buffer.isBuffer(chunk))
        ? chunk
        : Buffer.from(chunk, enc);
    memStore[this.key] = Buffer.concat([memStore[this.key], buffer]);
    cb();
};
module.exports = { memStore, MemoryStream };
//# sourceMappingURL=memoryStore.js.map