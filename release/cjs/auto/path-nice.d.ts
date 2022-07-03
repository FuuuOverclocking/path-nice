/// <reference types="node" />
/// <reference types="node" />
import * as nodefs from 'fs';
import type { ParsedPath } from '../common/types.js';
/**
 * A PathNice instance is a wrapper of the raw path string, so that the path
 * can be easily used to generate additional paths or manipulate files.
 */
export declare class PathNice {
    /** Raw path string. */
    readonly raw: string;
    constructor(path: string);
    private _new;
    private static _from;
    valueOf(): string;
    /**
     * Get (when 0 args) or set (when 1 arg) the path segment separator.
     *
     * When get, return 'none' if there is no separator in the path,
     * or 'hybrid' if there are both '/' and '\\' separators.
     *
     * @example
     * ```ts
     * $ path('/home/fuu/data.json').separator()
     * '/'
     *
     * $ path('C:\\Windows\\System32').separator()
     * '\\'
     *
     * $ path('index.js').separator()
     * 'none'
     *
     * $ path('C:\\Windows/System32').separator()
     * 'hybrid'
     *
     * $ path('/home/fuu/data.json').separator('\\').raw
     * '\\home\\fuu\\data.json'
     *
     * $ path('C:\\Windows\\System32').separator('/').raw
     * 'C:/Windows/System32'
     * ```
     */
    separator(): '/' | '\\' | 'none' | 'hybrid';
    separator(forceSep: '/' | '\\'): PathNice;
    /**
     * Join all arguments together and normalize the resulting path.
     *
     * @example
     * ```ts
     * $ path('../data').join('settings.json').raw
     * '../data/settings.json'      // on POSIX
     * '..\\data\\settings.json'    // on Windows
     *
     * $ path('/home').join('fuu', 'data.json').raw
     * '/home/fuu/data.json'        // on POSIX
     *
     * $ path('C:\\Users').join('fuu', 'data.json').raw
     * 'C:\\Users\\fuu\\data.json'  // on Windows
     * ```
     */
    join(...paths: Array<string | PathNice>): PathNice;
    /**
     * Get (when 0 args) or set (when 1 arg) the directory name of a path.
     *
     * @example
     * ```ts
     * $ path('/usr/local/bin').dirname().raw
     * '/usr/local'         // on POSIX
     *
     * $ path('C:\\Users\\fuu').dirname().raw
     * 'C:\\Users'          // on Windows
     *
     * $ path('./src/index.ts').dirname('./dist').raw
     * './dist/index.ts'    // on POSIX
     * '.\\dist\\index.ts'  // on Windows
     * ```
     */
    dirname(newDirname?: string | PathNice): PathNice;
    /**
     * Alias for `.dirname()` .
     *
     * Return the path to the parent directory.
     *
     * @example
     * ```ts
     * $ path('/usr/local/bin').parent.raw
     * '/usr/local'         // on POSIX
     *
     * $ path('C:\\Users\\fuu').parent.raw
     * 'C:\\Users'          // on Windows
     * ```
     */
    get parent(): PathNice;
    /**
     * Get (when 0 args) or set (when 1 arg) the filename of the path.
     *
     * Exactly speaking, it first converts the path to an absolute path, and then returns
     * its last portion. If the path is root directory, returns ''.
     *
     * @example
     * ```ts
     * $ path('./src/index.js').filename().raw
     * 'index.js'
     *
     * $ path('/home/fuu///').filename().raw
     * 'fuu'                    // on POSIX
     *
     * $ path('/home/fuu/bar.txt').filename('foo.md').raw
     * '/home/fuu/foo.md'       // on POSIX
     *
     * $ path('C:\\Users\\fuu\\\\\\').filename().raw
     * 'fuu'                    // on Windows
     *
     * $ path('C:\\Users\\fuu\\bar.txt').filename('foo.md').raw
     * 'C:\\Users\\fuu\\foo.md' // on Windows
     * ```
     */
    filename(): string;
    filename(newFilename: string | PathNice): PathNice;
    /**
     * Get (when 0 args), set (when 1 arg of type string) or remove (when 1 arg is null)
     * the extension of the path, from the last '.' to end of string in the last portion
     * of the path.
     *
     * If there is no '.' in the last portion of the path or the first character of it
     * is '.', then it returns an empty string.
     *
     * @example
     * ```ts
     * $ path('./src/index.js').ext()
     * '.js'
     *
     * $ path('./LICENSE').ext()
     * ''
     *
     * $ path('/home/fuu/.bashrc').ext()
     * ''
     *
     * $ path('./src/index.js').ext('.ts').raw
     * './src/index.ts'     // on POSIX
     * './src\\index.ts'    // on Windows
     *
     * $ path('./README.md').ext(null).raw
     * './README'           // on POSIX
     * '.\\README'          // on Windows
     * ```
     */
    ext(): string;
    ext(newExt: string | null): PathNice;
    /**
     * Add a prefix to the filename, i.e. add the prefix after dirname, before filename.
     *
     * @example
     * ```ts
     * $ path('data/January').prefixFilename('2021-').raw
     * 'data/2021-January'  // on POSIX
     * 'data\\2021-January' // on Windows
     * ```
     */
    prefixFilename(prefix: string): PathNice;
    /**
     * Add a postfix to the filename, but before the extension.
     * If the extension not exists, directly add to the end.
     *
     * @example
     * ```ts
     * $ path('path-nice/tsconfig.json').postfixBeforeExt('.base').raw
     * 'path-nice/tsconfig.base.json'   // on POSIX
     * 'path-nice\\tsconfig.base.json'  // on Windows
     * ```
     */
    postfixBeforeExt(postfix: string): PathNice;
    /**
     * Add a postfix to the end of the path.
     *
     * @example
     * ```ts
     * $ path('user/data/').postfix('-1').raw
     * 'user/data-1'        // on POSIX
     * 'user\\data-1'       // on Windows
     *
     * $ path('./content.txt').postfix('.json').raw
     * './content.txt.json' // on POSIX
     * '.\\content.txt.json' // on Windows
     * ```
     */
    postfix(postfix: string): PathNice;
    /**
     * Determine whether {path} is an absolute path. An absolute path will always resolve
     * to the same location, regardless of the working directory.
     *
     * @example
     * ```ts
     * // on POSIX
     * path('/foo/bar').isAbsolute();    // true
     * path('/baz/..').isAbsolute();     // true
     * path('qux/').isAbsolute();        // false
     * path('.').isAbsolute();           // false
     * // on Windows
     * path('//server').isAbsolute();    // true
     * path('\\\\server').isAbsolute();  // true
     * path('C:/foo/..').isAbsolute();   // true
     * path('C:\\foo\\..').isAbsolute(); // true
     * path('bar\\baz').isAbsolute();    // false
     * path('bar/baz').isAbsolute();     // false
     * path('.').isAbsolute();           // false
     * ```
     */
    isAbsolute(): boolean;
    /**
     * Resolve the path to an absolute path, if it isn't now.
     *
     * @param basePath (optional) to which the current path is relative. If not set,
     * current working directory is used.
     *
     * @example
     * ```ts
     * $ path('./src/index.ts').toAbsolute().raw // on POSIX,
     *                                           // suppose cwd is '/path-nice'
     * '/path-nice/src/index.ts'
     *
     * $ path('./src/index.ts').toAbsolute().raw // on Windows,
     *                                           // suppose cwd is 'D:\\path-nice'
     * 'D:\\path-nice\\src\\index.ts'
     * ```
     */
    toAbsolute(basePath?: string | PathNice): PathNice;
    /**
     * Solve the relative path by comparing with {relativeTo}. At times we have two
     * absolute paths, and we need to derive the relative path from one to the other.
     * This is actually the reverse transform of path.resolve.
     *
     * @example
     * ```ts
     * // on POSIX
     * $ path('/data/orandea/impl/bbb').toRelative('/data/orandea/test/aaa').raw
     * '../../impl/bbb'
     *
     * // on Windows
     * $ path('C:\\orandea\\impl\\bbb').toRelative('C:\\orandea\\test\\aaa').raw
     * '..\\..\\impl\\bbb'
     * ```
     */
    toRelative(relativeTo: string | PathNice): PathNice;
    realpath(): Promise<PathNice>;
    /**
     * Return an object whose properties represent significant elements of the path.
     *
     * @example
     * ```ts
     * // on POSIX
     * ┌─────────────────────┬────────────┐
     * │          dir        │    base    │
     * ├──────┐              ├──────┬─────┤
     * │ root │              │ name │ ext │
     * "  /    home/user/dir / file  .txt "
     * └──────┴──────────────┴──────┴─────┘
     * $ const result = path('/home/fuu/data.json').parse()
     * $ result.root()
     * '/'
     * $ result.dir()
     * '/home/fuu'
     * $ result.base()
     * 'data.json'
     * $ result.ext()
     * '.json'
     * $ result.name()
     * 'data'
     * $ result.dir('/root').ext('.txt').format().raw
     * '/root/data.txt'
     *
     * // on Windows
     * ┌─────────────────────┬────────────┐
     * │          dir        │    base    │
     * ├──────┐              ├──────┬─────┤
     * │ root │              │ name │ ext │
     * " C:\      path\dir   \ file  .txt "
     * └──────┴──────────────┴──────┴─────┘
     * $ const result = path('C:\\Users\\fuu\\data.json').parse()
     * $ result.root()
     * 'C:\\'
     * $ result.dir()
     * 'C:\\Users\\fuu'
     * $ result.base()
     * 'data.json'
     * $ result.ext()
     * '.json'
     * $ result.name()
     * 'data'
     * $ result.dir('D:\\path-nice').ext('.txt').format().raw
     * 'D:\\path-nice\\data.txt'
     * ```
     */
    parse(): ParsedPathNice;
    /**
     * @deprecated Use `.readString()` or `.readBuffer()` instead.
     *
     * Same as `fs.promises.readFile()`, except the path no longer needs to be specified.
     *
     * Asynchronously reads the entire contents of a file.
     */
    readFile(options?: {
        encoding?: null | undefined;
        flag?: string | number | undefined;
    } | null): Promise<Buffer>;
    /**
     * @deprecated Use `.readString()` or `.readBuffer()` instead.
     *
     * Same as `fs.promises.readFile()`, except the path no longer needs to be specified.
     *
     * Asynchronously reads the entire contents of a file.
     */
    readFile(options: {
        encoding: BufferEncoding;
        flag?: string | number | undefined;
    } | BufferEncoding): Promise<string>;
    /**
     * @deprecated Use `.readString()` or `.readBuffer()` instead.
     *
     * Same as `fs.promises.readFile()`, except the path no longer needs to be specified.
     *
     * Asynchronously reads the entire contents of a file.
     */
    readFile(options?: {
        encoding?: string | null | undefined;
        flag?: string | number | undefined;
    } | string | null): Promise<string | Buffer>;
    /**
     * Similar to `.readFile()`, but guaranteed to return a string, using UTF-8 by default.
     *
     * Asynchronously reads the entire contents of a file. If an invalid buffer encoding
     * is specified, an error will be thrown.
     */
    readString(options?: {
        encoding?: BufferEncoding | null | undefined;
        flag?: string | number | undefined;
    } | BufferEncoding | null): Promise<string>;
    /**
     * Similar to `.readFile()`, but guaranteed to return a Buffer.
     *
     * Asynchronously reads the entire contents of a file.
     */
    readBuffer(options?: {
        flag?: string | number | undefined;
    } | null): Promise<Buffer>;
    /**
     * Asynchronously reads a JSON file and then parses it into an object.
     */
    readJSON(options?: {
        flag?: string | number | undefined;
    } | null): Promise<any>;
    /**
     * Same as `fs.promises.writeFile()`, except the path no longer needs to be specified.
     *
     * Asynchronously writes data to a file, replacing the file if it already exists.
     * It is unsafe to call `fsPromises.writeFile()` multiple times on the same file
     * without waiting for the `Promise` to be resolved (or rejected).
     *
     * @param data The data to write. If something other than a `Buffer` or `Uint8Array`
     * is provided, the value is coerced to a string.
     * @param options Either the encoding for the file, or an object optionally specifying
     * the encoding, file mode, and flag.
     * If `encoding` is not supplied, the default of `'utf8'` is used.
     * If `mode` is not supplied, the default of `0o666` is used.
     * If `mode` is a string, it is parsed as an octal integer.
     * If `flag` is not supplied, the default of `'w'` is used.
     */
    writeFile(data: any, options?: {
        encoding?: string | null | undefined;
        mode?: string | number | undefined;
        flag?: string | number | undefined;
    } | string | null): Promise<void>;
    /**
     * Asynchronously writes an object to a JSON file.
     *
     * @param options a string to specify the encoding, or an object:
     * - options.EOL: set end-of-line character. Default is '\n'.
     * - options.replacer: as the 2-nd argument to JSON.stringify(). A function that alters the behavior of the stringification process, or an array of strings or numbers naming properties of value that should be included in the output. If replacer is null or not provided, all properties of the object are included in the resulting JSON string.
     * - options.spaces: as the 3-rd argument to JSON.stringify(). A string or number used to insert white space (including indentation, line break characters, etc.) into the output JSON string for readability purposes.
     * - options.encoding: use UTF-8 by default.
     * - options.mode: use 0o666 by default.
     * - options.flag: use 'w' by default.
     */
    writeJSON(data: any, options?: {
        EOL?: '\n' | '\r\n';
        replacer?: (number | string)[] | ((this: any, key: string, value: any) => any) | null | undefined;
        spaces?: number | string | undefined;
        encoding?: string | null | undefined;
        mode?: string | number | undefined;
        flag?: string | number | undefined;
    } | string | null): Promise<void>;
    outputFile(data: any, options?: {
        encoding?: string | null | undefined;
        mode?: string | number | undefined;
        flag?: string | number | undefined;
    } | string | null): Promise<void>;
    outputJSON(data: any, options?: {
        EOL?: '\n' | '\r\n';
        replacer?: (number | string)[] | ((this: any, key: string, value: any) => any) | null | undefined;
        spaces?: number | string | undefined;
        encoding?: string | null | undefined;
        mode?: string | number | undefined;
        flag?: string | number | undefined;
    } | string | null): Promise<void>;
    updateString(fn: (original: string) => string): Promise<void>;
    updateString(encoding: BufferEncoding, fn: (original: string) => string): Promise<void>;
    updateJSON(fn: (original: any) => {} | null | undefined): Promise<void>;
    updateJSON(encoding: BufferEncoding, fn: (original: any) => {} | null | undefined): Promise<void>;
    /**
     * Same as `fs.promises.appendFile()`, except the path no longer needs to be specified.
     *
     * Asynchronously append data to a file, creating the file if it does not exist.
     *
     * @param data The data to write. If something other than a `Buffer` or `Uint8Array` is provided, the value is coerced to a string.
     * @param options Either the encoding for the file, or an object optionally specifying the encoding, file mode, and flag.
     * If `encoding` is not supplied, the default of `'utf8'` is used.
     * If `mode` is not supplied, the default of `0o666` is used.
     * If `mode` is a string, it is parsed as an octal integer.
     * If `flag` is not supplied, the default of `'a'` is used.
     */
    appendFile(data: any, options?: {
        encoding?: string | null | undefined;
        mode?: string | number | undefined;
        flag?: string | number | undefined;
    } | string | null): Promise<void>;
    createReadStream(options?: string | {
        flags?: string | undefined;
        encoding?: string | undefined;
        fd?: number | undefined;
        mode?: number | undefined;
        autoClose?: boolean | undefined;
        /**
         * @default false
         */
        emitClose?: boolean | undefined;
        start?: number | undefined;
        end?: number | undefined;
        highWaterMark?: number | undefined;
    }): nodefs.ReadStream;
    createWriteStream(options?: string | {
        flags?: string | undefined;
        encoding?: string | undefined;
        fd?: number | undefined;
        mode?: number | undefined;
        autoClose?: boolean | undefined;
        emitClose?: boolean | undefined;
        start?: number | undefined;
        highWaterMark?: number | undefined;
    }): nodefs.WriteStream;
    open(flags: string, mode?: number): Promise<nodefs.promises.FileHandle>;
    copyAs(dest: string | PathNice, options?: {
        force?: boolean | null | undefined;
        dereference?: boolean | null | undefined;
        errorOnExist?: boolean | null | undefined;
        filter?: ((src: string, dest: string) => boolean) | null | undefined;
        preserveTimestamps?: boolean | null | undefined;
        recursive: boolean;
        verbatimSymlinks?: boolean | null | undefined;
    } | null): Promise<void>;
    copyToDir(destDir: string | PathNice, options?: {
        force?: boolean | null | undefined;
        dereference?: boolean | null | undefined;
        errorOnExist?: boolean | null | undefined;
        filter?: ((src: string, dest: string) => boolean) | null | undefined;
        preserveTimestamps?: boolean | null | undefined;
        recursive: boolean;
        verbatimSymlinks?: boolean | null | undefined;
    } | null): Promise<void>;
    moveAs(dest: string | PathNice, options?: {
        overwrite?: boolean | null | undefined;
    } | null): Promise<void>;
    moveToDir(destDir: string | PathNice, options?: {
        overwrite?: boolean | null | undefined;
    } | null): Promise<void>;
    rename(newPath: string | PathNice): Promise<void>;
    remove(): Promise<void>;
    emptyDir(): Promise<void>;
    ensureDir(options?: {
        mode?: number | string | undefined;
    }): Promise<void>;
    ensureFile(): Promise<void>;
    /**
     * It is recommended to use `isFile()`, `isDir()`, ...
     */
    exists(): Promise<boolean>;
    /**
     * Check if the path is an empty directory.
     *
     * If the path is not a directory, an error will be thrown.
     */
    isEmptyDir(): Promise<boolean>;
    /**
     * Check if the path is a directory.
     *
     * @param followlink when true, if the path is a link, follows it. Default: false
     */
    isDir(followlink?: boolean): Promise<boolean>;
    /**
     * Check if the path is a file.
     *
     * @param followlink when true, if the path is a link, follows it. Default: false
     */
    isFile(followlink?: boolean): Promise<boolean>;
    /**
     * Check if the path is a symbolic link.
     */
    isSymbolicLink(): Promise<boolean>;
    /**
     * Asynchronous readdir(3) - read a directory.
     * @param options The encoding (or an object specifying the encoding), used as the encoding of the result. If not provided, `'utf8'` is used.
     */
    readdir(options?: {
        encoding?: BufferEncoding | null | undefined;
        withFileTypes?: false | undefined;
    } | BufferEncoding | null): Promise<string[]>;
    /**
     * Asynchronous readdir(3) - read a directory.
     * @param options The encoding (or an object specifying the encoding), used as the encoding of the result. If not provided, `'utf8'` is used.
     */
    readdir(options: {
        encoding: 'buffer';
        withFileTypes?: false | undefined;
    } | 'buffer'): Promise<Buffer[]>;
    /**
     * Asynchronous readdir(3) - read a directory.
     * @param options The encoding (or an object specifying the encoding), used as the encoding of the result. If not provided, `'utf8'` is used.
     */
    readdir(options?: {
        encoding?: string | null | undefined;
        withFileTypes?: false | undefined;
    } | string | null): Promise<string[] | Buffer[]>;
    /**
     * Asynchronous readdir(3) - read a directory.
     * @param options If called with `withFileTypes: true` the result data will be an array of Dirent.
     */
    readdir(options: {
        encoding?: string | null | undefined;
        withFileTypes: true;
    }): Promise<nodefs.Dirent[]>;
    /**
     * List all directories and files under the folder, return a Promise that resolves to
     * an object `{ dirs: PathNice[]; files: PathNice[] }`
     *
     * - `dirs`: subdirectories, not including the current folder
     * - `files`: files and others (e.g. device, FIFO, socket, etc). If `followLinks` is
     * false, it also contains links.
     *
     * The paths contained in the returned `PathNice` object are all absolute paths, so
     * they can be used directly for `.readFile()`, `.writeFile()`, `.copyTo()`,
     * `.moveTo()`, etc. Use `.toRelative(dir)` to get the relative path.
     *
     * @param recursive whether to list file recursively. Default: false
     * @param followLinks whether to follow links under the folder. Default: false
     *
     * @example
     * ```ts
     * const { dirs, files } = await path('./').ls();
     * await files
     *     .filter(f => f.ext() === '.json')
     *     .updateJSON(json => { json.timestamp = Date.now() })
     * ```
     */
    ls(recursive?: boolean, followLinks?: boolean): Promise<{
        dirs: PathNice[];
        files: PathNice[];
    }>;
    /**
     * Watch for changes on `filename`. The callback `listener` will be called each time the file is accessed.
     */
    watchFile(options: {
        persistent?: boolean | undefined;
        interval?: number | undefined;
    } | undefined, listener: (curr: nodefs.Stats, prev: nodefs.Stats) => void): void;
    /**
     * Watch for changes on `filename`. The callback `listener` will be called each time the file is accessed.
     */
    watchFile(listener: (curr: nodefs.Stats, prev: nodefs.Stats) => void): void;
    /**
     * Stop watching for changes on `filename`.
     */
    unwatchFile(listener?: (curr: nodefs.Stats, prev: nodefs.Stats) => void): void;
    /**
     * Watch for changes on `filename`, where `filename` is either a file or a directory, returning an `FSWatcher`.
     * @param options Either the encoding for the filename provided to the listener, or an object optionally specifying encoding, persistent, and recursive options.
     * If `encoding` is not supplied, the default of `'utf8'` is used.
     * If `persistent` is not supplied, the default of `true` is used.
     * If `recursive` is not supplied, the default of `false` is used.
     */
    watch(options: {
        encoding?: BufferEncoding | null | undefined;
        persistent?: boolean | undefined;
        recursive?: boolean | undefined;
    } | BufferEncoding | undefined | null, listener?: (event: string, filename: string) => void): nodefs.FSWatcher;
    /**
     * Watch for changes on `filename`, where `filename` is either a file or a directory, returning an `FSWatcher`.
     * @param options Either the encoding for the filename provided to the listener, or an object optionally specifying encoding, persistent, and recursive options.
     * If `encoding` is not supplied, the default of `'utf8'` is used.
     * If `persistent` is not supplied, the default of `true` is used.
     * If `recursive` is not supplied, the default of `false` is used.
     */
    watch(options: {
        encoding: 'buffer';
        persistent?: boolean | undefined;
        recursive?: boolean | undefined;
    } | 'buffer', listener?: (event: string, filename: Buffer) => void): nodefs.FSWatcher;
    /**
     * Watch for changes on `filename`, where `filename` is either a file or a directory, returning an `FSWatcher`.
     * @param options Either the encoding for the filename provided to the listener, or an object optionally specifying encoding, persistent, and recursive options.
     * If `encoding` is not supplied, the default of `'utf8'` is used.
     * If `persistent` is not supplied, the default of `true` is used.
     * If `recursive` is not supplied, the default of `false` is used.
     */
    watch(options: {
        encoding?: string | null | undefined;
        persistent?: boolean | undefined;
        recursive?: boolean | undefined;
    } | string | null, listener?: (event: string, filename: string | Buffer) => void): nodefs.FSWatcher;
    /**
     * Watch for changes on `filename`, where `filename` is either a file or a directory, returning an `FSWatcher`.
     */
    watch(listener?: (event: string, filename: string) => any): nodefs.FSWatcher;
    /**
     * Asynchronous lstat(2) - Get file status. Does not dereference symbolic links.
     */
    lstat(opts?: nodefs.StatOptions & {
        bigint?: false | undefined;
    }): Promise<nodefs.Stats>;
    lstat(opts: nodefs.StatOptions & {
        bigint: true;
    }): Promise<nodefs.BigIntStats>;
    lstat(opts?: nodefs.StatOptions): Promise<nodefs.Stats | nodefs.BigIntStats>;
    /**
     * Asynchronous stat(2) - Get file status.
     */
    stat(opts?: nodefs.StatOptions & {
        bigint?: false | undefined;
    }): Promise<nodefs.Stats>;
    stat(opts: nodefs.StatOptions & {
        bigint: true;
    }): Promise<nodefs.BigIntStats>;
    stat(opts?: nodefs.StatOptions): Promise<nodefs.Stats | nodefs.BigIntStats>;
    /**
     * Asynchronous chmod(2) - Change permissions of a file.
     * @param mode A file mode. If a string is passed, it is parsed as an octal integer.
     */
    chmod(mode: string | number): Promise<void>;
    /**
     * Asynchronous lchmod(2) - Change permissions of a file. Does not dereference symbolic links.
     * @param mode A file mode. If a string is passed, it is parsed as an octal integer.
     */
    lchmod(mode: string | number): Promise<void>;
    /**
     * Asynchronous lchown(2) - Change ownership of a file. Does not dereference symbolic links.
     */
    lchown(uid: number, gid: number): Promise<void>;
    /**
     * Asynchronous chown(2) - Change ownership of a file.
     */
    chown(uid: number, gid: number): Promise<void>;
}
export declare class ParsedPathNice {
    private raw;
    constructor(raw: ParsedPath);
    valueOf(): ParsedPath;
    format(): PathNice;
    /**
     * The root of the path such as '/' or 'c:\\'
     */
    root(): string;
    root(newRoot: string): this;
    /**
     * The full directory path such as '/home/user/dir' or 'c:\\path\\dir'
     */
    dir(): string;
    dir(newDir: string): this;
    /**
     * The file name including extension (if any) such as 'index.html'
     */
    base(): string;
    base(newBase: string): this;
    /**
     * The file extension (if any) such as '.html'
     */
    ext(): string;
    ext(newExt: string): this;
    /**
     * The file name without extension (if any) such as 'index'
     */
    name(): string;
    name(newName: string): this;
}
