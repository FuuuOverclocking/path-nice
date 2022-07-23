import nodefs from 'fs';
import chokidar from 'chokidar';
import { checkCompatibility, isValidBufferEncoding, toJsonAndWriteOptions, } from './util.js';
import { copy, copySync } from './fs/copy.js';
import { move, moveSync } from './fs/move.js';
import { remove, removeSync } from './fs/remove.js';
import { emptyDir, emptyDirSync } from './fs/empty-dir.js';
import { ensureDir, ensureDirSync, ensureFile, ensureFileSync } from './fs/ensure.js';
export function genPathNice(lowpath, fs) {
    function n(p) {
        return new PathNice(p);
    }
    function extract(p) {
        if (typeof p === 'string')
            return p;
        if (p instanceof PathNice)
            return p.raw;
        if (!p || typeof p.raw !== 'string') {
            throw new Error(`[path-nice]: \`${String(p)}\` is not a string or a PathNice object.`);
        }
        checkCompatibility({ lowpath, fs }, p);
        return p.raw;
    }
    class PathNice {
        constructor(raw) {
            this.raw = raw;
            Object.freeze(this);
        }
        get lowpath() {
            return lowpath;
        }
        get fs() {
            return fs;
        }
        static _from(path) {
            if (typeof path === 'string')
                return new PathNice(path);
            if (path instanceof PathNice)
                return path;
            if (!path || typeof path.raw !== 'string') {
                throw new Error('[path-nice]: a string or a PathNice object is expected.');
            }
            checkCompatibility({ lowpath, fs }, path);
            return new PathNice(path.raw);
        }
        valueOf() {
            return this.raw;
        }
        toString() {
            return this.raw;
        }
        // ===============================================================================
        // Path related methods
        // ===============================================================================
        join(...paths) {
            const _paths = paths.map((p) => extract(p));
            return n(lowpath.join(this.raw, ..._paths));
        }
        dirname(newDirname) {
            switch (typeof newDirname) {
                case 'undefined':
                    return n(lowpath.dirname(this.raw));
                case 'string':
                    return n(lowpath.join(newDirname, lowpath.basename(this.raw)));
                case 'object':
                    newDirname = extract(newDirname);
                    return n(lowpath.join(newDirname, lowpath.basename(this.raw)));
                case 'function':
                    return this.dirname(newDirname(lowpath.dirname(this.raw)));
            }
        }
        get parent() {
            return n(lowpath.dirname(this.raw));
        }
        filename(newFilename) {
            switch (typeof newFilename) {
                case 'undefined':
                    return lowpath.basename(lowpath.resolve(this.raw));
                case 'string':
                    return n(lowpath.join(lowpath.dirname(this.raw), newFilename));
                case 'function':
                    const newName = newFilename(lowpath.basename(lowpath.resolve(this.raw)));
                    return this.filename(newFilename(this.filename()));
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
                    return n(lowpath.format({
                        dir: obj.dir,
                        name: obj.name,
                        ext: _ext,
                    }));
                case 'function':
                    return this.ext(newExt(this.ext()));
            }
        }
        separator(forceSep) {
            const regReplaceSep = /[\/\\]/g;
            if (forceSep)
                return n(this.raw.replace(regReplaceSep, forceSep));
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
        prefixFilename(prefix) {
            const obj = lowpath.parse(this.raw);
            return n(lowpath.format({
                dir: obj.dir,
                base: prefix + obj.base,
            }));
        }
        postfixBeforeExt(postfix) {
            const obj = lowpath.parse(this.raw);
            return n(lowpath.format({
                dir: obj.dir,
                name: obj.name + postfix,
                ext: obj.ext,
            }));
        }
        postfix(postfix) {
            const obj = lowpath.parse(this.raw);
            return n(lowpath.format({
                dir: obj.dir,
                name: obj.name,
                ext: obj.ext + postfix,
            }));
        }
        isAbsolute() {
            return lowpath.isAbsolute(this.raw);
        }
        toAbsolute(basePath) {
            if (this.isAbsolute())
                return this;
            if (!basePath)
                return n(lowpath.resolve(this.raw));
            basePath = extract(basePath);
            return n(lowpath.resolve(basePath, this.raw));
        }
        toRelative(relativeTo) {
            if (relativeTo) {
                relativeTo = extract(relativeTo);
            }
            else {
                relativeTo = process.cwd();
            }
            return n(lowpath.relative(relativeTo, this.raw));
        }
        async realpath() {
            const rp = await fs.promises.realpath(this.raw, 'utf8');
            return n(rp);
        }
        parse() {
            return new ParsedPathNice(lowpath.parse(this.raw));
        }
        // ===============================================================================
        // File system related methods
        // ===============================================================================
        readFile(options) {
            return fs.promises.readFile(this.raw, options);
        }
        readFileSync(options) {
            return fs.readFileSync(this.raw, options);
        }
        readFileToString(options) {
            if (!options) {
                return fs.promises.readFile(this.raw, 'utf8');
            }
            if (typeof options === 'string') {
                options = { encoding: options };
            }
            if (!options.encoding) {
                options.encoding = 'utf8';
            }
            else if (!isValidBufferEncoding(options.encoding)) {
                throw new Error(`[path-nice] .readFileToString(): '${options.encoding}' is not a ` +
                    `valid buffer encoding.`);
            }
            return fs.promises.readFile(this.raw, options);
        }
        readFileToStringSync(options) {
            if (!options) {
                return fs.readFileSync(this.raw, 'utf8');
            }
            if (typeof options === 'string') {
                options = { encoding: options };
            }
            if (!options.encoding) {
                options.encoding = 'utf8';
            }
            else if (!isValidBufferEncoding(options.encoding)) {
                throw new Error(`[path-nice] .readFileToStringSync(): '${options.encoding}' is not ` +
                    `a valid buffer encoding.`);
            }
            return fs.readFileSync(this.raw, options);
        }
        async readJSON(options) {
            return JSON.parse(await this.readFileToString(options));
        }
        readJSONSync(options) {
            return JSON.parse(this.readFileToStringSync(options));
        }
        writeFile(data, options) {
            return fs.promises.writeFile(this.raw, data, options);
        }
        writeFileSync(data, options) {
            fs.writeFileSync(this.raw, data, options);
        }
        writeJSON(data, options) {
            const { json, writeOptions } = toJsonAndWriteOptions(data, options);
            return this.writeFile(json, writeOptions);
        }
        writeJSONSync(data, options) {
            const { json, writeOptions } = toJsonAndWriteOptions(data, options);
            this.writeFileSync(json, writeOptions);
        }
        async outputFile(data, options) {
            await this.parent.ensureDir();
            await this.writeFile(data, options);
        }
        outputFileSync(data, options) {
            this.parent.ensureDirSync();
            this.writeFileSync(data, options);
        }
        async outputJSON(data, options) {
            await this.parent.ensureDir();
            await this.writeJSON(data, options);
        }
        outputJSONSync(data, options) {
            this.parent.ensureDirSync();
            this.writeJSONSync(data, options);
        }
        async updateFileAsString(fn, options) {
            const str = await this.readFileToString(options);
            await this.writeFile(await fn(str), options);
        }
        updateFileAsStringSync(fn, options) {
            const str = this.readFileToStringSync(options);
            this.writeFileSync(fn(str), options);
        }
        async updateJSON(fn, options) {
            const obj = await this.readJSON(options);
            const result = await fn(obj);
            await this.writeJSON(result === void 0 ? obj : result, options);
        }
        updateJSONSync(fn, options) {
            const obj = this.readJSONSync(options);
            const result = fn(obj);
            this.writeJSONSync(result === void 0 ? obj : result, options);
        }
        appendFile(data, options) {
            return fs.promises.appendFile(this.raw, data, options);
        }
        appendFileSync(data, options) {
            return fs.appendFileSync(this.raw, data, options);
        }
        createReadStream(options) {
            return fs.createReadStream(this.raw, options);
        }
        createWriteStream(options) {
            return fs.createWriteStream(this.raw, options);
        }
        open(flags, mode) {
            return fs.promises.open(this.raw, flags, mode);
        }
        openSync(flags, mode) {
            return fs.openSync(this.raw, flags, mode);
        }
        async copy(dest, options) {
            dest = extract(dest);
            await copy(lowpath, fs, this.raw, dest, options);
            return n(dest);
        }
        copySync(dest, options) {
            dest = extract(dest);
            copySync(lowpath, fs, this.raw, dest, options);
            return n(dest);
        }
        async move(dest, options) {
            dest = extract(dest);
            await move(lowpath, fs, this.raw, dest, options);
            return n(dest);
        }
        moveSync(dest, options) {
            dest = extract(dest);
            moveSync(lowpath, fs, this.raw, dest, options);
            return n(dest);
        }
        async rename(newPath) {
            newPath = extract(newPath);
            await fs.promises.rename(this.raw, newPath);
            return n(newPath);
        }
        renameSync(newPath) {
            newPath = extract(newPath);
            fs.renameSync(this.raw, newPath);
            return n(newPath);
        }
        async remove() {
            await remove(fs, this.raw);
            return this;
        }
        removeSync() {
            removeSync(fs, this.raw);
            return this;
        }
        async delete() {
            await remove(fs, this.raw);
            return this;
        }
        deleteSync() {
            removeSync(fs, this.raw);
            return this;
        }
        async emptyDir() {
            await emptyDir(lowpath, fs, this.raw);
            return this;
        }
        emptyDirSync() {
            emptyDirSync(lowpath, fs, this.raw);
            return this;
        }
        async ensureDir(options) {
            await ensureDir(fs, this.raw, options);
            return this;
        }
        ensureDirSync(options) {
            ensureDirSync(fs, this.raw, options);
            return this;
        }
        async ensureFile(options) {
            await ensureFile(lowpath, fs, this.raw, options);
            return this;
        }
        ensureFileSync(options) {
            ensureFileSync(lowpath, fs, this.raw, options);
            return this;
        }
        exists() {
            return fs.promises.access(this.raw).then(() => true, () => false);
        }
        existsSync() {
            try {
                fs.accessSync(this.raw);
                return true;
            }
            catch (e) {
                return false;
            }
        }
        async isEmptyDir() {
            const files = await fs.promises.readdir(this.raw);
            return files.length === 0;
        }
        isEmptyDirSync() {
            const files = fs.readdirSync(this.raw);
            return files.length === 0;
        }
        async isDir(followlink) {
            const stats = followlink
                ? await fs.promises.stat(this.raw)
                : await fs.promises.lstat(this.raw);
            return stats.isDirectory();
        }
        isDirSync(followlink) {
            const stats = followlink ? fs.statSync(this.raw) : fs.lstatSync(this.raw);
            return stats.isDirectory();
        }
        async isFile(followlink) {
            const stats = followlink
                ? await fs.promises.stat(this.raw)
                : await fs.promises.lstat(this.raw);
            return stats.isFile();
        }
        isFileSync(followlink) {
            const stats = followlink ? fs.statSync(this.raw) : fs.lstatSync(this.raw);
            return stats.isFile();
        }
        async isSymbolicLink() {
            const stats = await fs.promises.lstat(this.raw);
            return stats.isSymbolicLink();
        }
        isSymbolicLinkSync() {
            const stats = fs.lstatSync(this.raw);
            return stats.isSymbolicLink();
        }
        readdir(options) {
            return fs.promises.readdir(this.raw, options);
        }
        readdirSync(options) {
            return fs.readdirSync(this.raw, options);
        }
        async ls(recursive, followLinks) {
            // Always try to resolve a link for the current path,
            // regardless of whether followLinks is enabled.
            const stats = await fs.promises.stat(this.raw);
            if (!stats.isDirectory()) {
                throw new Error('[path-nice] .ls(): the path is not a directory.');
            }
            const thisAbs = this.toAbsolute();
            const dirs = new PathNiceArr();
            const files = new PathNiceArr();
            dirs.base = files.base = thisAbs;
            const readSingleLayer = async (dir) => {
                const entries = await fs.promises.readdir(dir, { withFileTypes: true });
                for (const entry of entries) {
                    const abs = lowpath.join(dir, entry.name);
                    const nice = n(abs);
                    let isDir = false;
                    if (followLinks && entry.isSymbolicLink()) {
                        const real = await fs.promises.realpath(abs);
                        const stats = await fs.promises.lstat(real);
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
            await readSingleLayer(lowpath.normalize(thisAbs.raw));
            return { dirs, files };
        }
        lsSync(recursive, followLinks) {
            // Always try to resolve a link for the current path,
            // regardless of whether followLinks is enabled.
            const stats = fs.statSync(this.raw);
            if (!stats.isDirectory()) {
                throw new Error('[path-nice] .lsSync(): the path is not a directory.');
            }
            const thisAbs = this.toAbsolute();
            const dirs = new PathNiceArr();
            const files = new PathNiceArr();
            dirs.base = files.base = thisAbs;
            const readSingleLayer = (dir) => {
                const entries = fs.readdirSync(dir, { withFileTypes: true });
                for (const entry of entries) {
                    const abs = lowpath.join(dir, entry.name);
                    const nice = n(abs);
                    let isDir = false;
                    if (followLinks && entry.isSymbolicLink()) {
                        const real = fs.realpathSync(abs);
                        const stats = fs.lstatSync(real);
                        if (stats.isDirectory())
                            isDir = true;
                    }
                    else if (entry.isDirectory()) {
                        isDir = true;
                    }
                    if (isDir) {
                        dirs.push(nice);
                        if (recursive)
                            readSingleLayer(abs);
                    }
                    else {
                        files.push(nice);
                    }
                }
            };
            readSingleLayer(lowpath.normalize(thisAbs.raw));
            return { dirs, files };
        }
        watchFile(arg0, arg1) {
            return fs.watchFile(this.raw, arg0, arg1);
        }
        unwatchFile(listener) {
            return fs.unwatchFile(this.raw, listener);
        }
        watch(arg0, arg1) {
            return fs.watch(this.raw, arg0, arg1);
        }
        watchWithChokidar(options) {
            if (fs !== nodefs && !(options === null || options === void 0 ? void 0 : options.forceEvenDifferentFS)) {
                throw new Error('[path-nice] .watchWithChokidar(): the underlying fs object being ' +
                    'used by the current path object is not the original node:fs ' +
                    'module, but chokidar can only use the original node:fs module. ' +
                    'If you are sure your operation makes sense, enable ' +
                    '`options.forceEvenDifferentFS` to ignore this error.');
            }
            if (options) {
                delete options.forceEvenDifferentFS;
            }
            return chokidar.watch(this.raw, options);
        }
        async fileOwner() {
            const stats = await this.stat();
            return { uid: stats.uid, gid: stats.gid };
        }
        fileOwnerSync() {
            const stats = this.statSync();
            return { uid: stats.uid, gid: stats.gid };
        }
        async fileMode() {
            const stats = await this.stat();
            return stats.mode;
        }
        fileModeSync() {
            const stats = this.statSync();
            return stats.mode;
        }
        async fileSize() {
            // Number.MAX_SAFE_INTEGER bytes < 8PB
            const size = (await this.stat()).size;
            return {
                B: size,
                KB: size / 2 ** 10,
                MB: size / 2 ** 20,
                GB: size / 2 ** 30,
                TB: size / 2 ** 40,
                PB: size / 2 ** 50,
            };
        }
        fileSizeSync() {
            // Number.MAX_SAFE_INTEGER bytes < 8PB
            const size = this.statSync().size;
            return {
                B: size,
                KB: size / 2 ** 10,
                MB: size / 2 ** 20,
                GB: size / 2 ** 30,
                TB: size / 2 ** 40,
                PB: size / 2 ** 50,
            };
        }
        lstat(opts) {
            return fs.promises.lstat(this.raw, opts);
        }
        lstatSync(opts) {
            return fs.lstatSync(this.raw, opts);
        }
        stat(opts) {
            return fs.promises.stat(this.raw, opts);
        }
        statSync(opts) {
            return fs.statSync(this.raw, opts);
        }
        chmod(mode) {
            return fs.promises.chmod(this.raw, mode);
        }
        chmodSync(mode) {
            return fs.chmodSync(this.raw, mode);
        }
        lchown(uid, gid) {
            return fs.promises.lchown(this.raw, uid, gid);
        }
        lchownSync(uid, gid) {
            return fs.lchownSync(this.raw, uid, gid);
        }
        chown(uid, gid) {
            return fs.promises.chown(this.raw, uid, gid);
        }
        chownSync(uid, gid) {
            return fs.chownSync(this.raw, uid, gid);
        }
    }
    class PathNiceArr extends Array {
        static _from(arr) {
            return new PathNiceArr(...arr.map((p) => {
                if (typeof p === 'string')
                    return new PathNice(p);
                return p;
            }));
        }
        // ===============================================================================
        // File system related methods
        // ===============================================================================
        async copyToDir(destDir, options) {
            destDir = extract(destDir);
            const arr = await Promise.all(this.map((p) => {
                if (this.base) {
                    const dest = p.toRelative(this.base).toAbsolute(destDir);
                    return p.copy(dest, options);
                }
                return p.copy(lowpath.join(destDir, p.filename()), options);
            }));
            return PathNiceArr._from(arr);
        }
        copyToDirSync(destDir, options) {
            destDir = extract(destDir);
            const arr = this.map((p) => {
                if (this.base) {
                    const dest = p.toRelative(this.base).toAbsolute(destDir);
                    return p.copySync(dest, options);
                }
                return p.copySync(lowpath.join(destDir, p.filename()), options);
            });
            return PathNiceArr._from(arr);
        }
        async moveToDir(destDir, options) {
            destDir = extract(destDir);
            const arr = await Promise.all(this.map((p) => {
                if (this.base) {
                    const dest = p.toRelative(this.base).toAbsolute(destDir);
                    return p.move(dest, options);
                }
                return p.move(lowpath.join(destDir, p.filename()), options);
            }));
            return PathNiceArr._from(arr);
        }
        moveToDirSync(destDir, options) {
            destDir = extract(destDir);
            const arr = this.map((p) => {
                if (this.base) {
                    const dest = p.toRelative(this.base).toAbsolute(destDir);
                    return p.moveSync(dest, options);
                }
                return p.moveSync(lowpath.join(destDir, p.filename()), options);
            });
            return PathNiceArr._from(arr);
        }
        async remove() {
            await Promise.all([this.map((p) => p.remove())]);
            return this;
        }
        removeSync() {
            this.forEach((p) => p.removeSync());
            return this;
        }
        async delete() {
            await Promise.all([this.map((p) => p.remove())]);
            return this;
        }
        deleteSync() {
            this.forEach((p) => p.removeSync());
            return this;
        }
        watchWithChokidar(options) {
            if (fs !== nodefs && !(options === null || options === void 0 ? void 0 : options.forceEvenDifferentFS)) {
                throw new Error('[path-nice] .watchWithChokidar(): the underlying fs object being ' +
                    'used by the current path object is not the original node:fs ' +
                    'module, but chokidar can only use the original node:fs module. ' +
                    'If you are sure your operation makes sense, enable ' +
                    '`options.forceEvenDifferentFS` to ignore this error.');
            }
            return chokidar.watch(this.map((p) => p.raw), options);
        }
        // ===============================================================================
        // Array methods
        // ===============================================================================
        concat(...args) {
            const arr = super.concat(...args);
            arr.base = this.base;
            return arr;
        }
        reverse() {
            const arr = super.reverse();
            arr.base = this.base;
            return arr;
        }
        slice(...args) {
            const arr = super.slice(...args);
            arr.base = this.base;
            return arr;
        }
        splice(...args) {
            const arr = super.splice(...args);
            arr.base = this.base;
            return arr;
        }
        filter(...args) {
            const arr = super.filter(...args);
            arr.base = this.base;
            return arr;
        }
    }
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
    return { PathNice: PathNice, PathNiceArr: PathNiceArr };
}
//# sourceMappingURL=path-nice-impl.js.map