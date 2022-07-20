/// <reference types="node" />
import type { FileSystem, PlatformPath } from '../types.js';
export declare type EnsureDirOptions = {
    mode?: number | string | undefined;
};
export declare type EnsureFileOptions = {
    fileMode?: number | string | undefined;
    dirMode?: number | string | undefined;
};
export declare function ensureDir(fs: FileSystem, target: string, options?: EnsureDirOptions): Promise<void>;
export declare function ensureDirSync(fs: FileSystem, target: string, options?: EnsureDirOptions): void;
export declare function ensureFile(path: PlatformPath, fs: FileSystem, target: string, options?: EnsureFileOptions): Promise<void>;
export declare function ensureFileSync(path: PlatformPath, fs: FileSystem, target: string, options?: EnsureFileOptions): void;
