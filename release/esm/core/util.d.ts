/// <reference types="node" />
/// <reference types="node" />
import type { FileSystem, PlatformPath } from './types.js';
export declare function defineLazyOverride(obj: any, prop: string, lazyGetter: () => any, attributes: {
    configurable: boolean;
    enumerable: boolean;
}): void;
export declare function checkCompatibility(l: {
    lowpath: PlatformPath;
    fs: FileSystem;
}, r: {
    lowpath: PlatformPath;
    fs: FileSystem;
}): void;
export declare function isValidBufferEncoding(encoding: string): encoding is BufferEncoding;
export declare function toJsonAndWriteOptions(data: any, options?: any): {
    json: string;
    writeOptions: any;
};
