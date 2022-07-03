import * as nodepath from 'path';
import * as nodefs from 'fs';
import type { FileSystem } from '../common/types.js';
import type { Join } from './type-gymnastics.js';

const lowpath = nodepath.posix;

export class PathNicePosix<P extends string> {
    /** Raw path string. */
    public readonly raw: P;

    private readonly fs: FileSystem;

    constructor(path: P, fs?: FileSystem) {
        this.raw = path;
        this.fs = fs || nodefs;
    }

    private _new<P extends string>(str: P): PathNicePosix<P> {
        return new PathNicePosix<P>(str, this.fs);
    }

    public join<Paths extends Array<string | PathNicePosix<string>>>(
        ...paths: Paths
    ): PathNicePosix<Join<[P, ...Paths]>> {
        const _paths = paths.map((p) => (typeof p === 'string' ? p : p.raw));
        return this._new(lowpath.join(this.raw, ..._paths)) as any;
    }
}
