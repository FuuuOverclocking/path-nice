import nodefs from 'fs';
import type { ParsedPath } from 'path';
import chokidar from 'chokidar';
import type { FileSystem, PlatformPath } from './types.js';
import {
    checkCompatibility,
    isValidBufferEncoding,
    toJsonAndWriteOptions,
} from './util.js';
import { copy, copySync } from './fs/copy.js';
import { move, moveSync } from './fs/move.js';
import { remove, removeSync } from './fs/remove.js';
import { emptyDir, emptyDirSync } from './fs/empty-dir.js';
import { ensureDir, ensureDirSync, ensureFile, ensureFileSync } from './fs/ensure.js';

export function genPathNice(lowpath: PlatformPath, fs: FileSystem) {
    function n(p: string): PathNice {
        return new PathNice(p);
    }

    function extract(p: string | PathNice): string {
        if (typeof p === 'string') return p;
        if (p instanceof PathNice) return p.raw;
        if (!p || typeof (p as any).raw !== 'string') {
            throw new Error(
                `[path-nice]: \`${String(p)}\` is not a string or a PathNice object.`,
            );
        }
        checkCompatibility({ lowpath, fs }, p);
        return (p as any).raw;
    }

    class PathNice {
        readonly raw: string;
        get lowpath() {
            return lowpath;
        }
        get fs() {
            return fs;
        }

        constructor(raw: string) {
            this.raw = raw;
            Object.freeze(this);
        }

        static _from(path: string | PathNice): PathNice {
            if (typeof path === 'string') return new PathNice(path);
            if (path instanceof PathNice) return path;

            if (!path || typeof (path as any).raw !== 'string') {
                throw new Error(
                    '[path-nice]: a string or a PathNice object is expected.',
                );
            }
            checkCompatibility({ lowpath, fs }, path);
            return new PathNice((path as any).raw);
        }

        valueOf(): string {
            return this.raw;
        }

        toString(): string {
            return this.raw;
        }

        // ===============================================================================
        // Path related methods
        // ===============================================================================

        join(...paths: Array<string | PathNice>): PathNice {
            const _paths = paths.map((p) => extract(p));
            return n(lowpath.join(this.raw, ..._paths));
        }

        dirname(
            newDirname?: string | PathNice | ((oldDirname: string) => string),
        ): PathNice {
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

        get parent(): PathNice {
            return n(lowpath.dirname(this.raw));
        }

        filename(
            newFilename?: string | ((oldFilename: string) => string),
        ): string | PathNice {
            switch (typeof newFilename) {
                case 'undefined':
                    return lowpath.basename(lowpath.resolve(this.raw));
                case 'string':
                    return n(lowpath.join(lowpath.dirname(this.raw), newFilename));
                case 'function':
                    const newName = newFilename(
                        lowpath.basename(lowpath.resolve(this.raw)),
                    );
                    return this.filename(newFilename(this.filename() as string));
            }
        }

        ext(newExt?: string | null | ((oldExt: string) => string)): string | PathNice {
            switch (typeof newExt) {
                case 'undefined':
                    return lowpath.extname(this.raw);
                case 'string':
                case 'object': // typeof null === 'object'
                    const obj = lowpath.parse(this.raw);
                    const _ext = newExt || void 0;
                    return n(
                        lowpath.format({
                            dir: obj.dir,
                            name: obj.name,
                            ext: _ext,
                        }),
                    );
                case 'function':
                    return this.ext(newExt(this.ext() as string));
            }
        }

        separator(forceSep?: '/' | '\\'): '/' | '\\' | 'none' | 'hybrid' | PathNice {
            const regReplaceSep = /[\/\\]/g;

            if (forceSep) return n(this.raw.replace(regReplaceSep, forceSep));
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

        prefixFilename(prefix: string): PathNice {
            const obj = lowpath.parse(this.raw);
            return n(
                lowpath.format({
                    dir: obj.dir,
                    base: prefix + obj.base,
                }),
            );
        }

        postfixBeforeExt(postfix: string): PathNice {
            const obj = lowpath.parse(this.raw);
            return n(
                lowpath.format({
                    dir: obj.dir,
                    name: obj.name + postfix,
                    ext: obj.ext,
                }),
            );
        }

        postfix(postfix: string): PathNice {
            const obj = lowpath.parse(this.raw);
            return n(
                lowpath.format({
                    dir: obj.dir,
                    name: obj.name,
                    ext: obj.ext + postfix,
                }),
            );
        }

        isAbsolute(): boolean {
            return lowpath.isAbsolute(this.raw);
        }

        toAbsolute(basePath?: string | PathNice): PathNice {
            if (this.isAbsolute()) return this;
            if (!basePath) return n(lowpath.resolve(this.raw));

            basePath = extract(basePath);
            return n(lowpath.resolve(basePath, this.raw));
        }

        toRelative(relativeTo?: string | PathNice): PathNice {
            if (relativeTo) {
                relativeTo = extract(relativeTo);
            } else {
                relativeTo = process.cwd();
            }
            return n(lowpath.relative(relativeTo, this.raw));
        }

        async realpath(): Promise<PathNice> {
            const rp = await fs.promises.realpath(this.raw, 'utf8');
            return n(rp);
        }

        parse(): ParsedPathNice {
            return new ParsedPathNice(lowpath.parse(this.raw));
        }

        // ===============================================================================
        // File system related methods
        // ===============================================================================

        readFile(options?: any): Promise<string | Buffer> {
            return fs.promises.readFile(this.raw, options);
        }

        readFileSync(options?: any): string | Buffer {
            return fs.readFileSync(this.raw, options);
        }

        readFileToString(options?: any): Promise<string> {
            if (!options) {
                return fs.promises.readFile(this.raw, 'utf8');
            }

            if (typeof options === 'string') {
                options = { encoding: options };
            }
            if (!options.encoding) {
                options.encoding = 'utf8';
            } else if (!isValidBufferEncoding(options.encoding)) {
                throw new Error(
                    `[path-nice] .readFileToString(): '${options.encoding}' is not a ` +
                        `valid buffer encoding.`,
                );
            }

            return fs.promises.readFile(this.raw, options) as any as Promise<string>;
        }

        readFileToStringSync(options?: any): string {
            if (!options) {
                return fs.readFileSync(this.raw, 'utf8');
            }

            if (typeof options === 'string') {
                options = { encoding: options };
            }
            if (!options.encoding) {
                options.encoding = 'utf8';
            } else if (!isValidBufferEncoding(options.encoding)) {
                throw new Error(
                    `[path-nice] .readFileToStringSync(): '${options.encoding}' is not ` +
                        `a valid buffer encoding.`,
                );
            }

            return fs.readFileSync(this.raw, options) as any as string;
        }

        async readJSON(options?: any): Promise<any> {
            return JSON.parse(await this.readFileToString(options));
        }

        readJSONSync(options?: any): any {
            return JSON.parse(this.readFileToStringSync(options));
        }

        writeFile(data: any, options?: any): Promise<void> {
            return fs.promises.writeFile(this.raw, data, options);
        }

        writeFileSync(data: any, options?: any): void {
            fs.writeFileSync(this.raw, data, options);
        }

        writeJSON(data: any, options?: any): Promise<void> {
            const { json, writeOptions } = toJsonAndWriteOptions(data, options);
            return this.writeFile(json, writeOptions);
        }

        writeJSONSync(data: any, options?: any): void {
            const { json, writeOptions } = toJsonAndWriteOptions(data, options);
            this.writeFileSync(json, writeOptions);
        }

        async outputFile(data: any, options?: any): Promise<void> {
            await this.parent.ensureDir();
            await this.writeFile(data, options);
        }

        outputFileSync(data: any, options?: any): void {
            this.parent.ensureDirSync();
            this.writeFileSync(data, options);
        }

        async outputJSON(data: any, options?: any): Promise<void> {
            await this.parent.ensureDir();
            await this.writeJSON(data, options);
        }

        outputJSONSync(data: any, options?: any): void {
            this.parent.ensureDirSync();
            this.writeJSONSync(data, options);
        }

        async updateFileAsString(
            fn: (original: string) => string | Promise<string>,
            options?:
                | { encoding?: BufferEncoding | null | undefined }
                | BufferEncoding
                | null,
        ): Promise<void> {
            const str = await this.readFileToString(options);
            await this.writeFile(await fn(str), options);
        }

        updateFileAsStringSync(
            fn: (original: string) => string | Promise<string>,
            options?:
                | { encoding?: BufferEncoding | null | undefined }
                | BufferEncoding
                | null,
        ): void {
            const str = this.readFileToStringSync(options);
            this.writeFileSync(fn(str), options);
        }

        async updateJSON(
            fn: (original: any) => any | Promise<any>,
            options?:
                | { encoding?: BufferEncoding | null | undefined }
                | BufferEncoding
                | null,
        ): Promise<void> {
            const obj = await this.readJSON(options);
            const result = await fn(obj);
            await this.writeJSON(result === void 0 ? obj : result, options);
        }

        updateJSONSync(
            fn: (original: any) => any,
            options?:
                | { encoding?: BufferEncoding | null | undefined }
                | BufferEncoding
                | null,
        ): void {
            const obj = this.readJSONSync(options);
            const result = fn(obj);
            this.writeJSONSync(result === void 0 ? obj : result, options);
        }

        appendFile(data: any, options?: any): Promise<void> {
            return fs.promises.appendFile(this.raw, data, options);
        }

        appendFileSync(data: any, options?: any): void {
            return fs.appendFileSync(this.raw, data, options);
        }

        createReadStream(options?: any): nodefs.ReadStream {
            return fs.createReadStream(this.raw, options);
        }

        createWriteStream(options?: any): nodefs.WriteStream {
            return fs.createWriteStream(this.raw, options);
        }

        open(
            flags?: string | number,
            mode?: string | number,
        ): Promise<nodefs.promises.FileHandle> {
            return fs.promises.open(this.raw, flags, mode);
        }

        openSync(flags?: string | number, mode?: string | number): number {
            return fs.openSync(this.raw, flags!, mode);
        }

        async copy(dest: string | PathNice, options?: any): Promise<PathNice> {
            dest = extract(dest);
            await copy(lowpath, fs, this.raw, dest, options);
            return n(dest);
        }

        copySync(dest: string | PathNice, options?: any): PathNice {
            dest = extract(dest);
            copySync(lowpath, fs, this.raw, dest, options);
            return n(dest);
        }

        async move(dest: string | PathNice, options?: any): Promise<PathNice> {
            dest = extract(dest);
            await move(lowpath, fs, this.raw, dest, options);
            return n(dest);
        }

        moveSync(dest: string | PathNice, options?: any): PathNice {
            dest = extract(dest);
            moveSync(lowpath, fs, this.raw, dest, options);
            return n(dest);
        }

        async rename(newPath: string | PathNice): Promise<PathNice> {
            newPath = extract(newPath);
            await fs.promises.rename(this.raw, newPath);
            return n(newPath);
        }

        renameSync(newPath: string | PathNice): PathNice {
            newPath = extract(newPath);
            fs.renameSync(this.raw, newPath);
            return n(newPath);
        }

        async remove(): Promise<PathNice> {
            await remove(fs, this.raw);
            return this;
        }

        removeSync(): PathNice {
            removeSync(fs, this.raw);
            return this;
        }

        async delete(): Promise<PathNice> {
            await remove(fs, this.raw);
            return this;
        }

        deleteSync(): PathNice {
            removeSync(fs, this.raw);
            return this;
        }

        async emptyDir(): Promise<PathNice> {
            await emptyDir(lowpath, fs, this.raw);
            return this;
        }

        emptyDirSync(): PathNice {
            emptyDirSync(lowpath, fs, this.raw);
            return this;
        }

        async ensureDir(options?: any): Promise<PathNice> {
            await ensureDir(fs, this.raw, options);
            return this;
        }

        ensureDirSync(options?: any): PathNice {
            ensureDirSync(fs, this.raw, options);
            return this;
        }

        async ensureFile(options?: any): Promise<PathNice> {
            await ensureFile(lowpath, fs, this.raw, options);
            return this;
        }

        ensureFileSync(options?: any): PathNice {
            ensureFileSync(lowpath, fs, this.raw, options);
            return this;
        }

        exists(): Promise<boolean> {
            return fs.promises.access(this.raw).then(
                () => true,
                () => false,
            );
        }

        existsSync(): boolean {
            try {
                fs.accessSync(this.raw);
                return true;
            } catch (e) {
                return false;
            }
        }

        async isEmptyDir(followlink?: boolean): Promise<boolean> {
            if (!(await this.isDir(followlink))) return false;
            try {
                const files = await fs.promises.readdir(this.raw);
                return files.length === 0;
            } catch {
                return false;
            }
        }

        isEmptyDirSync(followlink?: boolean): boolean {
            if (!this.isDirSync(followlink)) return false;
            try {
                const files = fs.readdirSync(this.raw);
                return files.length === 0;
            } catch {
                return false;
            }
        }

        async isDir(followlink?: boolean): Promise<boolean> {
            try {
                const stats = followlink
                    ? await fs.promises.stat(this.raw)
                    : await fs.promises.lstat(this.raw);
                return stats.isDirectory();
            } catch {
                return false;
            }
        }

        isDirSync(followlink?: boolean): boolean {
            try {
                const stats = followlink ? fs.statSync(this.raw) : fs.lstatSync(this.raw);
                return stats.isDirectory();
            } catch {
                return false;
            }
        }

        async isFile(followlink?: boolean): Promise<boolean> {
            try {
                const stats = followlink
                    ? await fs.promises.stat(this.raw)
                    : await fs.promises.lstat(this.raw);
                return stats.isFile();
            } catch {
                return false;
            }
        }

        isFileSync(followlink?: boolean): boolean {
            try {
                const stats = followlink ? fs.statSync(this.raw) : fs.lstatSync(this.raw);
                return stats.isFile();
            } catch {
                return false;
            }
        }

        async isSymbolicLink(): Promise<boolean> {
            try {
                const stats = await fs.promises.lstat(this.raw);
                return stats.isSymbolicLink();
            } catch {
                return false;
            }
        }

        isSymbolicLinkSync(): boolean {
            try {
                const stats = fs.lstatSync(this.raw);
                return stats.isSymbolicLink();
            } catch {
                return false;
            }
        }

        readdir(options?: any): any {
            return fs.promises.readdir(this.raw, options);
        }

        readdirSync(options?: any): any {
            return fs.readdirSync(this.raw, options);
        }

        async ls(
            recursive?: boolean,
            followLinks?: boolean,
        ): Promise<{ dirs: PathNiceArr; files: PathNiceArr }> {
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

            const readSingleLayer = async (dir: string) => {
                const entries = await fs.promises.readdir(dir, { withFileTypes: true });
                for (const entry of entries) {
                    const abs = lowpath.join(dir, entry.name);
                    const nice = n(abs);

                    let isDir = false;
                    if (followLinks && entry.isSymbolicLink()) {
                        const real = await fs.promises.realpath(abs);
                        const stats = await fs.promises.lstat(real);
                        if (stats.isDirectory()) isDir = true;
                    } else if (entry.isDirectory()) {
                        isDir = true;
                    }

                    if (isDir) {
                        dirs.push(nice);
                        if (recursive) await readSingleLayer(abs);
                    } else {
                        files.push(nice);
                    }
                }
            };

            await readSingleLayer(lowpath.normalize(thisAbs.raw));

            return { dirs, files };
        }

        lsSync(
            recursive?: boolean,
            followLinks?: boolean,
        ): { dirs: PathNiceArr; files: PathNiceArr } {
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

            const readSingleLayer = (dir: string) => {
                const entries = fs.readdirSync(dir, { withFileTypes: true });
                for (const entry of entries) {
                    const abs = lowpath.join(dir, entry.name);
                    const nice = n(abs);

                    let isDir = false;
                    if (followLinks && entry.isSymbolicLink()) {
                        const real = fs.realpathSync(abs);
                        const stats = fs.lstatSync(real);
                        if (stats.isDirectory()) isDir = true;
                    } else if (entry.isDirectory()) {
                        isDir = true;
                    }

                    if (isDir) {
                        dirs.push(nice);
                        if (recursive) readSingleLayer(abs);
                    } else {
                        files.push(nice);
                    }
                }
            };

            readSingleLayer(lowpath.normalize(thisAbs.raw));

            return { dirs, files };
        }

        watchFile(arg0: any, arg1?: any): nodefs.StatWatcher {
            return fs.watchFile(this.raw, arg0, arg1);
        }

        unwatchFile(listener?: (curr: nodefs.Stats, prev: nodefs.Stats) => void): void {
            return fs.unwatchFile(this.raw, listener);
        }

        watch(arg0?: any, arg1?: any): nodefs.FSWatcher {
            return fs.watch(this.raw, arg0, arg1);
        }

        watchWithChokidar(
            options?: chokidar.WatchOptions & { forceEvenDifferentFS?: boolean },
        ): chokidar.FSWatcher {
            if (fs !== nodefs && !options?.forceEvenDifferentFS) {
                throw new Error(
                    '[path-nice] .watchWithChokidar(): the underlying fs object being ' +
                        'used by the current path object is not the original node:fs ' +
                        'module, but chokidar can only use the original node:fs module. ' +
                        'If you are sure your operation makes sense, enable ' +
                        '`options.forceEvenDifferentFS` to ignore this error.',
                );
            }
            if (options) {
                delete options.forceEvenDifferentFS;
            }
            return chokidar.watch(this.raw, options);
        }

        async fileOwner(): Promise<{ uid: number; gid: number }> {
            const stats = await this.stat();
            return { uid: stats.uid as number, gid: stats.gid as number };
        }

        fileOwnerSync(): { uid: number; gid: number } {
            const stats = this.statSync()!;
            return { uid: stats.uid as number, gid: stats.gid as number };
        }

        async fileMode(): Promise<number> {
            const stats = await this.stat();
            return stats.mode as number;
        }

        fileModeSync(): number {
            const stats = this.statSync()!;
            return stats.mode as number;
        }

        async fileSize(): Promise<{
            B: number;
            KB: number;
            MB: number;
            GB: number;
            TB: number;
            PB: number;
        }> {
            // Number.MAX_SAFE_INTEGER bytes < 8PB
            const size = (await this.stat()).size as number;
            return {
                B: size,
                KB: size / 2 ** 10,
                MB: size / 2 ** 20,
                GB: size / 2 ** 30,
                TB: size / 2 ** 40,
                PB: size / 2 ** 50,
            };
        }

        fileSizeSync(): {
            B: number;
            KB: number;
            MB: number;
            GB: number;
            TB: number;
            PB: number;
        } {
            // Number.MAX_SAFE_INTEGER bytes < 8PB
            const size = this.statSync()!.size as number;
            return {
                B: size,
                KB: size / 2 ** 10,
                MB: size / 2 ** 20,
                GB: size / 2 ** 30,
                TB: size / 2 ** 40,
                PB: size / 2 ** 50,
            };
        }

        lstat(opts?: nodefs.StatOptions): Promise<nodefs.Stats | nodefs.BigIntStats> {
            return fs.promises.lstat(this.raw, opts);
        }

        lstatSync(
            opts?: nodefs.StatSyncOptions,
        ): nodefs.Stats | nodefs.BigIntStats | undefined {
            return fs.lstatSync(this.raw, opts);
        }

        stat(opts?: nodefs.StatOptions): Promise<nodefs.Stats | nodefs.BigIntStats> {
            return fs.promises.stat(this.raw, opts);
        }

        statSync(
            opts?: nodefs.StatSyncOptions,
        ): nodefs.Stats | nodefs.BigIntStats | undefined {
            return fs.statSync(this.raw, opts);
        }

        chmod(mode: string | number): Promise<void> {
            return fs.promises.chmod(this.raw, mode);
        }

        chmodSync(mode: string | number): void {
            return fs.chmodSync(this.raw, mode);
        }

        lchown(uid: number, gid: number): Promise<void> {
            return fs.promises.lchown(this.raw, uid, gid);
        }

        lchownSync(uid: number, gid: number): void {
            return fs.lchownSync(this.raw, uid, gid);
        }

        chown(uid: number, gid: number): Promise<void> {
            return fs.promises.chown(this.raw, uid, gid);
        }

        chownSync(uid: number, gid: number): void {
            return fs.chownSync(this.raw, uid, gid);
        }
    }

    class PathNiceArr extends Array<PathNice> {
        base?: PathNice;

        static _from(arr: Array<string | PathNice> | PathNiceArr): PathNiceArr {
            return new PathNiceArr(
                ...arr.map((p) => {
                    if (typeof p === 'string') return new PathNice(p);
                    return p;
                }),
            );
        }

        // ===============================================================================
        // File system related methods
        // ===============================================================================

        async copyToDir(destDir: string | PathNice, options?: any): Promise<PathNiceArr> {
            destDir = extract(destDir);
            const arr = await Promise.all(
                this.map((p) => {
                    if (this.base) {
                        const dest = p.toRelative(this.base).toAbsolute(destDir);
                        return p.copy(dest, options);
                    }
                    return p.copy(
                        lowpath.join(destDir as string, p.filename() as string),
                        options,
                    );
                }),
            );
            return PathNiceArr._from(arr as any);
        }

        copyToDirSync(destDir: string | PathNice, options?: any): PathNiceArr {
            destDir = extract(destDir);
            const arr = this.map((p) => {
                if (this.base) {
                    const dest = p.toRelative(this.base).toAbsolute(destDir);
                    return p.copySync(dest, options);
                }
                return p.copySync(
                    lowpath.join(destDir as string, p.filename() as string),
                    options,
                );
            });
            return PathNiceArr._from(arr as any);
        }

        async moveToDir(destDir: string | PathNice, options?: any): Promise<PathNiceArr> {
            destDir = extract(destDir);
            const arr = await Promise.all(
                this.map((p) => {
                    if (this.base) {
                        const dest = p.toRelative(this.base).toAbsolute(destDir);
                        return p.move(dest, options);
                    }
                    return p.move(
                        lowpath.join(destDir as string, p.filename() as string),
                        options,
                    );
                }),
            );
            return PathNiceArr._from(arr as any);
        }

        moveToDirSync(destDir: string | PathNice, options?: any): PathNiceArr {
            destDir = extract(destDir);
            const arr = this.map((p) => {
                if (this.base) {
                    const dest = p.toRelative(this.base).toAbsolute(destDir);
                    return p.moveSync(dest, options);
                }
                return p.moveSync(
                    lowpath.join(destDir as string, p.filename() as string),
                    options,
                );
            });
            return PathNiceArr._from(arr as any);
        }

        async remove(): Promise<PathNiceArr> {
            await Promise.all([this.map((p) => p.remove())]);
            return this;
        }

        removeSync(): PathNiceArr {
            this.forEach((p) => p.removeSync());
            return this;
        }

        async delete(): Promise<PathNiceArr> {
            await Promise.all([this.map((p) => p.remove())]);
            return this;
        }

        deleteSync(): PathNiceArr {
            this.forEach((p) => p.removeSync());
            return this;
        }

        watchWithChokidar(
            options?: chokidar.WatchOptions & { forceEvenDifferentFS?: boolean },
        ): chokidar.FSWatcher {
            if (fs !== nodefs && !options?.forceEvenDifferentFS) {
                throw new Error(
                    '[path-nice] .watchWithChokidar(): the underlying fs object being ' +
                        'used by the current path object is not the original node:fs ' +
                        'module, but chokidar can only use the original node:fs module. ' +
                        'If you are sure your operation makes sense, enable ' +
                        '`options.forceEvenDifferentFS` to ignore this error.',
                );
            }
            return chokidar.watch(
                this.map((p) => p.raw),
                options,
            );
        }

        // ===============================================================================
        // Array methods
        // ===============================================================================

        concat(...args: any[]): PathNiceArr {
            const arr = super.concat(...args) as PathNiceArr;
            arr.base = this.base;
            return arr;
        }

        reverse(): PathNiceArr {
            const arr = super.reverse() as PathNiceArr;
            arr.base = this.base;
            return arr;
        }

        slice(...args: any[]): PathNiceArr {
            const arr = super.slice(...args) as PathNiceArr;
            arr.base = this.base;
            return arr;
        }

        splice(...args: [any, any]): PathNiceArr {
            const arr = super.splice(...args) as PathNiceArr;
            arr.base = this.base;
            return arr;
        }

        filter(...args: [any, any]): PathNiceArr {
            const arr = super.filter(...args) as PathNiceArr;
            arr.base = this.base;
            return arr;
        }
    }

    class ParsedPathNice {
        constructor(private raw: ParsedPath) {}
        valueOf(): ParsedPath {
            return this.raw;
        }
        format(): PathNice {
            return new PathNice(lowpath.format(this.raw));
        }
        root(newRoot?: string): string | this {
            if (typeof newRoot === 'string') {
                this.raw.root = newRoot;
                return this;
            }
            return this.raw.root;
        }
        dir(newDir?: string): string | this {
            if (typeof newDir === 'string') {
                this.raw.dir = newDir;
                return this;
            }
            return this.raw.dir;
        }
        base(newBase?: string): string | this {
            if (typeof newBase === 'string') {
                this.raw.base = newBase;
                return this;
            }
            return this.raw.base;
        }
        ext(newExt?: string): string | this {
            if (typeof newExt === 'string') {
                this.raw.ext = newExt;
                return this;
            }
            return this.raw.ext;
        }
        name(newName?: string): string | this {
            if (typeof newName === 'string') {
                this.raw.name = newName;
                return this;
            }
            return this.raw.name;
        }
    }

    return { PathNice: PathNice as any, PathNiceArr: PathNiceArr as any };
}
