import type { FileSystem, PlatformPath } from './types.js';
declare type MoveOptions = {
    overwrite?: boolean | null | undefined;
};
export declare function move(path: PlatformPath, fs: FileSystem, src: string, dest: string, options?: MoveOptions | null): Promise<void>;
export {};
