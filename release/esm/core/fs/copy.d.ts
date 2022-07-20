/// <reference types="node" />
import type { FileSystem, PlatformPath } from '../types.js';
export declare type CopyOptions = {
    force?: boolean | null | undefined;
    dereference?: boolean | null | undefined;
    errorOnExist?: boolean | null | undefined;
    filter?: ((src: string, dest: string) => boolean | Promise<boolean>) | null | undefined;
    preserveTimestamps?: boolean | null | undefined;
    recursive?: boolean | null | undefined;
    verbatimSymlinks?: boolean | null | undefined;
};
export declare type CopySyncOptions = {
    force?: boolean | null | undefined;
    dereference?: boolean | null | undefined;
    errorOnExist?: boolean | null | undefined;
    filter?: ((src: string, dest: string) => boolean) | null | undefined;
    preserveTimestamps?: boolean | null | undefined;
    recursive?: boolean | null | undefined;
    verbatimSymlinks?: boolean | null | undefined;
};
export declare function copy(path: PlatformPath, fs: FileSystem, src: string, dest: string, options?: CopyOptions | null): Promise<void>;
export declare function copySync(path: PlatformPath, fs: FileSystem, src: string, dest: string, options?: CopySyncOptions | null): void;
