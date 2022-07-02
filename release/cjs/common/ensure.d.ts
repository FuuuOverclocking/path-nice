import type { FileSystem, PlatformPath } from './types.js';
export declare function ensureDir(fs: FileSystem, target: string, options?: {
    mode?: number | string | undefined;
}): Promise<void>;
export declare function ensureFile(path: PlatformPath, fs: FileSystem, target: string): Promise<void>;
