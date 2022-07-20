/// <reference types="node" />
import type { PathFn, FileSystem, PlatformPath } from './types.js';
export declare function genPathWithCache(lowpath: PlatformPath, fs: FileSystem): PathFn;
export declare function genPath(lowpath: PlatformPath, fs: FileSystem): PathFn;
