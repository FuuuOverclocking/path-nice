import type { FileSystem } from '../common/types.js';
import type { Join } from './type-gymnastics.js';
export declare class PathNicePosix<P extends string> {
    /** Raw path string. */
    readonly raw: P;
    private readonly fs;
    constructor(path: P, fs?: FileSystem);
    private _new;
    join<Paths extends Array<string | PathNicePosix<string>>>(...paths: Paths): PathNicePosix<Join<[P, ...Paths]>>;
}
