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
export function isValidBufferEncoding(encoding) {
    return bufferEncodingList.indexOf(encoding) !== -1;
}
//# sourceMappingURL=is-valid-buffer-encoding.js.map