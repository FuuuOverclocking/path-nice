import type { FileSystem } from '../common/types.js';
import { Join } from './type-gymnastics.js';
export declare class PathNicePosix<P extends string> {
    /** Raw path string. */
    readonly raw: P;
    private readonly fs;
    constructor(str: P, fs?: FileSystem);
    private _new;
    join<Paths extends string[]>(...paths: Paths): PathNicePosix<Join<[P, ...Paths]>>;
}
