import * as nodepath from 'path';
import * as nodefs from 'fs';
import type { FileSystem, PathNicePosix, PathNiceWin32 } from '../common/types.js';

const lowpath = nodepath;
const platformSep = lowpath.sep;
const regReplaceSep = lowpath.sep === '/' ? /\//g : /\\/g;

/**
 * A PathNice instance is a wrapper of the original path string, so that the path
 * can be easily used to generate additional paths or manipulate files, etc.
 *
 * @example
 * $ ts = path('./src').join('index.ts').str
 * './src/index.ts'
 *
 * $ js = path(ts).changeExt('js').str
 * './src/index.js'
 *
 * $ path(js).writeFileSync(
 * >     path(ts).readFileSync().replace(/ts/g, 'js')
 * > )
 *
 * $ path('./src/index.js').existsSync()
 * true
 */
export class PathNice {
    /** Raw path string. */
    public readonly str: string;

    private readonly forceSep: '\\' | '/' | undefined;
    private readonly fs: FileSystem;

    constructor(str: string, forceSep?: '/' | '\\', fs?: FileSystem) {
        if (forceSep && platformSep !== forceSep) {
            this.str = str.replace(regReplaceSep, forceSep);
        } else {
            this.str = str;
        }
        this.forceSep = forceSep;
        this.fs = fs || nodefs;
    }

    /**
     * Convert something that could be a path into a PathNice.
     * If it already is, return it as it is.
     */
    public static from<
        P extends string | PathNice | PathNicePosix<any> | PathNiceWin32<any>,
    >(path: P): P extends string ? PathNice : P {
        return (typeof path === 'string' ? new PathNice(path) : path) as any;
    }

    private _new(str: string): PathNice {
        return new PathNice(str, this.forceSep, this.fs);
    }

    private _checkCompatibilityWith(path: PathNice): void {
        if ((this.fs || path.fs) && this.fs !== path.fs) {
            throw new Error(
                `[path-nice]: Path("${this.str}", forceSep="${this.forceSep}", fs=${this.fs}) is ` +
                    `incompatible with Path("${path.str}", forceSep="${path.forceSep}", fs=${path.fs}), ` +
                    `because they use different filesystem.`,
            );
        }
    }

    /**
     * Join all arguments together and normalize the resulting path.
     *
     * @example
     * $ path('../data').join('settings.json').str
     * '../data/settings.json'
     *
     * $ path('/etc').join('hosts').str
     * '/etc/hosts'
     */
    public join(...paths: string[]): PathNice {
        return this._new(lowpath.join(this.str, ...paths));
    }

    /**
     * Get the path of parent directory. Internally uses `path.dirname()`,
     * which is similar to the Unix dirname command.
     *
     * @example
     * $ path('/etc/local/bin').parent().str
     * '/etc/local'
     */
    public parent(newParent?: string | PathNice): PathNice {
        return this._new(lowpath.dirname(this.str));
    }

    /**
     * Returns the filename or directory name of the path, or to be precise,
     * the last portion of the path. Similar to the Unix basename command.
     * Often used to extract the file name from a fully qualified path.
     *
     * @example
     * $ path('./src/index.js').filename().str
     * 'index.js'
     *
     * $ path('/home/fuu/').filename().str
     * 'fuu'
     */
    public filename(): PathNice {
        return this._new(lowpath.basename(this.str));
    }

    /**
     * Note: This method returns a STRING.
     *
     * Return the extension of the path, from the last '.' (excluded) to end of string
     * in the last portion of the path.
     *
     * If there is no '.' in the last portion of the path or the first character of it
     * is '.', then it returns an empty string.
     *
     * @example
     * $ path('./src/index.js').ext()
     * 'js'
     *
     * $ path('./tsconfig.base.json').ext()
     * 'json'
     *
     * $ path('.bashrc').ext()
     * ''
     */
    public ext(): string {
        return lowpath.extname(this.str).slice(1);
    }

    /**
     * Modify, delete or add the extension of the path. If `ext` is null, delete (if exists).
     * Otherwise, add (if not exists) or modify.
     *
     * @example
     * $ path('path-nice/README.md').changeExt('txt').str
     * 'path-nice/README.txt'
     *
     * $ path('path-nice/README.md').changeExt(null).str
     * 'path-nice/README'
     *
     * $ path('path-nice/LICENSE').changeExt('txt').str
     * 'path-nice/LICENSE.txt'
     */
    public changeExt(ext: string | null): PathNice {
        const obj = lowpath.parse(this.str);
        const _ext = ext ? '.' + ext : void 0;
        return this._new(
            lowpath.format({
                dir: obj.dir,
                name: obj.name,
                ext: _ext,
            }),
        );
    }

    /**
     * Add a prefix to the filename, i.e. add the prefix after dirname, before filename.
     *
     * @example
     * $ path('data/settings.json').prefixFilename('.old.').str
     * 'data/.old.settings.json'
     *
     * $ path('./src/').prefixFilename('.old.').str
     * './.old.src'
     */
    public prefixFilename(prefix: string): PathNice {
        const obj = lowpath.parse(this.str);
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
     * $ path('path-nice/tsconfig.json').postfixBeforeExt('.base').str
     * 'path-nice/tsconfig.base.json'
     *
     * $ path('path-nice/LICENSE').postfixBeforeExt('.old').str
     * 'path-nice/LICENSE.old'
     */
    public postfixBeforeExt(postfix: string): PathNice {
        const obj = lowpath.parse(this.str);
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
     * $ path('user/data/').postfix('-1').str
     * 'user/data-1'
     *
     * $ path('./content.txt').postfix('.json').str
     * './content.txt.json'
     */
    public postfix(postfix: string): PathNice {
        const obj = lowpath.parse(this.str);
        return this._new(
            lowpath.format({
                dir: obj.dir,
                name: obj.name,
                ext: obj.ext + postfix,
            }),
        );
    }

    /**
     * Determines whether {path} is an absolute path. An absolute path will always resolve
     * to the same location, regardless of the working directory.
     *
     * @example
     * path('/foo/bar').isAbsolute(); // true
     * path('/baz/..').isAbsolute();  // true
     * path('qux/').isAbsolute();     // false
     * path('.').isAbsolute();        // false
     */
    public isAbsolute(): boolean {
        return lowpath.isAbsolute(this.str);
    }

    /**
     * Resolve the path to an absolute path, if the current one is not.
     *
     * @param basePath (optional) to which the current path is relative.
     *                            Use current working directory, if not set.
     *
     * @example
     * $ path('./src/index.ts').toAbsolute().str // Suppose cwd is '/path-nice'
     * '/path-nice/src/index.ts'
     */
    public toAbsolute(basePath?: string | PathNice): PathNice {
        if (this.isAbsolute()) return this;
        if (!basePath) return this._new(lowpath.resolve(this.str));

        basePath = PathNice.from(basePath);
        this._checkCompatibilityWith(basePath);
        if (!basePath.isAbsolute()) {
            throw new Error(
                `[path-nice] PathNice.toAbsolute: "${basePath.str}" is not an absolute path.`,
            );
        }
        return this._new(lowpath.resolve(basePath.str, this.str));
    }

    /**
     * Solve the relative path by comparing with {relativeTo}. At times we have two
     * absolute paths, and we need to derive the relative path from one to the other.
     * This is actually the reverse transform of path.resolve.
     *
     * @example
     * $ path('/data/orandea/impl/bbb').toRelative('/data/orandea/test/aaa').str
     * '../../impl/bbb'
     */
    public toRelative(relativeTo: string | PathNice): PathNice {
        relativeTo = PathNice.from(relativeTo);
        this._checkCompatibilityWith(relativeTo);
        return this._new(lowpath.relative(relativeTo.str, this.str));
    }
}
