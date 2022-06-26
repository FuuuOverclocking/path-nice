import * as nodepath from 'path';
import * as nodefs from 'fs';

const lowpath = nodepath;
const regReplaceSep = lowpath.sep === '/' ? /\//g : /\\/g;

/**
 * A PathNice instance is a wrapper of the raw path string, so that the path
 * can be easily used to generate additional paths or manipulate files.
 */
export class PathNice {
    /** Raw path string. */
    public readonly raw: string;

    constructor(str: string) {
        this.raw = str;
        Object.freeze(this);
    }

    private _new(str: string): PathNice {
        return new PathNice(str);
    }

    private static _from(path: string | PathNice): PathNice {
        if (typeof path === 'string') return new PathNice(path);
        return path;
    }

    public valueOf(): string {
        return this.raw;
    }

    /**
     * Get (when 0 args) or set (when 1 arg) the path segment separator.
     *
     * When get, return 'none' if there is no separator in the path,
     * or 'hybrid' if there is both '/' and '\\' separators.
     *
     * @example
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
     * $ path('../data').join('settings.json').raw
     * '../data/settings.json'      // on POSIX
     * '..\\data\\settings.json'    // on Windows
     *
     * $ path('/home').join('fuu', 'data.json').raw
     * '/home/fuu/data.json'        // on POSIX
     *
     * $ path('C:\\Users').join('fuu', 'data.json').raw
     * 'C:\\Users\\fuu\\data.json'  // on Windows
     */
    public join(...paths: Array<string | PathNice>): PathNice {
        const _paths = paths.map((p) => (typeof p === 'string' ? p : p.raw));
        return this._new(lowpath.join(this.raw, ..._paths));
    }

    /**
     * Get (when 0 args) or set (when 1 arg) the directory name of a path.
     *
     * @example
     * $ path('/usr/local/bin').dirname().raw
     * '/usr/local'         // on POSIX
     *
     * $ path('C:\\Users\\fuu').dirname().raw
     * 'C:\\Users'          // on Windows
     *
     * $ path('./src/index.ts').dirname('./dist').raw
     * './dist/index.ts'    // on POSIX
     * '.\\dist\\index.ts'  // on Windows
     */
    public dirname(newParent?: string | PathNice): PathNice {
        switch (typeof newParent) {
            case 'undefined':
                return this._new(lowpath.dirname(this.raw));
            case 'string':
                return this._new(lowpath.join(newParent, lowpath.basename(this.raw)));
            case 'object':
                return this._new(lowpath.join(newParent.raw, lowpath.basename(this.raw)));
        }
    }

    /**
     * Return the path to the parent directory, similar to the Unix command `cd ..` .
     *
     * Same to `path(??).dirname()` and `path(??).parent` .
     *
     * @example
     * $ path('/usr/local/bin').dotdot.raw
     * '/usr/local'         // on POSIX
     *
     * $ path('C:\\Users\\fuu').dotdot.raw
     * 'C:\\Users'          // on Windows
     */
    public get dotdot(): PathNice {
        return this.dirname();
    }

    /**
     * Return the path to the parent directory, similar to the Unix command `cd ..` .
     *
     * Same to `path(??).dirname()` and `path(??).dotdot` .
     *
     * @example
     * $ path('/usr/local/bin').parent.raw
     * '/usr/local'         // on POSIX
     *
     * $ path('C:\\Users\\fuu').parent.raw
     * 'C:\\Users'          // on Windows
     */
    public get parent(): PathNice {
        return this.dirname();
    }

    /**
     * Get (when 0 args) or set (when 1 arg) the last portion of the path.
     *
     * @example
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
     */
    public filename(newFilename?: string | PathNice): PathNice {
        switch (typeof newFilename) {
            case 'undefined':
                return this._new(lowpath.basename(this.raw));
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
     * $ path('data/January').prefixFilename('2021-').raw
     * 'data/2021-January'  // on POSIX
     * 'data\\2021-January' // on Windows
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
     * $ path('path-nice/tsconfig.json').postfixBeforeExt('.base').raw
     * 'path-nice/tsconfig.base.json'   // on POSIX
     * 'path-nice\\tsconfig.base.json'  // on Windows
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
     * $ path('user/data/').postfix('-1').raw
     * 'user/data-1'        // on POSIX
     * 'user\\data-1'       // on Windows
     *
     * $ path('./content.txt').postfix('.json').raw
     * './content.txt.json' // on POSIX
     * './content.txt.json' // on Windows
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
     */
    public isAbsolute(): boolean {
        return lowpath.isAbsolute(this.raw);
    }

    /**
     * Resolve the path to an absolute path, if it isn't now.
     *
     * @param basePath (optional) to which the current path is relative.
     *                            If not set, current working directory is used.
     *
     * @example
     * $ path('./src/index.ts').toAbsolute().raw // on POSIX,
     *                                           // suppose cwd is '/path-nice'
     * '/path-nice/src/index.ts'
     *
     * $ path('./src/index.ts').toAbsolute().raw // on Windows,
     *                                           // suppose cwd is 'D:\\path-nice'
     * 'D:\\path-nice\\src\\index.ts'
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
     * // on POSIX
     * $ path('/data/orandea/impl/bbb').toRelative('/data/orandea/test/aaa').raw
     * '../../impl/bbb'
     *
     * // on Windows
     * $ path('C:\\orandea\\impl\\bbb').toRelative('C:\\orandea\\test\\aaa').raw
     * '..\\..\\impl\\bbb'
     */
    public toRelative(relativeTo: string | PathNice): PathNice {
        if (typeof relativeTo === 'string') {
            return this._new(lowpath.relative(relativeTo, this.raw));
        }
        return this._new(lowpath.relative(relativeTo.raw, this.raw));
    }

    /**
     * Return an object whose properties represent significant elements of the path.
     *
     * @example
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
     */
    public parse(): ParsedPathNice {
        const obj = lowpath.parse(this.raw);
        return new ParsedPathNice(obj.root, obj.dir, obj.base, obj.ext, obj.name);
    }
}

export class ParsedPathNice {
    constructor(
        private _root: string,
        private _dir: string,
        private _base: string,
        private _ext: string,
        private _name: string,
    ) {}

    public valueOf(): string {
        return this.toString();
    }

    public format(): PathNice {
        return new PathNice(
            lowpath.format({
                root: this._root,
                dir: this._dir,
                base: this._base,
                ext: this._ext,
                name: this._name,
            }),
        );
    }

    /**
     * The root of the path such as '/' or 'c:\\'
     */
    public root(): string;
    public root(newRoot: string): this;
    public root(newRoot?: string): string | this {
        if (typeof newRoot === 'string') {
            this._root = newRoot;
            return this;
        }
        return this._root;
    }

    /**
     * The full directory path such as '/home/user/dir' or 'c:\\path\\dir'
     */
    public dir(): string;
    public dir(newDir: string): this;
    public dir(newDir?: string): string | this {
        if (typeof newDir === 'string') {
            this._dir = newDir;
            return this;
        }
        return this._dir;
    }

    /**
     * The file name including extension (if any) such as 'index.html'
     */
    public base(): string;
    public base(newBase: string): this;
    public base(newBase?: string): string | this {
        if (typeof newBase === 'string') {
            this._base = newBase;
            return this;
        }
        return this._base;
    }

    /**
     * The file extension (if any) such as '.html'
     */
    public ext(): string;
    public ext(newExt: string): this;
    public ext(newExt?: string): string | this {
        if (typeof newExt === 'string') {
            this._ext = newExt;
            return this;
        }
        return this._ext;
    }

    /**
     * The file name without extension (if any) such as 'index'
     */
    public name(): string;
    public name(newName: string): this;
    public name(newName?: string): string | this {
        if (typeof newName === 'string') {
            this._name = newName;
            return this;
        }
        return this._name;
    }
}
