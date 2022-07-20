/// <reference types="node" />
import type { FileSystem, PlatformPath } from '../types.js';
export declare function emptyDir(lowpath: PlatformPath, fs: FileSystem, target: string): Promise<void>;
export declare function emptyDirSync(lowpath: PlatformPath, fs: FileSystem, target: string): void;
