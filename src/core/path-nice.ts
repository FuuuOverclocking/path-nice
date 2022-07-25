import type nodefs from 'fs';
import type chokidar from 'chokidar';
import type { FileSystem, PlatformPath } from './types.js';

/**
 * A PathNice object is a wrapper of the raw path string, so that the path can be easily
 * used to generate additional paths or manipulate files.
 */
export interface PathNice<T = unknown> {
    readonly raw: string;

    /** @internal */
    readonly lowpath: PlatformPath;
    /** @internal */
    readonly fs: FileSystem;

    /** Returns raw path string. */
    valueOf(): string;

    /** Returns raw path string. */
    toString(): string;

    // ===================================================================================
    // Path related methods
    // ===================================================================================

    /**
     * Join this path with all arguments together and normalize the resulting path.
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
     *
     * @category Path related
     */
    join(...paths: Array<string | PathNice>): PathNice;

    /**
     * Get (when 0 args) or set (when 1 arg) the directory name of the path.
     *
     * If the argument is a function, it should accept a string of the old dirname and
     * return a string as the new dirname.
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
     * 'dist/index.ts'      // on POSIX
     * 'dist\\index.ts'     // on Windows
     *
     * $ path('path-nice/dist/types.ts').dirname(old => old.replace(/dist/g, 'build')).raw
     * 'path-nice/build/types.ts'   // on POSIX
     * 'path-nice\\build\\types.ts' // on Windows
     * ```
     *
     * @category Path related
     */
    dirname(newDirname?: string | PathNice | ((oldDirname: string) => string)): PathNice;

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
     *
     * @category Path related
     */
    get parent(): PathNice;

    /**
     * Get (when 0 args) or set (when 1 arg) the filename of the path.
     *
     * When getting the filename, technically, it will firstly convert the path to an
     * absolute path, then return its last portion. Therefore, for relative paths ". /",
     * this method can also get the file name. If the path is root directory, it
     * returns ''.
     *
     * When setting the filename, it will only modifiy the path string and will not
     * actually rename the file. If the argument is a function, it should accept a string
     * of the old filename and return a string as the new filename.
     *
     * @example
     * ```ts
     * $ path('./src/index.js').filename()
     * 'index.js'
     *
     * $ path('/home/fuu///').filename()
     * 'fuu'                    // on POSIX
     *
     * $ path('/home/fuu/bar.txt').filename('foo.md').raw
     * '/home/fuu/foo.md'       // on POSIX
     *
     * $ path('C:\\Users\\fuu\\\\\\').filename()
     * 'fuu'                    // on Windows
     *
     * $ path('C:\\Users\\fuu\\bar.txt').filename('foo.md').raw
     * 'C:\\Users\\fuu\\foo.md' // on Windows
     *
     * $ path('./data/storage.json').filename(n => 'old.' + n).raw
     * 'data/old.storage.json'  // on POSIX
     * 'data\\old.storage.json' // on Windows
     * ```
     *
     * @category Path related
     */
    filename(): string;
    filename(newFilename: string | ((oldFilename: string) => string)): PathNice;

    /**
     * Get (when 0 args), set (when arg is a string or a function) or remove (when arg is
     * null) the extension of the path, from the last '.' to end of string in the last
     * portion of the path.
     *
     * When getting the filename, if there is no '.' in the last portion of the path or
     * the first character of it is '.', then it returns an empty string.
     *
     * When setting the filename, it will only modifiy the path string and will not
     * actually rename the file.
     *
     * @example
     * ```ts
     * $ path('./src/index.js').ext()
     * '.js'
     *
     * $ path('./LICENSE').ext()
     * ''
     *
     * $ path('.bashrc').ext()
     * ''
     *
     * $ path('./src/index.js').ext('.ts').raw
     * './src/index.ts'     // on POSIX
     * './src\\index.ts'    // on Windows
     *
     * $ path('./public/help.htm').ext(
     *       ext => ext === '.htm' ? '.html' : ext
     *   ).raw
     * './public/help.html' // on POSIX
     * './public\\help.html'// on Windows
     *
     * $ path('./README.md').ext(null).raw
     * './README'           // on POSIX
     * '.\\README'          // on Windows
     * ```
     *
     * @category Path related
     */
    ext(): string;
    ext(newExt: string | null | ((oldExt: string) => string)): PathNice;

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
     *
     * @category Path related
     */
    separator(): '/' | '\\' | 'none' | 'hybrid';
    separator(forceSep: '/' | '\\'): PathNice;

    /**
     * Add a prefix to the filename, i.e. add the prefix after dirname, before filename.
     *
     * This will only modifiy the path string and will not actually rename the file.
     *
     * @example
     * ```ts
     * $ path('data/January').prefixFilename('2021-').raw
     * 'data/2021-January'  // on POSIX
     * 'data\\2021-January' // on Windows
     * ```
     *
     * @category Path related
     */
    prefixFilename(prefix: string): PathNice;

    /**
     * Add a postfix to the filename, but before the extension.
     * If the extension not exists, directly add to the end.
     *
     * This will only modifiy the path string and will not actually rename the file.
     *
     * @example
     * ```ts
     * $ path('path-nice/tsconfig.json').postfixBeforeExt('.base').raw
     * 'path-nice/tsconfig.base.json'   // on POSIX
     * 'path-nice\\tsconfig.base.json'  // on Windows
     * ```
     *
     * @category Path related
     */
    postfixBeforeExt(postfix: string): PathNice;

    /**
     * Add a postfix to the end of the path.
     *
     * This will only modifiy the path string and will not actually rename the file.
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
     *
     * @category Path related
     */
    postfix(postfix: string): PathNice;

    /**
     * Determine whether path is an absolute path. An absolute path will always resolve
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
     *
     * @category Path related
     */
    isAbsolute(): boolean;

    /**
     * Resolve the path to an absolute path, if it isn't now.
     *
     * @param basePath (optional) to where the current path is relative. Must be an
     * absolute path. If not set, current working directory is used.
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
     *
     * $ path('./src/index.ts').toAbsolute('/work').raw     // on POSIX
     * '/work/src/index.ts'
     *
     * $ path('./src/index.ts').toAbsolute('D:\\work').raw  // on Windows
     * 'D:\\work\\src\\index.ts'
     * ```
     *
     * @category Path related
     */
    toAbsolute(basePath?: string | PathNice): PathNice;

    /**
     * Solve the relative path by comparing with {relativeTo}. At times we have two
     * absolute paths, and we need to derive the relative path from one to the other.
     * This is actually the reverse transform of path.resolve.
     *
     * The default value of `relativeTo` is current working directory.
     *
     * @example
     * ```ts
     * $ path('./src/index.ts').toAbsolute().toRelative('./')
     * 'src/index.ts'       // on POSIX
     * 'src\\index.ts'      // on Windows
     *
     * $ path('/data/orandea/impl/bbb').toRelative('/data/orandea/test/aaa').raw
     * '../../impl/bbb'     // on POSIX
     *
     * $ path('C:\\orandea\\impl\\bbb').toRelative('C:\\orandea\\test\\aaa').raw
     * '..\\..\\impl\\bbb'  // on Windows
     * ```
     *
     * @category Path related
     */
    toRelative(relativeTo?: string | PathNice): PathNice;

    /**
     * Asynchronously computes the canonical pathname by resolving `.`, `..`, and symbolic
     * links.
     *
     * @category Path related
     */
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
     *
     * @category Path related
     */
    parse(): ParsedPathNice;

    // ==================================================================================
    // File system related methods
    // ==================================================================================

    /**
     * Roughly same as `fs.promises.readFile()`, but no need to specify the path.
     *
     * Asynchronously reads the entire contents of a file.
     *
     * If no encoding is specified (using options.encoding), the data is returned as a
     * <Buffer> object. Otherwise, the data will be a string.
     *
     * If options is a string, then it specifies the encoding.
     *
     * - `options.encoding` Default: null
     * - `options.flag` See [support of file system flags](https://nodejs.org/api/fs.html#file-system-flags). Default: 'r'
     * - `options.signal` allows aborting an in-progress readFile
     *
     * It is possible to abort an ongoing `readFile` using an `AbortSignal`. If a
     * request is aborted the promise returned is rejected with an `AbortError`:
     *
     * ```js
     * import path from 'path-nice';
     *
     * try {
     *   const controller = new AbortController();
     *   const { signal } = controller;
     *   const promise = path(filename).readFile({ signal });
     *
     *   // Abort the request before the promise settles.
     *   controller.abort();
     *
     *   await promise;
     * } catch (err) {
     *   // When a request is aborted - err is an AbortError
     *   console.error(err);
     * }
     * ```
     *
     * Aborting an ongoing request does not abort individual operating
     * system requests but rather the internal buffering `fs.readFile` performs.
     *
     * @category Read and write
     */
    readFile(
        options?: {
            encoding?: null | undefined;
            flag?: string | number | undefined;
            signal?: AbortSignal | undefined;
        } | null,
    ): Promise<Buffer>;
    readFile(
        options:
            | {
                  encoding: BufferEncoding;
                  flag?: string | number | undefined;
                  signal?: AbortSignal | undefined;
              }
            | BufferEncoding,
    ): Promise<string>;
    readFile(
        options?:
            | {
                  encoding?: string | null | undefined;
                  flag?: string | number | undefined;
                  signal?: AbortSignal | undefined;
              }
            | string
            | null,
    ): Promise<string | Buffer>;

    /**
     * Roughly same as `fs.readFileSync()`, but no need to specify the path.
     *
     * Synchronously reads the entire contents of a file.
     *
     * If no encoding is specified (using options.encoding), the data is returned as a
     * <Buffer> object. Otherwise, the data will be a string.
     *
     * If options is a string, then it specifies the encoding.
     *
     * - `options.encoding` Default: null
     * - `options.flag` See [support of file system flags](https://nodejs.org/api/fs.html#file-system-flags). Default: 'r'
     *
     * @category Read and write Sync
     */
    readFileSync(
        options?: {
            encoding?: null | undefined;
            flag?: string | number | undefined;
        } | null,
    ): Buffer;
    readFileSync(
        options:
            | { encoding: BufferEncoding; flag?: string | number | undefined }
            | BufferEncoding,
    ): string;
    readFileSync(
        options?:
            | { encoding?: string | null | undefined; flag?: string | number | undefined }
            | string
            | null,
    ): string | Buffer;

    /**
     * Similar to `.readFile()`, but guaranteed to return a string, use UTF-8 by default.
     *
     * Asynchronously reads the entire contents of a file.
     *
     * @param options if options is a string, then it specifies the encoding.
     * - `options.encoding` Default: 'utf8'
     * - `options.flag` See [support of file system flags](https://nodejs.org/api/fs.html#file-system-flags). Default: 'r'
     * - `options.signal` allows aborting an in-progress readFile
     *
     * It is possible to abort an ongoing `readFile` using an `AbortSignal`. If a
     * request is aborted the promise returned is rejected with an `AbortError`:
     *
     * ```js
     * import path from 'path-nice';
     *
     * try {
     *   const controller = new AbortController();
     *   const { signal } = controller;
     *   const promise = path(filename).readFileToString({ signal });
     *
     *   // Abort the request before the promise settles.
     *   controller.abort();
     *
     *   await promise;
     * } catch (err) {
     *   // When a request is aborted - err is an AbortError
     *   console.error(err);
     * }
     * ```
     *
     * Aborting an ongoing request does not abort individual operating
     * system requests but rather the internal buffering `fs.readFile` performs.
     *
     * @category Read and write
     */
    readFileToString(
        options?:
            | {
                  encoding?: BufferEncoding | null | undefined;
                  flag?: string | number | undefined;
                  signal?: AbortSignal | undefined;
              }
            | BufferEncoding
            | null,
    ): Promise<string>;

    /**
     * Similar to `.readFileSync()`, but guaranteed to return a string, use UTF-8 by
     * default.
     *
     * Synchronously reads the entire contents of a file.
     *
     * @param options if options is a string, then it specifies the encoding.
     * - `options.encoding` Default: 'utf8'
     * - `options.flag` See [support of file system flags](https://nodejs.org/api/fs.html#file-system-flags). Default: 'r'
     *
     * @category Read and write Sync
     */
    readFileToStringSync(
        options?:
            | {
                  encoding?: BufferEncoding | null | undefined;
                  flag?: string | number | undefined;
              }
            | BufferEncoding
            | null,
    ): string;

    /**
     * Asynchronously reads a JSON file and then parses it into an object.
     *
     * If options is a string, then it specifies the encoding.
     *
     * - `options.encoding` Default: 'utf8'
     * - `options.flag` See [support of file system flags](https://nodejs.org/api/fs.html#file-system-flags). Default: 'r'
     *
     * @category Read and write
     */
    readJSON(
        options?:
            | {
                  encoding?: BufferEncoding | null | undefined;
                  flag?: string | number | undefined;
              }
            | BufferEncoding
            | null,
    ): Promise<any>;

    /**
     * Synchronously reads a JSON file and then parses it into an object.
     *
     * If options is a string, then it specifies the encoding.
     *
     * - `options.encoding` Default: 'utf8'
     * - `options.flag` See [support of file system flags](https://nodejs.org/api/fs.html#file-system-flags). Default: 'r'
     *
     * @category Read and write Sync
     */
    readJSONSync(
        options?:
            | {
                  encoding?: BufferEncoding | null | undefined;
                  flag?: string | number | undefined;
              }
            | BufferEncoding
            | null,
    ): any;

    /**
     * Roughly same as `fs.promises.writeFile()`, but no need to specify the path.
     *
     * Asynchronously writes data to a file, replacing the file if it already exists.
     *
     * It is unsafe to call `fsPromises.writeFile()` multiple times on the same file
     * without waiting for the `Promise` to be resolved (or rejected).
     *
     * @param data can be a string, a <Buffer>, or, an object with an own (not inherited)
     * toString function property. The encoding option is ignored if data is a buffer.
     * @param options If options is a string, then it specifies the encoding.
     * - `options.encoding` Default: 'utf8'
     * - `options.mode` Default: 0o666
     * - `options.flag` See support of file system flags. Default: 'w'.
     * - `options.signal` allows aborting an in-progress writeFile
     *
     * It is possible to use an <AbortSignal> to cancel an writeFile(). Cancelation is
     * "best effort", and some amount of data is likely still to be written.
     *
     * ```js
     * import { writeFile } from 'fs/promises';
     * import { Buffer } from 'buffer';
     *
     * try {
     *   const controller = new AbortController();
     *   const { signal } = controller;
     *   const data = new Uint8Array(Buffer.from('Hello Node.js'));
     *   const promise = writeFile('message.txt', data, { signal });
     *
     *   // Abort the request before the promise settles.
     *   controller.abort();
     *
     *   await promise;
     * } catch (err) {
     *   // When a request is aborted - err is an AbortError
     *   console.error(err);
     * }
     * ```
     *
     * Aborting an ongoing request does not abort individual operating system requests but
     * rather the internal buffering writeFile() performs.
     *
     * @category Read and write
     */
    writeFile(
        data: any,
        options?:
            | {
                  encoding?: string | null | undefined;
                  /**
                   * Only affects the newly created file. See `fs.open()` for more
                   * details.
                   */
                  mode?: string | number | undefined;
                  flag?: string | number | undefined;
                  /**
                   * When provided the corresponding `AbortController` can be used to
                   * cancel an asynchronous action.
                   */
                  signal?: AbortSignal | undefined;
              }
            | string
            | null,
    ): Promise<void>;

    /**
     * Roughly same as `fs.writeFileSync()`, but no need to specify the path.
     *
     * Synchronously writes data to a file, replacing the file if it already exists.
     *
     * @param data can be a string, a <Buffer>, or, an object with an own (not inherited)
     * toString function property. The encoding option is ignored if data is a buffer.
     * @param options If options is a string, then it specifies the encoding.
     * - `options.encoding` Default: 'utf8'
     * - `options.mode` Default: 0o666
     * - `options.flag` See [support of file system flags](https://nodejs.org/api/fs.html#file-system-flags). Default: 'w'.
     *
     * @category Read and write Sync
     */
    writeFileSync(
        data: any,
        options?:
            | {
                  encoding?: string | null | undefined;
                  /**
                   * Only affects the newly created file. See `fs.open()` for more
                   * details.
                   */
                  mode?: string | number | undefined;
                  flag?: string | number | undefined;
              }
            | string
            | null,
    ): void;

    /**
     * Asynchronously writes an object to a JSON file.
     *
     * @param options a string to specify the encoding, or an object:
     * - `options.EOL`: set end-of-line character. Default: '\n'.
     * - `options.replacer`: passed to JSON.stringify(). A function that alters the behavior
     * of the stringification process, or an array of strings or numbers naming properties
     * of value that should be included in the output. If replacer is null or not provided,
     * all properties of the object are included in the resulting JSON string.
     * - `options.spaces`: passed to JSON.stringify(). A string or number used to insert
     * white space (including indentation, line break characters, etc.) into the output
     * JSON string for readability purposes.
     * - `options.encoding` Default: 'utf8'
     * - `options.mode` Default: 0o666
     * - `options.flag` See [support of file system flags](https://nodejs.org/api/fs.html#file-system-flags). Default: 'w'.
     *
     * @category Read and write
     */
    writeJSON(
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
    ): Promise<void>;

    /**
     * Synchronously writes an object to a JSON file.
     *
     * @param options a string to specify the encoding, or an object:
     * - `options.EOL`: set end-of-line character. Default: '\n'.
     * - `options.replacer`: passed to JSON.stringify(). A function that alters the behavior
     * of the stringification process, or an array of strings or numbers naming properties
     * of value that should be included in the output. If replacer is null or not provided,
     * all properties of the object are included in the resulting JSON string.
     * - `options.spaces`: passed to JSON.stringify(). A string or number used to insert
     * white space (including indentation, line break characters, etc.) into the output
     * JSON string for readability purposes.
     * - `options.encoding` Default: 'utf8'
     * - `options.mode` Default: 0o666
     * - `options.flag` See [support of file system flags](https://nodejs.org/api/fs.html#file-system-flags). Default: 'w'.
     *
     * @category Read and write Sync
     */
    writeJSONSync(
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
    ): void;

    /**
     * Similar to .writeFile(), except that if the parent directory does not exist, it
     * will be created automatically.
     *
     * @category Read and write
     */
    outputFile(
        data: any,
        options?:
            | {
                  encoding?: string | null | undefined;
                  /**
                   * Only affects the newly created file. See `fs.open()` for more
                   * details.
                   */
                  mode?: string | number | undefined;
                  flag?: string | number | undefined;
                  /**
                   * When provided the corresponding `AbortController` can be used to
                   * cancel an asynchronous action.
                   */
                  signal?: AbortSignal | undefined;
              }
            | string
            | null,
    ): Promise<void>;

    /**
     * Similar to .writeFileSync(), except that if the parent directory does not exist, it
     * will be created automatically.
     *
     * @category Read and write Sync
     */
    outputFileSync(
        data: any,
        options?:
            | {
                  encoding?: string | null | undefined;
                  /**
                   * Only affects the newly created file. See `fs.open()` for more
                   * details.
                   */
                  mode?: string | number | undefined;
                  flag?: string | number | undefined;
              }
            | string
            | null,
    ): void;

    /**
     * Similar to .writeJSON(), except that if the parent directory does not exist, it
     * will be created automatically.
     *
     * @category Read and write
     */
    outputJSON(
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
    ): Promise<void>;

    /**
     * Similar to .writeJSONSync(), except that if the parent directory does not exist, it
     * will be created automatically.
     *
     * @category Read and write Sync
     */
    outputJSONSync(
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
    ): void;

    /**
     * Execute the given function with the original content of the file as input, and the
     * returned string will become the new content of the file.
     *
     * @param fn can also return a `Promise<string>`
     * @param options If options is a string, then it specifies the encoding.
     * - `options.encoding` Default: 'utf8'
     *
     * @category Read and write
     */
    updateFileAsString(
        fn: (original: string) => string | Promise<string>,
        options?:
            | { encoding?: BufferEncoding | null | undefined }
            | BufferEncoding
            | null,
    ): Promise<void>;

    /**
     * Execute the given function with the original content of the file as input, and the
     * returned string will become the new content of the file.
     *
     * @param options If options is a string, then it specifies the encoding.
     * - `options.encoding` Default: 'utf8'
     *
     * @category Read and write Sync
     */
    updateFileAsStringSync(
        fn: (original: string) => string,
        options?:
            | { encoding?: BufferEncoding | null | undefined }
            | BufferEncoding
            | null,
    ): void;

    /**
     * Asynchronously update the json object of the file.
     *
     * @param fn accepts a object paresd from the JSON file, can return a new object or
     * undefined (in that case, original object is used) to overwrite the file. It can
     * also return a Promise that resolves to an object or undefined.
     * @param options If options is a string, then it specifies the encoding.
     * - `options.encoding` Default: 'utf8'
     *
     * @category Read and write
     */
    updateJSON(
        fn: (original: any) => any | Promise<any>,
        options?:
            | { encoding?: BufferEncoding | null | undefined }
            | BufferEncoding
            | null,
    ): Promise<void>;

    /**
     * Synchronously update the json object of the file.
     *
     * @param fn accepts a object paresd from the JSON file, can return a new object or
     * undefined (in that case, original object is used) to overwrite the file.
     * @param options If options is a string, then it specifies the encoding.
     * - `options.encoding` Default: 'utf8'
     *
     * @category Read and write Sync
     */
    updateJSONSync(
        fn: (original: any) => any,
        options?:
            | { encoding?: BufferEncoding | null | undefined }
            | BufferEncoding
            | null,
    ): void;

    /**
     * Asynchronously append data to a file, creating the file if it does not yet exist.
     *
     * @param data can be a string or a `Buffer`
     * @param options If options is a string, then it specifies the encoding.
     * - `options.encoding` Default: 'utf8'
     * - `options.mode` only affects the newly created file. See fs.open() for more
     * details. Default: 0o666
     * - `options.flag` See [support of file system flags](https://nodejs.org/api/fs.html#file-system-flags). Default: 'a'.
     *
     * @category Read and write
     */
    appendFile(
        data: string | Uint8Array,
        options?:
            | {
                  encoding?: string | null | undefined;
                  mode?: string | number | undefined;
                  flag?: string | number | undefined;
              }
            | BufferEncoding
            | null,
    ): Promise<void>;

    /**
     * Synchronously append data to a file, creating the file if it does not yet exist.
     *
     * @param data can be a string or a `Buffer`
     * @param options If options is a string, then it specifies the encoding.
     * - `options.encoding` Default: 'utf8'
     * - `options.mode` only affects the newly created file. See fs.open() for more
     * details. Default: 0o666
     * - `options.flag` See [support of file system flags](https://nodejs.org/api/fs.html#file-system-flags). Default: 'a'.
     *
     * @category Read and write Sync
     */
    appendFileSync(
        data: string | Uint8Array,
        options?:
            | {
                  encoding?: string | null | undefined;
                  mode?: string | number | undefined;
                  flag?: string | number | undefined;
              }
            | BufferEncoding
            | null,
    ): void;

    /**
     * Roughly same as `fs.createReadStream()`, but no need to specify the path.
     *
     * See [fs.createReadStream(path[, options])](https://nodejs.org/api/fs.html#fscreatereadstreampath-options)
     * for full document.
     *
     * @category Read and write
     */
    createReadStream(
        options?:
            | string
            | {
                  flags?: string | number | undefined;
                  encoding?: string | undefined;
                  fd?: number | nodefs.promises.FileHandle | undefined;
                  mode?: string | number | undefined;
                  autoClose?: boolean | undefined;
                  emitClose?: boolean | undefined;
                  start?: number | undefined;
                  end?: number | undefined;
                  highWaterMark?: number | undefined;
                  fs?: any;
              },
    ): nodefs.ReadStream;

    /**
     * Roughly same as `fs.createWriteStream()`, but no need to specify the path.
     *
     * See [fs.createWriteStream(path[, options])](https://nodejs.org/api/fs.html#fscreatewritestreampath-options)
     * for full document.
     *
     * @category Read and write
     */
    createWriteStream(
        options?:
            | string
            | {
                  flags?: string | number | undefined;
                  encoding?: string | undefined;
                  fd?: number | nodefs.promises.FileHandle | undefined;
                  mode?: string | number | undefined;
                  autoClose?: boolean | undefined;
                  emitClose?: boolean | undefined;
                  start?: number | undefined;
                  fs?: any;
              },
    ): nodefs.WriteStream;

    /**
     * Roughly same as `fs.promise.open()`, but no need to specify the path.
     *
     * Opens a [FileHandle](https://nodejs.org/api/fs.html#class-filehandle).
     *
     * Refer to the POSIX [open(2)](http://man7.org/linux/man-pages/man2/open.2.html)
     * documentation for more detail.
     *
     * Some characters (`< > : " / \ | ? *`) are reserved under Windows as documented by
     * [Naming Files, Paths, and Namespaces](https://docs.microsoft.com/en-us/windows/desktop/FileIO/naming-a-file).
     * Under NTFS, if the filename contains a colon, Node.js will open a file system
     * stream, as described by [this MSDN page](https://docs.microsoft.com/en-us/windows/desktop/FileIO/using-streams).
     *
     * @category Read and write
     */
    open(
        flags?: string | number,
        mode?: string | number,
    ): Promise<nodefs.promises.FileHandle>;

    /**
     * Roughly same as `fs.openSync()`, but no need to specify the path.
     *
     * Returns an integer representing the file descriptor.
     *
     * For detailed information, see the documentation [fs.open()](https://nodejs.org/api/fs.html#fsopenpath-flags-mode-callback).
     *
     * @category Read and write Sync
     */
    openSync(flags?: string | number, mode?: string | number): number;

    /**
     * Similar to fs.promises.cp(), except that the default value of `options.recursive`
     * is true.
     *
     * Asynchronously copies a file or directory to dest, including subdirectories and
     * files when copying a directory.
     *
     * @param dest destination path to copy to.
     * @param options
     * - `options.force`: overwrite existing file or directory. The copy operation will
     * ignore errors if you set this to false and the destination exists. Use the
     * `errorOnExist` option to change this behavior. Default: true.
     * - `options.dereference`: dereference symlinks. Default: false.
     * - `options.errorOnExist`: when force is false, and the destination exists, throw an
     * error. Default: false.
     * - `options.filter`: Function to filter copied files/directories. Return true to copy
     * the item, false to ignore it. Can also return a Promise that resolves to true or
     * false. Default: undefined.
     * - `options.preserveTimestamps`: When true timestamps from src will be preserved.
     * Default: false.
     * - `options.recursive`: copy directories recursively. Default: true
     * - `options.verbatimSymlinks`: When true, path resolution for symlinks will be
     * skipped. Default: false
     * @returns destination path wrapped in Promise<PathNice>
     *
     * @category Copy, move and remove
     */
    copy(
        dest: string | PathNice,
        options?: {
            force?: boolean | null | undefined;
            dereference?: boolean | null | undefined;
            errorOnExist?: boolean | null | undefined;
            filter?:
                | ((src: string, dest: string) => boolean | Promise<boolean>)
                | null
                | undefined;
            preserveTimestamps?: boolean | null | undefined;
            recursive?: boolean | null | undefined;
            verbatimSymlinks?: boolean | null | undefined;
        },
    ): Promise<PathNice>;

    /**
     * Similar to fs.cpSync(), except that the default value of `options.recursive`
     * is true.
     *
     * Synchronously copies a file or directory to dest, including subdirectories and
     * files when copying a directory.
     *
     * @param dest destination path to copy to.
     * @param options
     * - `options.force`: overwrite existing file or directory. The copy operation will
     * ignore errors if you set this to false and the destination exists. Use the
     * `errorOnExist` option to change this behavior. Default: true.
     * - `options.dereference`: dereference symlinks. Default: false.
     * - `options.errorOnExist`: when force is false, and the destination exists, throw an
     * error. Default: false.
     * - `options.filter`: Function to filter copied files/directories. Return true to copy
     * the item, false to ignore it. Default: undefined.
     * - `options.preserveTimestamps`: When true timestamps from src will be preserved.
     * Default: false.
     * - `options.recursive`: copy directories recursively. Default: true
     * - `options.verbatimSymlinks`: When true, path resolution for symlinks will be
     * skipped. Default: false
     * @returns destination path wrapped in PathNice
     *
     * @category Copy, move and remove Sync
     */
    copySync(
        dest: string | PathNice,
        options?: {
            force?: boolean | null | undefined;
            dereference?: boolean | null | undefined;
            errorOnExist?: boolean | null | undefined;
            filter?: ((src: string, dest: string) => boolean) | null | undefined;
            preserveTimestamps?: boolean | null | undefined;
            recursive?: boolean | null | undefined;
            verbatimSymlinks?: boolean | null | undefined;
        },
    ): PathNice;

    /**
     * Asynchronously moves a file or directory to dest, even across devices,
     * including subdirectories and files when moving a directory.
     *
     * @param dest destination to move to. Note: When src is a file, dest must be a file
     * and when src is a directory, dest must be a directory.
     * @param options options.overwrite: overwrite existing file or directory. Default: false
     * @returns destination path wrapped in Promise<PathNice>
     *
     * @category Copy, move and remove
     */
    move(
        dest: string | PathNice,
        options?: {
            overwrite?: boolean | null | undefined;
        },
    ): Promise<PathNice>;

    /**
     * Synchronously moves a file or directory to dest, even across devices,
     * including subdirectories and files when moving a directory.
     *
     * @param dest destination to move to. Note: When src is a file, dest must be a file
     * and when src is a directory, dest must be a directory.
     * @param options options.overwrite: overwrite existing file or directory. Default: false
     * @returns destination path wrapped in PathNice
     *
     * @category Copy, move and remove Sync
     */
    moveSync(
        dest: string | PathNice,
        options?: {
            overwrite?: boolean | null | undefined;
        },
    ): PathNice;

    /**
     * Asynchronous rename(2) - Change the name or location of a file or directory.
     *
     * @param newPath A path to a file.
     * @returns destination path wrapped in Promise<PathNice>
     *
     * @category Copy, move and remove
     */
    rename(newPath: string | PathNice): Promise<PathNice>;

    /**
     * Synchronous rename(2) - Change the name or location of a file or directory.
     *
     * @param newPath A path to a file.
     * @returns destination path wrapped in PathNice
     *
     * @category Copy, move and remove Sync
     */
    renameSync(newPath: string | PathNice): PathNice;

    /**
     * Asynchronously removes a file or directory. The directory can have contents. If the
     * path does not exist, silently does nothing.
     * @returns original path wrapped in Promise<PathNice>
     *
     * @category Copy, move and remove
     */
    remove(): Promise<PathNice>;

    /**
     * Synchronously removes a file or directory. The directory can have contents. If the
     * path does not exist, silently does nothing.
     * @returns original path wrapped in Promise<PathNice>
     *
     * @category Copy, move and remove Sync
     */
    removeSync(): PathNice;

    /**
     * Asynchronously removes a file or directory. The directory can have contents. If the
     * path does not exist, silently does nothing.
     * @returns original path wrapped in Promise<PathNice>
     *
     * @category Copy, move and remove
     */
    delete(): Promise<PathNice>;

    /**
     * Synchronously removes a file or directory. The directory can have contents. If the
     * path does not exist, silently does nothing.
     * @returns original path wrapped in Promise<PathNice>
     *
     * @category Copy, move and remove Sync
     */
    deleteSync(): PathNice;

    /**
     * Asynchronously ensures that a directory is empty. Deletes directory contents if the
     * directory is not empty. If the directory does not exist, it is created. The
     * directory itself is not deleted.
     *
     * @returns original path wrapped in Promise<PathNice>
     *
     * @category Copy, move and remove
     * @category Ensure
     */
    emptyDir(): Promise<PathNice>;

    /**
     * Synchronously ensures that a directory is empty. Deletes directory contents if the
     * directory is not empty. If the directory does not exist, it is created. The
     * directory itself is not deleted.
     *
     * @returns original path wrapped in PathNice
     *
     * @category Copy, move and remove Sync
     * @category Ensure Sync
     */
    emptyDirSync(): PathNice;

    /**
     * Asynchronously ensures that the directory exists. If the directory structure does
     * not exist, it is created.
     *
     * @param options options.mode: mode of the newly created directory. Default: `0o777`
     * @returns original path wrapped in Promise<PathNice>
     *
     * @category Ensure
     */
    ensureDir(options?: { mode?: number | string | undefined }): Promise<PathNice>;

    /**
     * Asynchronously ensures that the directory exists. If the directory structure does
     * not exist, it is created.
     *
     * @param options options.mode: mode of the newly created directory. Default: `0o777`
     * @returns original path wrapped in PathNice
     *
     * @category Ensure Sync
     */
    ensureDirSync(options?: { mode?: number | string | undefined }): PathNice;

    /**
     * Asynchronously ensures that the file exists. If the file that is requested to be
     * created is in directories that do not exist, these directories are created. If the
     * file already exists, it is NOT MODIFIED.
     *
     * @param options
     * - options.fileMode: mode of the newly created file. Default: `0o777`
     * - options.dirMode: mode of the newly created directory. Default: `0o777`
     * @returns original path wrapped in Promise<PathNice>
     *
     * @category Ensure
     */
    ensureFile(options?: {
        fileMode?: number | string | undefined;
        dirMode?: number | string | undefined;
    }): Promise<PathNice>;

    /**
     * Synchronously ensures that the file exists. If the file that is requested to be
     * created is in directories that do not exist, these directories are created. If the
     * file already exists, it is NOT MODIFIED.
     *
     * @param options
     * - options.fileMode: mode of the newly created file. Default: `0o777`
     * - options.dirMode: mode of the newly created directory. Default: `0o777`
     * @returns original path wrapped in PathNice
     *
     * @category Ensure Sync
     */
    ensureFileSync(options?: {
        fileMode?: number | string | undefined;
        dirMode?: number | string | undefined;
    }): PathNice;

    /**
     * Note: It is recommended to use `isFile()`, `isDir()`, etc to indicate the type of
     * file you want to check.
     *
     * Asynchronously check whether the path exists.
     *
     * @category Is ... ?
     */
    exists(): Promise<boolean>;

    /**
     * Note: It is recommended to use `isFile()`, `isDir()`, etc to indicate the type of
     * file you want to check.
     *
     * Synchronously check whether the path exists.
     *
     * @category Is ... ? Sync
     */
    existsSync(): boolean;

    /**
     * Asynchronously check whether the path exists and is an empty directory.
     *
     * Note: if the path is inaccessible or not a directory, it also returns false.
     *
     * @param followlink when true, if the path is a link, follows it. Default: false
     *
     * @category Is ... ?
     */
    isEmptyDir(followlink?: boolean): Promise<boolean>;

    /**
     * Synchronously check whether the path exists and is an empty directory.
     *
     * Note: if the path is inaccessible or not a directory, it also returns false.
     *
     * @param followlink when true, if the path is a link, follows it. Default: false
     *
     * @category Is ... ? Sync
     */
    isEmptyDirSync(followlink?: boolean): boolean;

    /**
     * Asynchronously check whether the path exists and is a directory.
     *
     * @param followlink when true, if the path is a link, follows it. Default: false
     *
     * @category Is ... ?
     */
    isDir(followlink?: boolean): Promise<boolean>;

    /**
     * Synchronously check whether the path exists and is a directory.
     *
     * @param followlink when true, if the path is a link, follows it. Default: false
     *
     * @category Is ... ? Sync
     */
    isDirSync(followlink?: boolean): boolean;

    /**
     * Asynchronously check whether the path exists and is a file.
     *
     * @param followlink when true, if the path is a link, follows it. Default: false
     *
     * @category Is ... ?
     */
    isFile(followlink?: boolean): Promise<boolean>;

    /**
     * Synchronously check whether the path exists and is a file.
     *
     * @param followlink when true, if the path is a link, follows it. Default: false
     *
     * @category Is ... ? Sync
     */
    isFileSync(followlink?: boolean): boolean;

    /**
     * Asynchronously check whether the path exists and is a symbolic link.
     *
     * @category Is ... ?
     */
    isSymbolicLink(): Promise<boolean>;

    /**
     * Synchronously check whether the path exists and is a symbolic link.
     *
     * @category Is ... ? Sync
     */
    isSymbolicLinkSync(): boolean;

    /**
     * Roughly same as `fs.promises.readdir()`, but no need to specify the path.
     *
     * Reads the contents of a directory.
     *
     * The optional options argument can be a string specifying an encoding, or an object
     * with an encoding property specifying the character encoding to use for the
     * filenames. If the encoding is set to 'buffer', the filenames returned will be
     * passed as <Buffer> objects.
     *
     * If options.withFileTypes is set to true, the resolved array will contain
     * <fs.Dirent> objects.
     *
     * @param options a string to specify the encoding, or an object:
     * - `options.encoding` Default: 'utf8'
     * - `options.withFileTypes` Default: false
     *
     * @example
     * ```ts
     * try {
     *   const files = await path('path/to/dir').readdir();
     *   for (const file of files)
     *     console.log(file);
     * } catch (err) {
     *   console.error(err);
     * }
     * ```
     *
     * @category List directory contents
     */
    readdir(
        options?:
            | {
                  encoding?: BufferEncoding | null | undefined;
                  withFileTypes?: false | undefined;
              }
            | BufferEncoding
            | null,
    ): Promise<string[]>;
    readdir(
        options:
            | {
                  encoding: 'buffer';
                  withFileTypes?: false | undefined;
              }
            | 'buffer',
    ): Promise<Buffer[]>;
    readdir(
        options?:
            | {
                  encoding: string;
                  withFileTypes?: false | undefined;
              }
            | string,
    ): Promise<string[] | Buffer[]>;
    readdir(options: {
        encoding?: BufferEncoding | null | undefined;
        withFileTypes: true;
    }): Promise<nodefs.Dirent[]>;

    /**
     * Roughly same as `fs.readdirSync()`, but no need to specify the path.
     *
     * Reads the contents of a directory.
     *
     * The optional options argument can be a string specifying an encoding, or an object
     * with an encoding property specifying the character encoding to use for the
     * filenames. If the encoding is set to 'buffer', the filenames returned will be
     * passed as <Buffer> objects.
     *
     * If options.withFileTypes is set to true, the resolved array will contain
     * <fs.Dirent> objects.
     *
     * @param options a string to specify the encoding, or an object:
     * - `options.encoding` Default: 'utf8'
     * - `options.withFileTypes` Default: false
     *
     * @example
     * ```ts
     * try {
     *   const files = path('path/to/dir').readdirSync();
     *   for (const file of files)
     *     console.log(file);
     * } catch (err) {
     *   console.error(err);
     * }
     * ```
     *
     * @category List directory contents Sync
     */
    readdirSync(
        options?:
            | {
                  encoding?: BufferEncoding | null | undefined;
                  withFileTypes?: false | undefined;
              }
            | BufferEncoding
            | null,
    ): string[];
    readdirSync(
        options:
            | {
                  encoding: 'buffer';
                  withFileTypes?: false | undefined;
              }
            | 'buffer',
    ): Buffer[];
    readdirSync(
        options?:
            | {
                  encoding: string;
                  withFileTypes?: false | undefined;
              }
            | string,
    ): string[] | Buffer[];
    readdirSync(options: {
        encoding?: BufferEncoding | null | undefined;
        withFileTypes: true;
    }): nodefs.Dirent[];

    /**
     * Asynchronously list all directories and files under the folder, return a Promise
     * that resolves to an object `{ dirs: PathNiceArr; files: PathNiceArr }`.
     *
     * - `dirs`: subdirectories, not including the current folder
     * - `files`: files and others (e.g. device, FIFO, socket, etc). If `followLinks` is
     * false, it also contains links.
     *
     * The paths wrapped in the returned `PathNice` object are all absolute paths, so
     * they can be used directly for `.readFile()`, `.writeFile()`, `.copy()`, `.move()`,
     * etc. Use `.toRelative(dir)` to get the relative path.
     *
     * @param recursive whether to list file recursively. Default: false
     * @param followLinks whether to follow links under the folder. Default: false
     *
     * @example
     * ```ts
     * const { dirs, files } = await path('./').ls();
     *
     * await Promise.all(
     *   files
     *     .filter(f => f.ext() === '.json')
     *     .map(async f => {
     *       await f.updateJSON(json => { json.timestamp = Date.now() });
     *       await f.copy(f.dirname('../backup'));
     *     })
     * );
     *
     * await dirs.remove();
     * ```
     *
     * @category List directory contents
     */
    ls(
        recursive?: boolean,
        followLinks?: boolean,
    ): Promise<{ dirs: PathNiceArr; files: PathNiceArr }>;

    /**
     * Synchronously List all directories and files under the folder, return an object
     * `{ dirs: PathNiceArr; files: PathNiceArr }`.
     *
     * - `dirs`: subdirectories, not including the current folder
     * - `files`: files and others (e.g. device, FIFO, socket, etc). If `followLinks` is
     * false, it also contains links.
     *
     * The paths wrapped in the returned `PathNice` object are all absolute paths, so
     * they can be used directly for `.readFile()`, `.writeFile()`, `.copy()`, `.move()`,
     * etc. Use `.toRelative(dir)` to get the relative path.
     *
     * @param recursive whether to list file recursively. Default: false
     * @param followLinks whether to follow links under the folder. Default: false
     *
     * @example
     * ```ts
     * const { dirs, files } = path('./').lsSync();
     *
     * await Promise.all(
     *   files
     *     .filter(f => f.ext() === '.json')
     *     .map(async f => {
     *       await f.updateJSON(json => { json.timestamp = Date.now() });
     *       await f.copy(f.dirname('../backup'));
     *     })
     * );
     *
     * await dirs.remove();
     * ```
     *
     * @category List directory contents Sync
     */
    lsSync(
        recursive?: boolean,
        followLinks?: boolean,
    ): { dirs: PathNiceArr; files: PathNiceArr };

    /**
     * Note: Using `.watch()` or `.watchWithChokidar()` is more efficient than this method.
     *
     * Roughly same as `fs.watchFile()`, but no need to specify the path.
     *
     * Refer to https://nodejs.org/api/fs.html#fswatchfilefilename-options-listener
     *
     * @category Watch
     */
    watchFile(
        options:
            | (nodefs.WatchFileOptions & {
                  bigint?: false | undefined;
              })
            | undefined,
        listener: (curr: nodefs.Stats, prev: nodefs.Stats) => void,
    ): nodefs.StatWatcher;
    watchFile(
        options:
            | (nodefs.WatchFileOptions & {
                  bigint: true;
              })
            | undefined,
        listener: (curr: nodefs.BigIntStats, prev: nodefs.BigIntStats) => void,
    ): nodefs.StatWatcher;
    watchFile(
        listener: (curr: nodefs.Stats, prev: nodefs.Stats) => void,
    ): nodefs.StatWatcher;

    /**
     * Roughly same as `fs.watchFile()`, but no need to specify the path.
     *
     * Stop watching for changes on filename. If listener is specified, only that
     * particular listener is removed. Otherwise, all listeners are removed, effectively
     * stopping watching of filename.
     *
     * Calling .unwatchFile() with a filename that is not being watched is a no-op,
     * not an error.
     *
     * @category Watch
     */
    unwatchFile(listener?: (curr: nodefs.Stats, prev: nodefs.Stats) => void): void;

    /**
     * Watch for changes on the path, which can be either a file or a directory.
     *
     * The second argument is optional. If `options` is provided as a string, it
     * specifies the `encoding`. Otherwise `options` should be passed as an object.
     *
     * The listener callback gets two arguments `(eventType, filename)`. `eventType` is
     * either `'rename'` or `'change'`, and `filename` is the name of the file
     * which triggered the event.
     *
     * On most platforms, `'rename'` is emitted whenever a filename appears or
     * disappears in the directory.
     *
     * The listener callback is attached to the `'change'` event fired by `fs.FSWatcher`,
     * but it is not the same thing as the `'change'` value of`eventType`.
     *
     * If a `signal` is passed, aborting the corresponding AbortController will close
     * the returned `fs.FSWatcher`.
     *
     * @category Watch
     */
    watch(
        options:
            | (nodefs.WatchOptions & {
                  encoding: 'buffer';
              })
            | 'buffer',
        listener?: nodefs.WatchListener<Buffer>,
    ): nodefs.FSWatcher;
    watch(
        options?: nodefs.WatchOptions | BufferEncoding | null,
        listener?: nodefs.WatchListener<string>,
    ): nodefs.FSWatcher;
    watch(
        options: nodefs.WatchOptions | string,
        listener?: nodefs.WatchListener<string | Buffer>,
    ): nodefs.FSWatcher;
    watch(listener?: nodefs.WatchListener<string>): nodefs.FSWatcher;

    /**
     * Watch file changes with chokidar for a more friendly and powerful API.
     *
     * This method is equivalent to calling `chokidar.watch(path, options)`, where `path`
     * is populated with the current path and the `options` accepted by this method are
     * passed to it.
     *
     * See https://github.com/paulmillr/chokidar#api for full documents.
     *
     * ⚠️ Note: chokidar can only use the original `node:fs` module. Calling this method
     * will result in an error if you are using a path-nice generated via `bindFS()` that
     * is bound to another fs implementation. If you are sure your operation makes sense,
     * enable `options.forceEvenDifferentFS` to ignore this error.
     *
     * @category Watch
     */
    watchWithChokidar(
        options?: chokidar.WatchOptions & { forceEvenDifferentFS?: boolean },
    ): chokidar.FSWatcher;

    /**
     * Asynchronously gets the uid and gid of the file owner.
     *
     * @category File info
     */
    fileOwner(): Promise<{ uid: number; gid: number }>;

    /**
     * Synchronously gets the uid and gid of the file owner.
     *
     * @category File info Sync
     */
    fileOwnerSync(): { uid: number; gid: number };

    /**
     * Asynchronously gets the file mode.
     *
     * @category File info
     */
    fileMode(): Promise<number>;

    /**
     * Synchronously gets the file mode.
     *
     * @category File info Sync
     */
    fileModeSync(): number;

    /**
     * Asynchronously gets the file size.
     *
     * @category File info
     */
    fileSize(): Promise<{
        B: number;
        KB: number;
        MB: number;
        GB: number;
        TB: number;
        PB: number;
    }>;

    /**
     * Synchronously gets the file size.
     *
     * @category File info Sync
     */
    fileSizeSync(): {
        B: number;
        KB: number;
        MB: number;
        GB: number;
        TB: number;
        PB: number;
    };

    /**
     * Asynchronous lstat(2) - Get file status. Does not dereference symbolic links.
     *
     * @category File info
     */
    lstat(
        options?: nodefs.StatOptions & { bigint?: false | undefined },
    ): Promise<nodefs.Stats>;
    lstat(options: nodefs.StatOptions & { bigint: true }): Promise<nodefs.BigIntStats>;
    lstat(options?: nodefs.StatOptions): Promise<nodefs.Stats | nodefs.BigIntStats>;

    /**
     * Synchronous lstat(2) - Get file status. Does not dereference symbolic links.
     *
     * @category File info Sync
     */
    lstatSync(options?: undefined): nodefs.Stats;
    lstatSync(
        options?: nodefs.StatSyncOptions & {
            bigint?: false | undefined;
            throwIfNoEntry: false;
        },
    ): nodefs.Stats | undefined;
    lstatSync(
        options?: nodefs.StatSyncOptions & {
            bigint: true;
            throwIfNoEntry: false;
        },
    ): nodefs.BigIntStats | undefined;
    lstatSync(
        options?: nodefs.StatSyncOptions & {
            bigint?: false | undefined;
        },
    ): nodefs.Stats;
    lstatSync(
        options?: nodefs.StatSyncOptions & {
            bigint: true;
        },
    ): nodefs.BigIntStats;
    lstatSync(
        options?: nodefs.StatSyncOptions & {
            bigint: boolean;
            throwIfNoEntry?: false | undefined;
        },
    ): nodefs.Stats | nodefs.BigIntStats;
    lstatSync(
        options?: nodefs.StatSyncOptions,
    ): nodefs.Stats | nodefs.BigIntStats | undefined;

    /**
     * Asynchronous stat(2) - Get file status.
     *
     * @category File info
     */
    stat(
        opts?: nodefs.StatOptions & { bigint?: false | undefined },
    ): Promise<nodefs.Stats>;
    stat(opts: nodefs.StatOptions & { bigint: true }): Promise<nodefs.BigIntStats>;
    stat(opts?: nodefs.StatOptions): Promise<nodefs.Stats | nodefs.BigIntStats>;

    /**
     * Synchronous lstat(2) - Get file status. Does not dereference symbolic links.
     *
     * @category File info Sync
     */
    statSync(options?: undefined): nodefs.Stats;
    statSync(
        options?: nodefs.StatSyncOptions & {
            bigint?: false | undefined;
            throwIfNoEntry: false;
        },
    ): nodefs.Stats | undefined;
    statSync(
        options?: nodefs.StatSyncOptions & {
            bigint: true;
            throwIfNoEntry: false;
        },
    ): nodefs.BigIntStats | undefined;
    statSync(
        options?: nodefs.StatSyncOptions & {
            bigint?: false | undefined;
        },
    ): nodefs.Stats;
    statSync(
        options?: nodefs.StatSyncOptions & {
            bigint: true;
        },
    ): nodefs.BigIntStats;
    statSync(
        options?: nodefs.StatSyncOptions & {
            bigint: boolean;
            throwIfNoEntry?: false | undefined;
        },
    ): nodefs.Stats | nodefs.BigIntStats;
    statSync(
        options?: nodefs.StatSyncOptions,
    ): nodefs.Stats | nodefs.BigIntStats | undefined;

    /**
     * Asynchronous chmod(2) - Change permissions of a file.
     * @param mode A file mode. If a string is passed, it is parsed as an octal integer.
     *
     * @category File info
     */
    chmod(mode: string | number): Promise<void>;

    /**
     * Synchronous chmod(2) - Change permissions of a file.
     * @param mode A file mode. If a string is passed, it is parsed as an octal integer.
     *
     * @category File info Sync
     */
    chmodSync(mode: string | number): void;

    /**
     * Asynchronous lchown(2) - Change ownership of a file. Does not dereference symbolic links.
     *
     * @category File info
     */
    lchown(uid: number, gid: number): Promise<void>;

    /**
     * Synchronous lchown(2) - Change ownership of a file. Does not dereference symbolic links.
     *
     * @category File info Sync
     */
    lchownSync(uid: number, gid: number): void;

    /**
     * Asynchronous chown(2) - Change ownership of a file.
     *
     * @category File info
     */
    chown(uid: number, gid: number): Promise<void>;

    /**
     * Synchronous chown(2) - Change ownership of a file.
     *
     * @category File info Sync
     */
    chownSync(uid: number, gid: number): void;
}

export interface PathNiceArr extends Array<PathNice> {
    /**
     * If set, the files and directories in the array will maintain structure relative to
     * `base` when copying / moving.
     */
    base?: PathNice;

    /**
     * Asynchronously copies files and directories in the array into dest directory.
     *
     * If `PathNiceArr.base` is set, the files and directories in the array will maintain
     * structure relative to it when copying.
     *
     * @param destDir destination directory to copy into.
     * @param options
     * - `options.force`: overwrite existing file or directory. The copy operation will
     * ignore errors if you set this to false and the destination exists. Use the
     * `errorOnExist` option to change this behavior. Default: true.
     * - `options.dereference`: dereference symlinks. Default: false.
     * - `options.errorOnExist`: when force is false, and the destination exists, throw an
     * error. Default: false.
     * - `options.filter`: Function to filter copied files/directories. Return true to copy
     * the item, false to ignore it. Can also return a Promise that resolves to true or
     * false. Default: undefined.
     * - `options.preserveTimestamps`: When true timestamps from src will be preserved.
     * Default: false.
     * - `options.recursive`: copy directories recursively. Default: true
     * - `options.verbatimSymlinks`: When true, path resolution for symlinks will be
     * skipped. Default: false
     * @returns destination path of each copied item wrapped in Promise<PathNiceArr>
     *
     * @category Copy, move and remove
     */
    copyToDir(
        destDir: string | PathNice,
        options?: {
            force?: boolean | null | undefined;
            dereference?: boolean | null | undefined;
            errorOnExist?: boolean | null | undefined;
            filter?:
                | ((src: string, dest: string) => boolean | Promise<boolean>)
                | null
                | undefined;
            preserveTimestamps?: boolean | null | undefined;
            recursive?: boolean | null | undefined;
            verbatimSymlinks?: boolean | null | undefined;
        },
    ): Promise<PathNiceArr>;

    /**
     * Synchronously copies files and directories in the array into dest directory.
     *
     * If `PathNiceArr.base` is set, the files and directories in the array will maintain
     * structure relative to it when copying.
     *
     * @param destDir destination directory to copy into.
     * @param options
     * - `options.force`: overwrite existing file or directory. The copy operation will
     * ignore errors if you set this to false and the destination exists. Use the
     * `errorOnExist` option to change this behavior. Default: true.
     * - `options.dereference`: dereference symlinks. Default: false.
     * - `options.errorOnExist`: when force is false, and the destination exists, throw an
     * error. Default: false.
     * - `options.filter`: Function to filter copied files/directories. Return true to copy
     * the item, false to ignore it. Default: undefined.
     * - `options.preserveTimestamps`: When true timestamps from src will be preserved.
     * Default: false.
     * - `options.recursive`: copy directories recursively. Default: true
     * - `options.verbatimSymlinks`: When true, path resolution for symlinks will be
     * skipped. Default: false
     * @returns destination path of each copied item wrapped in Promise<PathNiceArr>
     *
     * @category Copy, move and remove Sync
     */
    copyToDirSync(
        destDir: string | PathNice,
        options?: {
            force?: boolean | null | undefined;
            dereference?: boolean | null | undefined;
            errorOnExist?: boolean | null | undefined;
            filter?: ((src: string, dest: string) => boolean) | null | undefined;
            preserveTimestamps?: boolean | null | undefined;
            recursive?: boolean | null | undefined;
            verbatimSymlinks?: boolean | null | undefined;
        },
    ): PathNiceArr;

    /**
     * Asynchronously moves files and directories in the array into dest directory, even
     * across devices, including subdirectories and files when moving a directory.
     *
     * If `PathNiceArr.base` is set, the files and directories in the array will maintain
     * structure relative to it when moving.
     *
     * @param destDir destination to move to. Note: When src is a file, dest must be a file
     * and when src is a directory, dest must be a directory.
     * @param options options.overwrite: overwrite existing file or directory. Default: false
     * @returns destination path of each moved item wrapped in Promise<PathNiceArr>
     *
     * @category Copy, move and remove
     */
    moveToDir(
        destDir: string | PathNice,
        options?: {
            overwrite?: boolean | null | undefined;
        },
    ): Promise<PathNiceArr>;

    /**
     * Synchronously moves files and directories in the array into dest directory, even
     * across devices, including subdirectories and files when moving a directory.
     *
     * If `PathNiceArr.base` is set, the files and directories in the array will maintain
     * structure relative to it when moving.
     *
     * @param destDir destination to move to. Note: When src is a file, dest must be a file
     * and when src is a directory, dest must be a directory.
     * @param options options.overwrite: overwrite existing file or directory. Default: false
     * @returns destination path of each moved item wrapped in Promise<PathNiceArr>
     *
     * @category Copy, move and remove Sync
     */
    moveToDirSync(
        destDir: string | PathNice,
        options?: {
            overwrite?: boolean | null | undefined;
        },
    ): Promise<PathNiceArr>;

    /**
     * Asynchronously removes files and directories in the array. The directories can have
     * contents. If one of the paths does not exist, silently does nothing for it.
     *
     * @returns original paths wrapped in Promise<PathNiceArr>
     *
     * @category Copy, move and remove
     */
    remove(): Promise<PathNiceArr>;

    /**
     * Synchronously removes files and directories in the array. The directory can have
     * contents. If one of the paths does not exist, silently does nothing for it.
     *
     * @returns original paths wrapped in Promise<PathNiceArr>
     *
     * @category Copy, move and remove Sync
     */
    removeSync(): PathNiceArr;

    /**
     * Watch file changes with chokidar for a more friendly and powerful API.
     *
     * This method is equivalent to calling `chokidar.watch(paths, options)`, where `paths`
     * is populated with the current path array and the `options` accepted by this method are
     * passed to it.
     *
     * See https://github.com/paulmillr/chokidar#api for full documents.
     *
     * ⚠️ Note: chokidar can only use the original `node:fs` module. Calling this method
     * will result in an error if you are using a path-nice generated via `bindFS()` that
     * is bound to another fs implementation. If you are sure your operation makes sense,
     * enable `options.forceEvenDifferentFS` to ignore this error.
     *
     * @category Watch
     */
    watchWithChokidar(
        options?: chokidar.WatchOptions & { forceEvenDifferentFS?: boolean },
    ): chokidar.FSWatcher;
}

export interface ParsedPathNice {
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

export interface PathNiceArr {
    /**
     * Combines two or more arrays.
     * This method returns a new array without modifying any existing arrays.
     * @param items Additional arrays and/or items to add to the end of the array.
     */
    concat(...items: ConcatArray<PathNice>[]): PathNiceArr;
    /**
     * Combines two or more arrays.
     * This method returns a new array without modifying any existing arrays.
     * @param items Additional arrays and/or items to add to the end of the array.
     */
    concat(...items: (PathNice | ConcatArray<PathNice>)[]): PathNiceArr;
    /**
     * Reverses the elements in an array in place.
     * This method mutates the array and returns a reference to the same array.
     */
    reverse(): PathNiceArr;
    /**
     * Returns a copy of a section of an array.
     * For both start and end, a negative index can be used to indicate an offset from the end of the array.
     * For example, -2 refers to the second to last element of the array.
     * @param start The beginning index of the specified portion of the array.
     * If start is undefined, then the slice begins at index 0.
     * @param end The end index of the specified portion of the array. This is exclusive of the element at the index 'end'.
     * If end is undefined, then the slice extends to the end of the array.
     */
    slice(start?: number, end?: number): PathNiceArr;
    /**
     * Removes elements from an array and, if necessary, inserts new elements in their place, returning the deleted elements.
     * @param start The zero-based location in the array from which to start removing elements.
     * @param deleteCount The number of elements to remove.
     * @returns An array containing the elements that were deleted.
     */
    splice(start: number, deleteCount?: number): PathNiceArr;
    /**
     * Removes elements from an array and, if necessary, inserts new elements in their place, returning the deleted elements.
     * @param start The zero-based location in the array from which to start removing elements.
     * @param deleteCount The number of elements to remove.
     * @param items Elements to insert into the array in place of the deleted elements.
     * @returns An array containing the elements that were deleted.
     */
    splice(start: number, deleteCount: number, ...items: PathNice[]): PathNiceArr;
    /**
     * Returns the elements of an array that meet the condition specified in a callback function.
     * @param predicate A function that accepts up to three arguments. The filter method calls the predicate function one time for each element in the array.
     * @param thisArg An object to which the this keyword can refer in the predicate function. If thisArg is omitted, undefined is used as the this value.
     */
    filter(
        predicate: (value: PathNice, index: number, array: PathNice[]) => unknown,
        thisArg?: any,
    ): PathNiceArr;
}