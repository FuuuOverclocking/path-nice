import * as nodepath from 'path';
import * as nodefs from 'fs';
import type { FileSystem } from '../common/types.js';
import { Join } from './type-gymnastics.js';

const lowpath = nodepath.posix;

export class PathNicePosix<P extends string> {
    /** Raw path string. */
    public readonly str: P;

    private readonly fs: FileSystem;

    constructor(str: P, fs?: FileSystem) {
        this.str = str;
        this.fs = fs || nodefs;
    }

    private _new<P extends string>(str: P): PathNicePosix<P> {
        return new PathNicePosix<P>(str, this.fs);
    }

    public join<Paths extends string[]>(
        ...paths: Paths
    ): PathNicePosix<Join<[P, ...Paths]>> {
        return this._new(lowpath.join(this.str, ...paths)) as any;
    }
}
