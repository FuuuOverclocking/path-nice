import type { FileSystem, PlatformPath } from './types.js';

export function defineLazyOverride(
    obj: any,
    prop: string,
    lazyGetter: () => any,
    attributes: {
        configurable: boolean;
        enumerable: boolean;
    },
): void {
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

export function checkCompatibility(
    l: {
        lowpath: PlatformPath;
        fs: FileSystem;
    },
    r: {
        lowpath: PlatformPath;
        fs: FileSystem;
    },
): void {
    if (l.lowpath !== r.lowpath || l.fs !== r.fs) {
        throw new Error(
            '[path-nice]: The input PathNice uses an underlying path or fs ' +
                'implementation that is different from the one currently in use.',
        );
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
] as const;

export function isValidBufferEncoding(encoding: string): encoding is BufferEncoding {
    return bufferEncodingList.indexOf(encoding as any) !== -1;
}

export function toJsonAndWriteOptions(
    data: any,
    options?: any,
): {
    json: string;
    writeOptions: any;
} {
    options = typeof options === 'string' ? { encoding: options } : options || {};

    const writeOptions = {} as any;
    writeOptions.encoding = options.encoding || 'utf-8';
    writeOptions.mode = options.mode;
    writeOptions.flag = options.flag;

    let json = JSON.stringify(data, options.replacer as any, options.spaces || 4);
    if (options.EOL && options.EOL !== '\n') {
        json = json.replace(/\n/g, options.EOL);
    }

    return { json, writeOptions };
}
