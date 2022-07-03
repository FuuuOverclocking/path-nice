import type { FileSystem, PlatformPath } from './types.js';
export declare function emptyDir(path: PlatformPath, fs: FileSystem, target: string): Promise<void>;
