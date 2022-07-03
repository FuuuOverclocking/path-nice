"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParsedPathNice = exports.PathNice = void 0;
const nodepath = __importStar(require("path"));
const nodefs = __importStar(require("fs"));
const is_valid_buffer_encoding_js_1 = require("../common/utils/is-valid-buffer-encoding.js");
const copy_js_1 = require("../common/copy.js");
const move_js_1 = require("../common/move.js");
const remove_js_1 = require("../common/remove.js");
const empty_dir_js_1 = require("../common/empty-dir.js");
const ensure_js_1 = require("../common/ensure.js");
const lowpath = nodepath;
const regReplaceSep = lowpath.sep === '/' ? /\//g : /\\/g;
/**
 * A PathNice instance is a wrapper of the raw path string, so that the path
 * can be easily used to generate additional paths or manipulate files.
 */
class PathNice {
    constructor(path) {
        this.raw = path;
        Object.freeze(this);
    }
    _new(path) {
        return new PathNice(path);
    }
    static _from(path) {
        if (typeof path === 'string')
            return new PathNice(path);
        return path;
    }
    valueOf() {
        return this.raw;
    }
    separator(forceSep) {
        if (forceSep)
            return this._new(this.raw.replace(regReplaceSep, forceSep));
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
     *
     * @category Path related
     */
    join(...paths) {
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
     *
     * @category Path related
     */
    dirname(newDirname) {
        switch (typeof newDirname) {
            case 'undefined':
                return this._new(lowpath.dirname(this.raw));
            case 'string':
                return this._new(lowpath.join(newDirname, lowpath.basename(this.raw)));
            case 'object':
                return this._new(lowpath.join(newDirname.raw, lowpath.basename(this.raw)));
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
     *
     * @category Path related
     */
    get parent() {
        return this.dirname();
    }
    filename(newFilename) {
        switch (typeof newFilename) {
            case 'undefined':
                return lowpath.basename(lowpath.resolve(this.raw));
            case 'string':
                return this._new(lowpath.join(lowpath.dirname(this.raw), newFilename));
            case 'object':
                return this._new(lowpath.join(lowpath.dirname(this.raw), newFilename.raw));
        }
    }
    ext(newExt) {
        switch (typeof newExt) {
            case 'undefined':
                return lowpath.extname(this.raw);
            case 'string':
            case 'object': // typeof null === 'object'
                const obj = lowpath.parse(this.raw);
                const _ext = newExt || void 0;
                return this._new(lowpath.format({
                    dir: obj.dir,
                    name: obj.name,
                    ext: _ext,
                }));
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
     *
     * @category Path related
     */
    prefixFilename(prefix) {
        const obj = lowpath.parse(this.raw);
        return this._new(lowpath.format({
            dir: obj.dir,
            base: prefix + obj.base,
        }));
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
     *
     * @category Path related
     */
    postfixBeforeExt(postfix) {
        const obj = lowpath.parse(this.raw);
        return this._new(lowpath.format({
            dir: obj.dir,
            name: obj.name + postfix,
            ext: obj.ext,
        }));
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
     *
     * @category Path related
     */
    postfix(postfix) {
        const obj = lowpath.parse(this.raw);
        return this._new(lowpath.format({
            dir: obj.dir,
            name: obj.name,
            ext: obj.ext + postfix,
        }));
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
     *
     * @category Path related
     */
    isAbsolute() {
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
     *
     * @category Path related
     */
    toAbsolute(basePath) {
        if (this.isAbsolute())
            return this;
        if (!basePath)
            return this._new(lowpath.resolve(this.raw));
        basePath = PathNice._from(basePath);
        if (!basePath.isAbsolute()) {
            throw new Error(`[path-nice] PathNice.toAbsolute: "${basePath.raw}" is not an absolute path.`);
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
     *
     * @category Path related
     */
    toRelative(relativeTo) {
        if (typeof relativeTo === 'string') {
            return this._new(lowpath.relative(relativeTo, this.raw));
        }
        return this._new(lowpath.relative(relativeTo.raw, this.raw));
    }
    /**
     * Asynchronous realpath(3) - return the canonicalized absolute pathname.
     *
     * @category Path related
     */
    async realpath() {
        return this._new(await nodefs.promises.realpath(this.raw, 'utf8'));
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
     *
     * @category Path related
     */
    parse() {
        return new ParsedPathNice(lowpath.parse(this.raw));
    }
    readFile(options) {
        return nodefs.promises.readFile(this.raw, options);
    }
    /**
     * Similar to `.readFile()`, but guaranteed to return a string, using UTF-8 by default.
     *
     * Asynchronously reads the entire contents of a file. If an invalid buffer encoding
     * is specified, an error will be thrown.
     *
     * @category Read and write
     */
    readString(options) {
        var _a;
        if (!options) {
            options = { encoding: 'utf-8' };
            return nodefs.promises.readFile(this.raw, options);
        }
        if (typeof options === 'string' && (0, is_valid_buffer_encoding_js_1.isValidBufferEncoding)(options)) {
            options = { encoding: options };
            return nodefs.promises.readFile(this.raw, options);
        }
        if (options && options.encoding && (0, is_valid_buffer_encoding_js_1.isValidBufferEncoding)(options.encoding)) {
            (_a = options.encoding) !== null && _a !== void 0 ? _a : (options.encoding = 'utf-8');
            return nodefs.promises.readFile(this.raw, options);
        }
        const encoding = typeof options === 'string' ? options : options.encoding;
        throw new Error(`[path-nice] PathNice.readString: '${encoding}' is not a valid buffer encoding.`);
    }
    /**
     * Similar to `.readFile()`, but guaranteed to return a Buffer.
     *
     * Asynchronously reads the entire contents of a file.
     *
     * @category Read and write
     */
    readBuffer(options) {
        if (typeof options === 'string' ||
            (options && typeof options.encoding === 'string')) {
            throw new Error('[path-nice] PathNice.readBuffer: encoding should not be specified.');
        }
        return nodefs.promises.readFile(this.raw, options);
    }
    /**
     * Asynchronously reads a JSON file and then parses it into an object.
     *
     * @category Read and write
     */
    async readJSON(options) {
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
     *
     * @category Read and write
     */
    writeFile(data, options) {
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
     *
     * @category Read and write
     */
    writeJSON(data, options) {
        options = typeof options === 'string' ? { encoding: options } : options || {};
        const writeOptions = {};
        writeOptions.encoding = options.encoding || 'utf-8';
        writeOptions.mode = options.mode;
        writeOptions.flag = options.flag;
        let json = JSON.stringify(data, options.replacer, options.spaces || 4);
        if (options.EOL && options.EOL !== '\n') {
            json = json.replace(/\n/g, options.EOL);
        }
        return this.writeFile(json, writeOptions);
    }
    /**
     * Similar to .writeFile(), except that if the parent directory does not exist, it
     * will be created automatically.
     *
     * @category Read and write
     */
    async outputFile(data, options) {
        await this.parent.ensureDir();
        await nodefs.promises.writeFile(this.raw, data, options);
    }
    /**
     * Similar to .writeJSON(), except that if the parent directory does not exist, it
     * will be created automatically.
     *
     * @category Read and write
     */
    async outputJSON(data, options) {
        await this.parent.ensureDir();
        options = typeof options === 'string' ? { encoding: options } : options || {};
        const writeOptions = {};
        writeOptions.encoding = options.encoding || 'utf-8';
        writeOptions.mode = options.mode;
        writeOptions.flag = options.flag;
        let json = JSON.stringify(data, options.replacer, options.spaces || 4);
        if (options.EOL && options.EOL !== '\n') {
            json = json.replace(/\n/g, options.EOL);
        }
        await this.writeFile(json, writeOptions);
    }
    async updateString(arg0, arg1) {
        if (typeof arg0 === 'function') {
            const str = await this.readString();
            await this.writeFile(await arg0(str));
            return;
        }
        const str = await this.readString(arg0);
        await this.writeFile(await arg1(str), { encoding: arg0 });
    }
    async updateJSON(arg0, arg1) {
        if (typeof arg0 === 'function') {
            const obj = await this.readJSON();
            const result = await arg0(obj);
            await this.writeJSON(result === void 0 ? obj : result);
            return;
        }
        const obj = await this.readString(arg0);
        const result = await arg1(obj);
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
     *
     * @category Read and write
     */
    appendFile(data, options) {
        return nodefs.promises.appendFile(this.raw, data, options);
    }
    /**
     * Returns a new `ReadStream` object.
     *
     * @category Read and write
     */
    createReadStream(options) {
        return nodefs.createReadStream(this.raw, options);
    }
    /**
     * Returns a new `WriteStream` object.
     *
     * @category Read and write
     */
    createWriteStream(options) {
        return nodefs.createWriteStream(this.raw, options);
    }
    /**
     * Asynchronous open(2) - open and possibly create a file.
     *
     * @param flags See `support of file system `flags`. Default: 'r'.
     * @param mode A file mode. If a string is passed, it is parsed as an octal integer. If not
     * supplied, defaults to `0o666`.
     *
     * @category Read and write
     */
    open(flags, mode) {
        return nodefs.promises.open(flags, mode);
    }
    /**
     * Similar to fs.promises.cp(), except that the default value of `options.recursive`
     * is true.
     *
     * Asynchronously copies the entire directory structure from src to dest, including
     * subdirectories and files.
     *
     * @param dest destination path to copy to.
     * @param options
     * - options.force: overwrite existing file or directory. The copy operation will
     * ignore errors if you set this to false and the destination exists. Use the errorOnExist option to change this behavior. Default: true.
     * - options.dereference: dereference symlinks. Default: false.
     * - options.errorOnExist: when force is false, and the destination exists, throw an
     * error. Default: false.
     * - options.filter: Function to filter copied files/directories. Return true to copy
     * the item, false to ignore it. Can also return a Promise that resolves to true or false Default: undefined.
     * - options.preserveTimestamps: When true timestamps from src will be preserved.
     * Default: false.
     * - options.recursive: copy directories recursively. Default: true
     * - options.verbatimSymlinks: When true, path resolution for symlinks will be
     * skipped. Default: false
     *
     * @category Copy, move and remove
     */
    copyAs(dest, options) {
        return (0, copy_js_1.copy)(lowpath, nodefs, this.raw, typeof dest === 'string' ? dest : dest.raw, options);
    }
    /**
     * Similar to .copyAs(), except that files are copied ***into*** destination directory.
     *
     * Asynchronously copies the entire directory structure from src into dest directory,
     * including subdirectories and files.
     *
     * @param destDir destination directory to copy into.
     * @param options
     * - options.force: overwrite existing file or directory. The copy operation will
     * ignore errors if you set this to false and the destination exists. Use the errorOnExist option to change this behavior. Default: true.
     * - options.dereference: dereference symlinks. Default: false.
     * - options.errorOnExist: when force is false, and the destination exists, throw an
     * error. Default: false.
     * - options.filter: Function to filter copied files/directories. Return true to copy
     * the item, false to ignore it. Can also return a Promise that resolves to true or false Default: undefined.
     * - options.preserveTimestamps: When true timestamps from src will be preserved.
     * Default: false.
     * - options.recursive: copy directories recursively. Default: true
     * - options.verbatimSymlinks: When true, path resolution for symlinks will be
     * skipped. Default: false
     *
     * @category Copy, move and remove
     */
    copyToDir(destDir, options) {
        const destDirStr = typeof destDir === 'string' ? destDir : destDir.raw;
        return (0, copy_js_1.copy)(lowpath, nodefs, this.raw, lowpath.join(destDirStr, this.filename()), options);
    }
    /**
     * Moves a file or directory, even across devices.
     *
     * @param dest destination to move to. Note: When src is a file, dest must be a file
     * and when src is a directory, dest must be a directory.
     * @param options options.overwrite: overwrite existing file or directory. Default: false
     *
     * @category Copy, move and remove
     */
    moveAs(dest, options) {
        return (0, move_js_1.move)(lowpath, nodefs, this.raw, typeof dest === 'string' ? dest : dest.raw, options);
    }
    /**
     * Similar to .moveAs(), except that files are moved ***into*** destination directory.
     *
     * Moves a file or directory, even across devices.
     *
     * @param destDir destination directory to move into. Note: When src is a file, dest
     * must be a file and when src is a directory, dest must be a directory.
     * @param options options.overwrite: overwrite existing file or directory. Default: false
     *
     * @category Copy, move and remove
     */
    moveToDir(destDir, options) {
        const destDirStr = typeof destDir === 'string' ? destDir : destDir.raw;
        return (0, move_js_1.move)(lowpath, nodefs, this.raw, lowpath.join(destDirStr, this.filename()), options);
    }
    /**
     * Asynchronous rename(2) - Change the name or location of a file or directory.
     *
     * @param newPath A path to a file. If a URL is provided, it must use the `file:` protocol.
     * URL support is _experimental_.
     *
     * @category Copy, move and remove
     */
    rename(newPath) {
        return nodefs.promises.rename(this.raw, typeof newPath === 'string' ? newPath : newPath.raw);
    }
    /**
     * Removes a file or directory. The directory can have contents. If the path does
     * not exist, silently does nothing.
     *
     * @category Copy, move and remove
     */
    remove() {
        return (0, remove_js_1.remove)(nodefs, this.raw);
    }
    /**
     * Ensures that a directory is empty. Deletes directory contents if the directory is
     * not empty. If the directory does not exist, it is created. The directory itself is
     * not deleted.
     *
     * @category Copy, move and remove
     * @category Ensure
     */
    emptyDir() {
        return (0, empty_dir_js_1.emptyDir)(lowpath, nodefs, this.raw);
    }
    /**
     * Ensures that the directory exists. If the directory structure does not exist,
     * it is created.
     *
     * @param options options.mode: directory mode. Default: `0o777`
     *
     * @category Ensure
     */
    ensureDir(options) {
        return (0, ensure_js_1.ensureDir)(nodefs, this.raw, options);
    }
    /**
     * Ensures that the file exists. If the file that is requested to be created is in
     * directories that do not exist, these directories are created. If the file already
     * exists, it is NOT MODIFIED.
     *
     * @category Ensure
     */
    ensureFile() {
        return (0, ensure_js_1.ensureFile)(lowpath, nodefs, this.raw);
    }
    /**
     * Note: It is recommended to use `isFile()`, `isDir()`, etc to indicate the type of
     * path you want to check.
     *
     * Check whether the path exists.
     *
     * @category Is ... ?
     */
    exists() {
        return nodefs.promises.access(this.raw).then(() => true, () => false);
    }
    /**
     * Check if the path is an empty directory.
     *
     * If the path is not a directory, an error will be thrown.
     *
     * @category Is ... ?
     */
    async isEmptyDir() {
        const files = await nodefs.promises.readdir(this.raw);
        return files.length === 0;
    }
    /**
     * Check if the path is a directory.
     *
     * @param followlink when true, if the path is a link, follows it. Default: false
     *
     * @category Is ... ?
     */
    async isDir(followlink) {
        const stats = followlink
            ? await nodefs.promises.stat(this.raw)
            : await nodefs.promises.lstat(this.raw);
        return stats.isDirectory();
    }
    /**
     * Check if the path is a file.
     *
     * @param followlink when true, if the path is a link, follows it. Default: false
     *
     * @category Is ... ?
     */
    async isFile(followlink) {
        const stats = followlink
            ? await nodefs.promises.stat(this.raw)
            : await nodefs.promises.lstat(this.raw);
        return stats.isFile();
    }
    /**
     * Check if the path is a symbolic link.
     *
     * @category Is ... ?
     */
    async isSymbolicLink() {
        const stats = await nodefs.promises.lstat(this.raw);
        return stats.isSymbolicLink();
    }
    readdir(options) {
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
     *     .updateJSON(json => { json.timestamp = Date.now() })
     * ```
     *
     * @category List directory contents
     */
    async ls(recursive, followLinks) {
        const fs = nodefs.promises;
        // Always try to resolve a link for the current path,
        // regardless of whether followLinks is enabled.
        const stats = await fs.stat(this.raw);
        if (!stats.isDirectory()) {
            throw new Error('[path-nice] .ls(): the path is not a directory.');
        }
        const dirs = [];
        const files = [];
        const readSingleLayer = async (dir) => {
            const entries = await fs.readdir(dir, { withFileTypes: true });
            for (const entry of entries) {
                const abs = lowpath.join(dir, entry.name);
                const nice = this._new(abs);
                let isDir = false;
                if (followLinks && entry.isSymbolicLink()) {
                    const real = await fs.realpath(abs);
                    const stats = await fs.lstat(real);
                    if (stats.isDirectory())
                        isDir = true;
                }
                else if (entry.isDirectory()) {
                    isDir = true;
                }
                if (isDir) {
                    dirs.push(nice);
                    if (recursive)
                        await readSingleLayer(abs);
                }
                else {
                    files.push(nice);
                }
            }
        };
        await readSingleLayer(lowpath.normalize(this.toAbsolute().raw));
        return { dirs, files };
    }
    watchFile(arg0, arg1) {
        return nodefs.watchFile(this.raw, arg0, arg1);
    }
    /**
     * Stop watching for changes on `filename`.
     *
     * @category Watch
     */
    unwatchFile(listener) {
        return nodefs.unwatchFile(this.raw, listener);
    }
    watch(arg0, arg1) {
        return nodefs.watch(this.raw, arg0, arg1);
    }
    lstat(opts) {
        return nodefs.promises.lstat(this.raw, opts);
    }
    stat(opts) {
        return nodefs.promises.stat(this.raw, opts);
    }
    /**
     * Asynchronous chmod(2) - Change permissions of a file.
     * @param mode A file mode. If a string is passed, it is parsed as an octal integer.
     *
     * @category Others
     */
    chmod(mode) {
        return nodefs.promises.chmod(this.raw, mode);
    }
    /**
     * Asynchronous lchmod(2) - Change permissions of a file. Does not dereference symbolic links.
     * @param mode A file mode. If a string is passed, it is parsed as an octal integer.
     *
     * @category Others
     */
    lchmod(mode) {
        return nodefs.promises.lchmod(this.raw, mode);
    }
    /**
     * Asynchronous lchown(2) - Change ownership of a file. Does not dereference symbolic links.
     *
     * @category Others
     */
    lchown(uid, gid) {
        return nodefs.promises.lchown(this.raw, uid, gid);
    }
    /**
     * Asynchronous chown(2) - Change ownership of a file.
     *
     * @category Others
     */
    chown(uid, gid) {
        return nodefs.promises.chown(this.raw, uid, gid);
    }
}
exports.PathNice = PathNice;
class ParsedPathNice {
    constructor(raw) {
        this.raw = raw;
    }
    valueOf() {
        return this.raw;
    }
    format() {
        return new PathNice(lowpath.format(this.raw));
    }
    root(newRoot) {
        if (typeof newRoot === 'string') {
            this.raw.root = newRoot;
            return this;
        }
        return this.raw.root;
    }
    dir(newDir) {
        if (typeof newDir === 'string') {
            this.raw.dir = newDir;
            return this;
        }
        return this.raw.dir;
    }
    base(newBase) {
        if (typeof newBase === 'string') {
            this.raw.base = newBase;
            return this;
        }
        return this.raw.base;
    }
    ext(newExt) {
        if (typeof newExt === 'string') {
            this.raw.ext = newExt;
            return this;
        }
        return this.raw.ext;
    }
    name(newName) {
        if (typeof newName === 'string') {
            this.raw.name = newName;
            return this;
        }
        return this.raw.name;
    }
}
exports.ParsedPathNice = ParsedPathNice;
//# sourceMappingURL=path-nice.js.map