import { path } from './core/types.js';
import type {
    PathNice,
    PathNiceArr,
    ParsedPathNice,
    FileSystem,
    ParsedPath,
    FormatInputPathObject,
    PlatformPath,
} from './core/types.js';

export default path;

export type {
    ParsedPathNice,
    FileSystem,
    ParsedPath,
    FormatInputPathObject,
    PlatformPath,
};

export declare const bindFS: typeof path.bindFS;
export declare const posix: typeof path.posix;
export declare const win32: typeof path.win32;
declare const PathNice: typeof path.PathNice;
declare const PathNiceArr: typeof path.PathNiceArr;
export declare const delimiter: typeof path.delimiter;
export declare const sep: typeof path.sep;
export declare const basename: typeof path.basename;
export declare const dirname: typeof path.dirname;
export declare const extname: typeof path.extname;
export declare const format: typeof path.format;
export declare const isAbsolute: typeof path.isAbsolute;
export declare const join: typeof path.join;
export declare const normalize: typeof path.normalize;
export declare const parse: typeof path.parse;
export declare const relative: typeof path.relative;
export declare const resolve: typeof path.resolve;
export declare const toNamespacedPath: typeof path.toNamespacedPath;

export { PathNice, PathNiceArr };
