"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidBufferEncoding = void 0;
const bufferEncodingList = [
    'ascii',
    'utf8',
    'utf-8',
    'utf16le',
    'ucs2',
    'ucs-2',
    'base64',
    'latin1',
    'binary',
    'hex',
];
function isValidBufferEncoding(encoding) {
    return bufferEncodingList.indexOf(encoding) !== -1;
}
exports.isValidBufferEncoding = isValidBufferEncoding;
//# sourceMappingURL=is-valid-buffer-encoding.js.map