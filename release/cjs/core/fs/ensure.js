"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureFileSync = exports.ensureFile = exports.ensureDirSync = exports.ensureDir = void 0;
async function ensureDir(fs, target, options) {
    await fs.promises.mkdir(target, { recursive: true, ...options });
}
exports.ensureDir = ensureDir;
function ensureDirSync(fs, target, options) {
    fs.mkdirSync(target, { recursive: true, ...options });
}
exports.ensureDirSync = ensureDirSync;
async function ensureFile(path, fs, target, options) {
    let stats;
    try {
        stats = await fs.promises.stat(target);
    }
    catch (_) {
        const dirname = path.dirname(target);
        let parentStats;
        try {
            parentStats = await fs.promises.stat(dirname);
        }
        catch (e) {
            if (e.code === 'ENOENT') {
                await ensureDir(fs, dirname, { mode: options === null || options === void 0 ? void 0 : options.dirMode });
                await fs.promises.writeFile(target, '', {
                    encoding: 'utf-8',
                    mode: options === null || options === void 0 ? void 0 : options.fileMode,
                });
                return;
            }
            throw e;
        }
        if (parentStats.isDirectory()) {
            await fs.promises.writeFile(target, '', {
                encoding: 'utf-8',
                mode: options === null || options === void 0 ? void 0 : options.fileMode,
            });
        }
        else {
            throw new Error(`[path-nice] .ensureFile(): ${dirname} already exists and is not a directory.`);
        }
    }
    if (stats.isFile())
        return;
    throw new Error('[path-nice] .ensureFile(): the path already exists and is not a file.');
}
exports.ensureFile = ensureFile;
function ensureFileSync(path, fs, target, options) {
    let stats;
    try {
        stats = fs.statSync(target);
    }
    catch (_) {
        const dirname = path.dirname(target);
        let parentStats;
        try {
            parentStats = fs.statSync(dirname);
        }
        catch (e) {
            if (e.code === 'ENOENT') {
                ensureDirSync(fs, dirname, { mode: options === null || options === void 0 ? void 0 : options.dirMode });
                fs.writeFileSync(target, '', {
                    encoding: 'utf-8',
                    mode: options === null || options === void 0 ? void 0 : options.fileMode,
                });
                return;
            }
            throw e;
        }
        if (parentStats.isDirectory()) {
            fs.writeFileSync(target, '', { encoding: 'utf-8', mode: options === null || options === void 0 ? void 0 : options.fileMode });
        }
        else {
            throw new Error(`[path-nice] .ensureFileSync(): ${dirname} already exists and is not ` +
                `a directory.`);
        }
    }
    if (stats.isFile())
        return;
    throw new Error('[path-nice] .ensureFileSync(): the path already exists and is not a file.');
}
exports.ensureFileSync = ensureFileSync;
//# sourceMappingURL=ensure.js.map