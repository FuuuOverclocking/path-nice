export function defineLazyOverride(obj, prop, lazyGetter, attributes) {
    Object.defineProperty(obj, prop, {
        configurable: true,
        enumerable: attributes.enumerable,
        get() {
            const value = lazyGetter();
            Object.defineProperty(obj, prop, {
                value,
                writable: false,
                configurable: attributes.configurable,
                enumerable: attributes.enumerable,
            });
            return value;
        },
    });
}
export function checkCompatibility(l, r) {
    if (l.lowpath !== r.lowpath || l.fs !== r.fs) {
        throw new Error('[path-nice]: The input PathNice uses an underlying path or fs ' +
            'implementation that is different from the one currently in use.');
    }
}
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
export function toJsonAndWriteOptions(data, options) {
    options = typeof options === 'string' ? { encoding: options } : options || {};
    const writeOptions = {};
    writeOptions.encoding = options.encoding || 'utf-8';
    writeOptions.mode = options.mode;
    writeOptions.flag = options.flag;
    let json = JSON.stringify(data, options.replacer, options.spaces || 4);
    if (options.EOL && options.EOL !== '\n') {
        json = json.replace(/\n/g, options.EOL);
    }
    return { json, writeOptions };
}
//# sourceMappingURL=util.js.map