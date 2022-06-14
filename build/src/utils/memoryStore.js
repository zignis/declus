import util from 'util';
import { Writable } from 'stream-browserify';
var memStore = {};
function MemoryStream(key, options) {
    if (!(this instanceof MemoryStream)) {
        return new MemoryStream(key, options);
    }
    Writable.call(this, options);
    this.key = key;
    memStore[key] = Buffer.from('');
}
util.inherits(MemoryStream, Writable);
// eslint-disable-next-line no-underscore-dangle
MemoryStream.prototype._write = function write(chunk, enc, cb) {
    var buffer = (Buffer.isBuffer(chunk))
        ? chunk
        : Buffer.from(chunk, enc);
    memStore[this.key] = Buffer.concat([memStore[this.key], buffer]);
    cb();
};
export { memStore, MemoryStream };
