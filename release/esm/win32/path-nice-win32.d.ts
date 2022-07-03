import type { FileSystem } from '../common/types.js';
export declare class PathNiceWin32<P extends string> {
    /** Raw path string. */
    readonly str: P;
    private readonly fs;
    constructor(str: P, fs?: FileSystem);
}
