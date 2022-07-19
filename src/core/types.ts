import type nodefs from 'fs';

import type { PlatformPath, ParsedPath, FormatInputPathObject } from 'path';
export { PlatformPath, ParsedPath, FormatInputPathObject };

import type { PathNice, PathNiceArr, ParsedPathNice } from './path-nice.js';
export type { PathNice, PathNiceArr, ParsedPathNice };

export type FileSystem = typeof nodefs;
export type PathFn = typeof path;

/**
 * Emmmm
 */
export declare function path<T extends string>(path: T): PathNice<T>;
export declare function path<T extends string>(path: PathNice<T>): PathNice<T>;
export declare function path(
    path_0: string | PathNice,
    path_1: string | PathNice,
    ...paths_rest: (string | PathNice)[]
): PathNiceArr;
export declare function path(paths: Array<string | PathNice> | PathNiceArr): PathNiceArr;

export declare namespace path {
    /**
     * Generate a new path object, which uses the given `fs` to perform filesystem
     * operations.
     *
     * ⚠️ Warning:
     *
     * - Some third-party `fs` do not fully implement all the features of `node:fs`. When
     *   using the corresponding API, you should check the documentation of the `fs` you
     *   gave.
     * - Third-party fs will most likely only support POSIX-style paths, so don't forget
     *   to switch to a specific platform before calling `bindFS`.
     *
     * @example
     * ```ts
     * import { fs } from 'memfs';
     *
     * const mpath = path.posix.bindFS(fs);
     * mpath('/hello.txt').writeFileSync('World!');
     * ```
     */
    const bindFS: (fs: FileSystem) => PathFn;

    /**
     * Posix specific pathing.
     */
    const posix: PathFn;

    /**
     * Windows specific pathing.
     */
    const win32: PathFn;

    /**
     * PathNice class.
     *
     * @example
     * ```ts
     * $ path('./foo.txt') instanceof path.PathNice
     * true
     * ```
     */
    const PathNice: any;

    /**
     * PathNiceArr class.
     *
     * @example
     * ```ts
     * $ path('./foo.txt', './bar.md') instanceof path.PathNiceArr
     * true
     * ```
     */
    const PathNiceArr: any;

    /**
     * Normalize a string path, reducing '..' and '.' parts.
     * When multiple slashes are found, they're replaced by a single one; when the path contains a trailing slash, it is preserved. On Windows backslashes are used.
     *
     * @param p string path to normalize.
     */
    const normalize: (p: string) => string;
    /**
     * Join all arguments together and normalize the resulting path.
     * Arguments must be strings. In v0.8, non-string arguments were silently ignored. In v0.10 and up, an exception is thrown.
     *
     * @param paths paths to join.
     */
    const join: (...paths: string[]) => string;
    /**
     * The right-most parameter is considered {to}.  Other parameters are considered an array of {from}.
     *
     * Starting from leftmost {from} parameter, resolves {to} to an absolute path.
     *
     * If {to} isn't already absolute, {from} arguments are prepended in right to left order,
     * until an absolute path is found. If after using all {from} paths still no absolute path is found,
     * the current working directory is used as well. The resulting path is normalized,
     * and trailing slashes are removed unless the path gets resolved to the root directory.
     *
     * @param pathSegments string paths to join.  Non-string arguments are ignored.
     */
    const resolve: (...pathSegments: string[]) => string;
    /**
     * Determines whether {path} is an absolute path. An absolute path will always resolve to the same location, regardless of the working directory.
     *
     * @param p path to test.
     */
    const isAbsolute: (p: string) => boolean;
    /**
     * Solve the relative path from {from} to {to}.
     * At times we have two absolute paths, and we need to derive the relative path from one to the other. This is actually the reverse transform of path.resolve.
     */
    const relative: (from: string, to: string) => string;
    /**
     * Return the directory name of a path. Similar to the Unix dirname command.
     *
     * @param p the path to evaluate.
     */
    const dirname: (p: string) => string;
    /**
     * Return the last portion of a path. Similar to the Unix basename command.
     * Often used to extract the file name from a fully qualified path.
     *
     * @param p the path to evaluate.
     * @param ext optionally, an extension to remove from the result.
     */
    const basename: (p: string, ext?: string) => string;
    /**
     * Return the extension of the path, from the last '.' to end of string in the last portion of the path.
     * If there is no '.' in the last portion of the path or the first character of it is '.', then it returns an empty string
     *
     * @param p the path to evaluate.
     */
    const extname: (p: string) => string;
    /**
     * The platform-specific file separator. '\\' or '/'.
     */
    const sep: '\\' | '/';
    /**
     * The platform-specific file delimiter. ';' or ':'.
     */
    const delimiter: ';' | ':';
    /**
     * Returns an object from a path string - the opposite of format().
     *
     * @param pathString path to evaluate.
     */
    const parse: (pathString: string) => ParsedPath;
    /**
     * Returns a path string from an object - the opposite of parse().
     *
     * @param pathString path to evaluate.
     */
    const format: (pathString: FormatInputPathObject) => string;
    /**
     * On Windows systems only, returns an equivalent namespace-prefixed path for the given path.
     * If path is not a string, path will be returned without modifications.
     * This method is meaningful only on Windows system.
     * On POSIX systems, the method is non-operational and always returns path without modifications.
     */
    const toNamespacedPath: (path: string) => string;
}