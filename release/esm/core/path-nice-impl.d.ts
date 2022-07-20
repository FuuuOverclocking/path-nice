/// <reference types="node" />
import type { FileSystem, PlatformPath } from './types.js';
export declare function genPathNice(lowpath: PlatformPath, fs: FileSystem): {
    PathNice: any;
    PathNiceArr: any;
};
