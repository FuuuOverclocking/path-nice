import * as nodepath from 'path';
import * as nodefs from 'fs';
import type { ParsedPath } from '../common/types.js';
import { isValidBufferEncoding } from '../common/utils/is-valid-buffer-encoding.js';
import { copy } from '../common/copy.js';
import { move } from '../common/move.js';
import { remove } from '../common/remove.js';
import { emptyDir } from '../common/empty-dir.js';
import { ensureDir, ensureFile } from '../common/ensure.js';

const lowpath = nodepath;
const regReplaceSep = lowpath.sep === '/' ? /\//g : /\\/g;

/**
 * A PathNice instance is a wrapper of the raw path string, so that the path
 * can be easily used to generate additional paths or manipulate files.
 */
export class PathNice {
    /** Raw path string. */
    public readonly raw: string;

    constructor(path: string) {
        this.raw = path;
        Object.freeze(this);
    }

    private _new(path: string): PathNice {
        return new PathNice(path);
    }

    private static _from(path: string | PathNice): PathNice {
        if (typeof path === 'string') return new PathNice(path);
        return path;
    }

    public valueOf(): string {
        return this.raw;
    }

    // ==================================================================================
    // Path related methods
    // ==================================================================================

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
    public separator(): '/' | '\\' | 'none' | 'hybrid';
    public separator(forceSep: '/' | '\\'): PathNice;
    public separator(forceSep?: '/' | '\\'): '/' | '\\' | 'none' | 'hybrid' | PathNice {
        if (forceSep) return this._new(this.raw.replace(regReplaceSep, forceSep));
        if (this.raw.indexOf('/') !== -1) {
            if (this.raw.indexOf('\\') !== -1) {
                return 'hybrid';
            }
            return '/';
        }
        if (this.raw.indexOf('\\') !== -1) {
            return '\\';
        }
        return 'none';
    }

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
    public join(...paths: Array<string | PathNice>): PathNice {
        const _paths = paths.map((p) => (typeof p === 'string' ? p : p.raw));
        return this._new(lowpath.join(this.raw, ..._paths));
    }

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
    public dirname(newDirname?: string | PathNice): PathNice {
        switch (typeof newDirname) {
            case 'undefined':
                return this._new(lowpath.dirname(this.raw));
            case 'string':
                return this._new(lowpath.join(newDirname, lowpath.basename(this.raw)));
            case 'object':
                return this._new(
                    lowpath.join(newDirname.raw, lowpath.basename(this.raw)),
                );
        }
    }

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
    public get parent(): PathNice {
        return this.dirname();
    }

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
    public filename(): string;
    public filename(newFilename: string | PathNice): PathNice;
    public filename(newFilename?: string | PathNice): string | PathNice {
        switch (typeof newFilename) {
            case 'undefined':
                return lowpath.basename(lowpath.resolve(this.raw));
            case 'string':
                return this._new(lowpath.join(lowpath.dirname(this.raw), newFilename));
            case 'object':
                return this._new(
                    lowpath.join(lowpath.dirname(this.raw), newFilename.raw),
                );
        }
    }

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
    public ext(): string;
    public ext(newExt: string | null): PathNice;
    public ext(newExt?: string | null): string | PathNice {
        switch (typeof newExt) {
            case 'undefined':
                return lowpath.extname(this.raw);
            case 'string':
            case 'object': // typeof null === 'object'
                const obj = lowpath.parse(this.raw);
                const _ext = newExt || void 0;
                return this._new(
                    lowpath.format({
                        dir: obj.dir,
                        name: obj.name,
                        ext: _ext,
                    }),
                );
        }
    }

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
    public prefixFilename(prefix: string): PathNice {
        const obj = lowpath.parse(this.raw);
        return this._new(
            lowpath.format({
                dir: obj.dir,
                base: prefix + obj.base,
            }),
        );
    }

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
    public postfixBeforeExt(postfix: string): PathNice {
        const obj = lowpath.parse(this.raw);
        return this._new(
            lowpath.format({
                dir: obj.dir,
                name: obj.name + postfix,
                ext: obj.ext,
            }),
        );
    }

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
    public postfix(postfix: string): PathNice {
        const obj = lowpath.parse(this.raw);
        return this._new(
            lowpath.format({
                dir: obj.dir,
                name: obj.name,
                ext: obj.ext + postfix,
            }),
        );
    }

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
    public isAbsolute(): boolean {
        return lowpath.isAbsolute(this.raw);
    }

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
    public toAbsolute(basePath?: string | PathNice): PathNice {
        if (this.isAbsolute()) return this;
        if (!basePath) return this._new(lowpath.resolve(this.raw));

        basePath = PathNice._from(basePath);
        if (!basePath.isAbsolute()) {
            throw new Error(
                `[path-nice] PathNice.toAbsolute: "${basePath.raw}" is not an absolute path.`,
            );
        }
        return this._new(lowpath.resolve(basePath.raw, this.raw));
    }

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
    public toRelative(relativeTo: string | PathNice): PathNice {
        if (typeof relativeTo === 'string') {
            return this._new(lowpath.relative(relativeTo, this.raw));
        }
        return this._new(lowpath.relative(relativeTo.raw, this.raw));
    }

    public async realpath(): Promise<PathNice> {
        return this._new(await nodefs.promises.realpath(this.raw, 'utf-8'));
    }

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
    public parse(): ParsedPathNice {
        return new ParsedPathNice(lowpath.parse(this.raw));
    }

    // ==================================================================================
    // File system related methods
    // ==================================================================================

    /**
     * @deprecated Use `.readString()` or `.readBuffer()` instead.
     *
     * Same as `fs.promises.readFile()`, except the path no longer needs to be specified.
     *
     * Asynchronously reads the entire contents of a file.
     */
    public readFile(
        options?: {
            encoding?: null | undefined;
            flag?: string | number | undefined;
        } | null,
    ): Promise<Buffer>;
    /**
     * @deprecated Use `.readString()` or `.readBuffer()` instead.
     *
     * Same as `fs.promises.readFile()`, except the path no longer needs to be specified.
     *
     * Asynchronously reads the entire contents of a file.
     */
    public readFile(
        options:
            | { encoding: BufferEncoding; flag?: string | number | undefined }
            | BufferEncoding,
    ): Promise<string>;
    /**
     * @deprecated Use `.readString()` or `.readBuffer()` instead.
     *
     * Same as `fs.promises.readFile()`, except the path no longer needs to be specified.
     *
     * Asynchronously reads the entire contents of a file.
     */
    public readFile(
        options?:
            | { encoding?: string | null | undefined; flag?: string | number | undefined }
            | string
            | null,
    ): Promise<string | Buffer>;
    public readFile(
        options?:
            | { encoding?: string | null | undefined; flag?: string | number | undefined }
            | string
            | null,
    ): Promise<string | Buffer> {
        return nodefs.promises.readFile(this.raw, options);
    }

    /**
     * Similar to `.readFile()`, but guaranteed to return a string, using UTF-8 by default.
     *
     * Asynchronously reads the entire contents of a file. If an invalid buffer encoding
     * is specified, an error will be thrown.
     */
    public readString(
        options?:
            | {
                  encoding?: BufferEncoding | null | undefined;
                  flag?: string | number | undefined;
              }
            | BufferEncoding
            | null,
    ): Promise<string> {
        if (!options) {
            options = { encoding: 'utf-8' };
            return nodefs.promises.readFile(this.raw, options) as Promise<string>;
        }

        if (typeof options === 'string' && isValidBufferEncoding(options)) {
            options = { encoding: options };
            return nodefs.promises.readFile(this.raw, options) as Promise<string>;
        }

        if (options && options.encoding && isValidBufferEncoding(options.encoding)) {
            options.encoding ??= 'utf-8';
            return nodefs.promises.readFile(this.raw, options) as Promise<string>;
        }

        const encoding = typeof options === 'string' ? options : options.encoding;
        throw new Error(
            `[path-nice] PathNice.readString: '${encoding}' is not a valid buffer encoding.`,
        );
    }

    /**
     * Similar to `.readFile()`, but guaranteed to return a Buffer.
     *
     * Asynchronously reads the entire contents of a file.
     */
    public readBuffer(
        options?: {
            flag?: string | number | undefined;
        } | null,
    ): Promise<Buffer> {
        if (
            typeof options === 'string' ||
            (options && typeof (options as any).encoding === 'string')
        ) {
            throw new Error(
                '[path-nice] PathNice.readBuffer: encoding should not be specified.',
            );
        }
        return nodefs.promises.readFile(this.raw, options);
    }

    /**
     * Asynchronously reads a JSON file and then parses it into an object.
     */
    public async readJson(
        options?: {
            flag?: string | number | undefined;
        } | null,
    ): Promise<any> {
        return JSON.parse(await this.readString(options));
    }

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
    public writeFile(
        data: any,
        options?:
            | {
                  encoding?: string | null | undefined;
                  mode?: string | number | undefined;
                  flag?: string | number | undefined;
              }
            | string
            | null,
    ): Promise<void> {
        return nodefs.promises.writeFile(this.raw, data, options);
    }

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
    public writeJson(
        data: any,
        options?:
            | {
                  EOL?: '\n' | '\r\n';
                  replacer?:
                      | (number | string)[]
                      | ((this: any, key: string, value: any) => any)
                      | null
                      | undefined;
                  spaces?: number | string | undefined;
                  encoding?: string | null | undefined;
                  mode?: string | number | undefined;
                  flag?: string | number | undefined;
              }
            | string
            | null,
    ): Promise<void> {
        options = typeof options === 'string' ? { encoding: options } : options || {};

        const writeOptions = {} as any;
        writeOptions.encoding = options.encoding || 'utf-8';
        writeOptions.mode = options.mode;
        writeOptions.flag = options.flag;

        let json = JSON.stringify(data, options.replacer as any, options.spaces || 4);
        if (options.EOL && options.EOL !== '\n') {
            json = json.replace(/\n/g, options.EOL);
        }

        return this.writeFile(json, writeOptions);
    }

    public async outputFile(
        data: any,
        options?:
            | {
                  encoding?: string | null | undefined;
                  mode?: string | number | undefined;
                  flag?: string | number | undefined;
              }
            | string
            | null,
    ): Promise<void> {
        await this.parent.ensureDir();
        await nodefs.promises.writeFile(this.raw, data, options);
    }

    public async outputJson(
        data: any,
        options?:
            | {
                  EOL?: '\n' | '\r\n';
                  replacer?:
                      | (number | string)[]
                      | ((this: any, key: string, value: any) => any)
                      | null
                      | undefined;
                  spaces?: number | string | undefined;
                  encoding?: string | null | undefined;
                  mode?: string | number | undefined;
                  flag?: string | number | undefined;
              }
            | string
            | null,
    ): Promise<void> {
        await this.parent.ensureDir();

        options = typeof options === 'string' ? { encoding: options } : options || {};

        const writeOptions = {} as any;
        writeOptions.encoding = options.encoding || 'utf-8';
        writeOptions.mode = options.mode;
        writeOptions.flag = options.flag;

        let json = JSON.stringify(data, options.replacer as any, options.spaces || 4);
        if (options.EOL && options.EOL !== '\n') {
            json = json.replace(/\n/g, options.EOL);
        }

        await this.writeFile(json, writeOptions);
    }

    public async updateString(fn: (original: string) => string): Promise<void>;
    public async updateString(
        encoding: BufferEncoding,
        fn: (original: string) => string,
    ): Promise<void>;
    public async updateString(arg0: any, arg1?: any): Promise<void> {
        if (typeof arg0 === 'function') {
            const str = await this.readString();
            await this.writeFile(arg0(str));
            return;
        }
        const str = await this.readString(arg0);
        await this.writeFile(arg1(str), { encoding: arg0 });
    }

    public async updateJson(fn: (original: any) => {} | null | undefined): Promise<void>;
    public async updateJson(
        encoding: BufferEncoding,
        fn: (original: any) => {} | null | undefined,
    ): Promise<void>;
    public async updateJson(arg0: any, arg1?: any): Promise<void> {
        if (typeof arg0 === 'function') {
            const obj = await this.readJson();
            const result = arg0(obj);
            await this.writeJson(result === void 0 ? obj : result);
            return;
        }
        const obj = await this.readString(arg0);
        const result = arg1(obj);
        await this.writeFile(result === void 0 ? obj : result, { encoding: arg0 });
    }

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
    public appendFile(
        data: any,
        options?:
            | {
                  encoding?: string | null | undefined;
                  mode?: string | number | undefined;
                  flag?: string | number | undefined;
              }
            | string
            | null,
    ): Promise<void> {
        return nodefs.promises.appendFile(this.raw, data, options);
    }

    public createReadStream(
        options?:
            | string
            | {
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
              },
    ): nodefs.ReadStream {
        return nodefs.createReadStream(this.raw, options);
    }

    public createWriteStream(
        options?:
            | string
            | {
                  flags?: string | undefined;
                  encoding?: string | undefined;
                  fd?: number | undefined;
                  mode?: number | undefined;
                  autoClose?: boolean | undefined;
                  emitClose?: boolean | undefined;
                  start?: number | undefined;
                  highWaterMark?: number | undefined;
              },
    ): nodefs.WriteStream {
        return nodefs.createWriteStream(this.raw, options);
    }

    public open(flags: string, mode?: number): Promise<nodefs.promises.FileHandle> {
        return nodefs.promises.open(flags, mode);
    }

    public copyAs(
        dest: string | PathNice,
        options?: {
            force?: boolean | null | undefined;
            dereference?: boolean | null | undefined;
            errorOnExist?: boolean | null | undefined;
            filter?: ((src: string, dest: string) => boolean) | null | undefined;
            preserveTimestamps?: boolean | null | undefined;
            recursive: boolean;
            verbatimSymlinks?: boolean | null | undefined;
        } | null,
    ): Promise<void> {
        return copy(
            lowpath as any,
            nodefs,
            this.raw,
            typeof dest === 'string' ? dest : dest.raw,
            options,
        );
    }

    public copyToDir(
        destDir: string | PathNice,
        options?: {
            force?: boolean | null | undefined;
            dereference?: boolean | null | undefined;
            errorOnExist?: boolean | null | undefined;
            filter?: ((src: string, dest: string) => boolean) | null | undefined;
            preserveTimestamps?: boolean | null | undefined;
            recursive: boolean;
            verbatimSymlinks?: boolean | null | undefined;
        } | null,
    ): Promise<void> {
        const destDirStr = typeof destDir === 'string' ? destDir : destDir.raw;

        return copy(
            lowpath as any,
            nodefs,
            this.raw,
            lowpath.join(destDirStr, this.filename()),
            options,
        );
    }

    public moveAs(
        dest: string | PathNice,
        options?: {
            overwrite?: boolean | null | undefined;
        } | null,
    ): Promise<void> {
        return move(
            lowpath as any,
            nodefs,
            this.raw,
            typeof dest === 'string' ? dest : dest.raw,
            options,
        );
    }

    public moveToDir(
        destDir: string | PathNice,
        options?: {
            overwrite?: boolean | null | undefined;
        } | null,
    ): Promise<void> {
        const destDirStr = typeof destDir === 'string' ? destDir : destDir.raw;

        return move(
            lowpath as any,
            nodefs,
            this.raw,
            lowpath.join(destDirStr, this.filename()),
            options,
        );
    }

    public rename(newPath: string | PathNice): Promise<void> {
        return nodefs.promises.rename(
            this.raw,
            typeof newPath === 'string' ? newPath : newPath.raw,
        );
    }

    public remove(): Promise<void> {
        return remove(nodefs, this.raw);
    }

    public emptyDir(): Promise<void> {
        return emptyDir(lowpath as any, nodefs, this.raw);
    }

    public ensureDir(options?: { mode?: number | string | undefined }): Promise<void> {
        return ensureDir(nodefs, this.raw, options);
    }

    public ensureFile(): Promise<void> {
        return ensureFile(lowpath as any, nodefs, this.raw);
    }

    /**
     * It is recommended to use `isFile()`, `isDir()`, ...
     */
    public exists(): Promise<boolean> {
        return nodefs.promises.access(this.raw).then(
            () => true,
            () => false,
        );
    }

    /**
     * Check if the path is an empty directory.
     *
     * If the path is not a directory, an error will be thrown.
     */
    public async isEmptyDir(): Promise<boolean> {
        const files = await nodefs.promises.readdir(this.raw);
        return files.length === 0;
    }

    /**
     * Check if the path is a directory.
     *
     * @param followlink when true, if the path is a link, follows it. Default: false
     */
    public async isDir(followlink?: boolean): Promise<boolean> {
        const stats = followlink
            ? await nodefs.promises.stat(this.raw)
            : await nodefs.promises.lstat(this.raw);
        return stats.isDirectory();
    }

    /**
     * Check if the path is a file.
     *
     * @param followlink when true, if the path is a link, follows it. Default: false
     */
    public async isFile(followlink?: boolean): Promise<boolean> {
        const stats = followlink
            ? await nodefs.promises.stat(this.raw)
            : await nodefs.promises.lstat(this.raw);
        return stats.isFile();
    }

    /**
     * Check if the path is a symbolic link.
     */
    public async isSymbolicLink(): Promise<boolean> {
        const stats = await nodefs.promises.lstat(this.raw);
        return stats.isSymbolicLink();
    }

    /**
     * Asynchronous readdir(3) - read a directory.
     * @param options The encoding (or an object specifying the encoding), used as the encoding of the result. If not provided, `'utf8'` is used.
     */
    public readdir(
        options?:
            | {
                  encoding?: BufferEncoding | null | undefined;
                  withFileTypes?: false | undefined;
              }
            | BufferEncoding
            | null,
    ): Promise<string[]>;

    /**
     * Asynchronous readdir(3) - read a directory.
     * @param options The encoding (or an object specifying the encoding), used as the encoding of the result. If not provided, `'utf8'` is used.
     */
    public readdir(
        options: { encoding: 'buffer'; withFileTypes?: false | undefined } | 'buffer',
    ): Promise<Buffer[]>;

    /**
     * Asynchronous readdir(3) - read a directory.
     * @param options The encoding (or an object specifying the encoding), used as the encoding of the result. If not provided, `'utf8'` is used.
     */
    public readdir(
        options?:
            | { encoding?: string | null | undefined; withFileTypes?: false | undefined }
            | string
            | null,
    ): Promise<string[] | Buffer[]>;

    /**
     * Asynchronous readdir(3) - read a directory.
     * @param options If called with `withFileTypes: true` the result data will be an array of Dirent.
     */
    public readdir(options: {
        encoding?: string | null | undefined;
        withFileTypes: true;
    }): Promise<nodefs.Dirent[]>;

    public readdir(options?: any): any {
        return nodefs.promises.readdir(this.raw, options);
    }

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
     *     .updateJson(json => { json.timestamp = Date.now() })
     * ```
     */
    public async ls(
        recursive?: boolean,
        followLinks?: boolean,
    ): Promise<{ dirs: PathNice[]; files: PathNice[] }> {
        const fs = nodefs.promises;

        // Always try to resolve a link for the current path,
        // regardless of whether followLinks is enabled.
        const stats = await fs.stat(this.raw);
        if (!stats.isDirectory()) {
            throw new Error('[path-nice] .ls(): the path is not a directory.');
        }

        const dirs = [] as PathNice[];
        const files = [] as PathNice[];

        const readSingleLayer = async (dir: string) => {
            const entries = await fs.readdir(dir, { withFileTypes: true });
            for (const entry of entries) {
                const abs = lowpath.join(dir, entry.name);
                const nice = this._new(abs);

                let isDir = false;
                if (followLinks && entry.isSymbolicLink()) {
                    const real = await fs.realpath(abs);
                    const stats = await fs.lstat(real);
                    if (stats.isDirectory()) isDir = true;
                } else if (entry.isDirectory()) {
                    isDir = true;
                }

                if (isDir) {
                    dirs.push(nice);
                    await readSingleLayer(abs);
                } else {
                    files.push(nice);
                }
            }
        };

        await readSingleLayer(lowpath.normalize(this.toAbsolute().raw));

        return { dirs, files };
    }

    /**
     * Watch for changes on `filename`. The callback `listener` will be called each time the file is accessed.
     */
    public watchFile(
        options:
            | { persistent?: boolean | undefined; interval?: number | undefined }
            | undefined,
        listener: (curr: nodefs.Stats, prev: nodefs.Stats) => void,
    ): void;
    /**
     * Watch for changes on `filename`. The callback `listener` will be called each time the file is accessed.
     */
    public watchFile(listener: (curr: nodefs.Stats, prev: nodefs.Stats) => void): void;
    public watchFile(arg0: any, arg1?: any): void {
        return nodefs.watchFile(this.raw, arg0, arg1);
    }

    /**
     * Stop watching for changes on `filename`.
     */
    public unwatchFile(
        listener?: (curr: nodefs.Stats, prev: nodefs.Stats) => void,
    ): void {
        return nodefs.unwatchFile(this.raw, listener);
    }

    /**
     * Watch for changes on `filename`, where `filename` is either a file or a directory, returning an `FSWatcher`.
     * @param options Either the encoding for the filename provided to the listener, or an object optionally specifying encoding, persistent, and recursive options.
     * If `encoding` is not supplied, the default of `'utf8'` is used.
     * If `persistent` is not supplied, the default of `true` is used.
     * If `recursive` is not supplied, the default of `false` is used.
     */
    public watch(
        options:
            | {
                  encoding?: BufferEncoding | null | undefined;
                  persistent?: boolean | undefined;
                  recursive?: boolean | undefined;
              }
            | BufferEncoding
            | undefined
            | null,
        listener?: (event: string, filename: string) => void,
    ): nodefs.FSWatcher;
    /**
     * Watch for changes on `filename`, where `filename` is either a file or a directory, returning an `FSWatcher`.
     * @param options Either the encoding for the filename provided to the listener, or an object optionally specifying encoding, persistent, and recursive options.
     * If `encoding` is not supplied, the default of `'utf8'` is used.
     * If `persistent` is not supplied, the default of `true` is used.
     * If `recursive` is not supplied, the default of `false` is used.
     */
    public watch(
        options:
            | {
                  encoding: 'buffer';
                  persistent?: boolean | undefined;
                  recursive?: boolean | undefined;
              }
            | 'buffer',
        listener?: (event: string, filename: Buffer) => void,
    ): nodefs.FSWatcher;
    /**
     * Watch for changes on `filename`, where `filename` is either a file or a directory, returning an `FSWatcher`.
     * @param options Either the encoding for the filename provided to the listener, or an object optionally specifying encoding, persistent, and recursive options.
     * If `encoding` is not supplied, the default of `'utf8'` is used.
     * If `persistent` is not supplied, the default of `true` is used.
     * If `recursive` is not supplied, the default of `false` is used.
     */
    public watch(
        options:
            | {
                  encoding?: string | null | undefined;
                  persistent?: boolean | undefined;
                  recursive?: boolean | undefined;
              }
            | string
            | null,
        listener?: (event: string, filename: string | Buffer) => void,
    ): nodefs.FSWatcher;
    /**
     * Watch for changes on `filename`, where `filename` is either a file or a directory, returning an `FSWatcher`.
     */
    public watch(listener?: (event: string, filename: string) => any): nodefs.FSWatcher;
    public watch(arg0?: any, arg1?: any): nodefs.FSWatcher {
        return nodefs.watch(this.raw, arg0, arg1);
    }

    /**
     * Asynchronous lstat(2) - Get file status. Does not dereference symbolic links.
     */
    public lstat(
        opts?: nodefs.StatOptions & { bigint?: false | undefined },
    ): Promise<nodefs.Stats>;
    public lstat(
        opts: nodefs.StatOptions & { bigint: true },
    ): Promise<nodefs.BigIntStats>;
    public lstat(opts?: nodefs.StatOptions): Promise<nodefs.Stats | nodefs.BigIntStats>;
    public lstat(opts?: nodefs.StatOptions): Promise<nodefs.Stats | nodefs.BigIntStats> {
        return nodefs.promises.lstat(this.raw, opts);
    }

    /**
     * Asynchronous stat(2) - Get file status.
     */
    public stat(
        opts?: nodefs.StatOptions & { bigint?: false | undefined },
    ): Promise<nodefs.Stats>;
    public stat(opts: nodefs.StatOptions & { bigint: true }): Promise<nodefs.BigIntStats>;
    public stat(opts?: nodefs.StatOptions): Promise<nodefs.Stats | nodefs.BigIntStats>;
    public stat(opts?: nodefs.StatOptions): Promise<nodefs.Stats | nodefs.BigIntStats> {
        return nodefs.promises.stat(this.raw, opts);
    }

    /**
     * Asynchronous chmod(2) - Change permissions of a file.
     * @param mode A file mode. If a string is passed, it is parsed as an octal integer.
     */
    public chmod(mode: string | number): Promise<void> {
        return nodefs.promises.chmod(this.raw, mode);
    }

    /**
     * Asynchronous lchmod(2) - Change permissions of a file. Does not dereference symbolic links.
     * @param mode A file mode. If a string is passed, it is parsed as an octal integer.
     */
    public lchmod(mode: string | number): Promise<void> {
        return nodefs.promises.lchmod(this.raw, mode);
    }

    /**
     * Asynchronous lchown(2) - Change ownership of a file. Does not dereference symbolic links.
     */
    public lchown(uid: number, gid: number): Promise<void> {
        return nodefs.promises.lchown(this.raw, uid, gid);
    }

    /**
     * Asynchronous chown(2) - Change ownership of a file.
     */
    public chown(uid: number, gid: number): Promise<void> {
        return nodefs.promises.chown(this.raw, uid, gid);
    }
}

export class ParsedPathNice {
    constructor(private raw: ParsedPath) {}

    public valueOf(): ParsedPath {
        return this.raw;
    }

    public format(): PathNice {
        return new PathNice(lowpath.format(this.raw));
    }

    /**
     * The root of the path such as '/' or 'c:\\'
     */
    public root(): string;
    public root(newRoot: string): this;
    public root(newRoot?: string): string | this {
        if (typeof newRoot === 'string') {
            this.raw.root = newRoot;
            return this;
        }
        return this.raw.root;
    }

    /**
     * The full directory path such as '/home/user/dir' or 'c:\\path\\dir'
     */
    public dir(): string;
    public dir(newDir: string): this;
    public dir(newDir?: string): string | this {
        if (typeof newDir === 'string') {
            this.raw.dir = newDir;
            return this;
        }
        return this.raw.dir;
    }

    /**
     * The file name including extension (if any) such as 'index.html'
     */
    public base(): string;
    public base(newBase: string): this;
    public base(newBase?: string): string | this {
        if (typeof newBase === 'string') {
            this.raw.base = newBase;
            return this;
        }
        return this.raw.base;
    }

    /**
     * The file extension (if any) such as '.html'
     */
    public ext(): string;
    public ext(newExt: string): this;
    public ext(newExt?: string): string | this {
        if (typeof newExt === 'string') {
            this.raw.ext = newExt;
            return this;
        }
        return this.raw.ext;
    }

    /**
     * The file name without extension (if any) such as 'index'
     */
    public name(): string;
    public name(newName: string): this;
    public name(newName?: string): string | this {
        if (typeof newName === 'string') {
            this.raw.name = newName;
            return this;
        }
        return this.raw.name;
    }
}
