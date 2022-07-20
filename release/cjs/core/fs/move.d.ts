/// <reference types="node" />
import type { FileSystem, PlatformPath } from '../types.js';
export declare type MoveOptions = {
    overwrite?: boolean | null | undefined;
};
export declare function move(path: PlatformPath, fs: FileSystem, src: string, dest: string, options?: MoveOptions | null): Promise<void>;
export declare function moveSync(path: PlatformPath, fs: FileSystem, src: string, dest: string, options?: MoveOptions | null): void;
