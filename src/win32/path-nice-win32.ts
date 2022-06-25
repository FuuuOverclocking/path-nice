import * as nodepath from 'path';
import * as nodefs from 'fs';
import type { FileSystem } from '../common/types.js';

const lowpath = nodepath.win32;

export class PathNiceWin32<P extends string> {
    /** Raw path string. */
    public readonly str: P;

    private readonly fs: FileSystem;

    constructor(str: P, fs?: FileSystem) {
        this.str = str;
        this.fs = fs || nodefs;
    }
}
