"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureFile = exports.ensureDir = void 0;
async function ensureDir(fs, target, options) {
    await fs.promises.mkdir(target, { recursive: true, ...options });
}
exports.ensureDir = ensureDir;
function ensureFile(path, fs, target) {
    return fs.promises.stat(target).then((stats) => {
        if (stats.isFile())
            return;
        throw new Error('[path-nice] .ensureFile(): the path already exists and is not a file.');
    }, async () => {
        const dirname = path.dirname(target);
        let parentStats;
        try {
            parentStats = await fs.promises.stat(dirname);
        }
        catch (e) {
            if (e.code === 'ENOENT') {
                await ensureDir(fs, dirname);
                await fs.promises.writeFile(target, '', { encoding: 'utf-8' });
                return;
            }
            throw e;
        }
        if (parentStats.isDirectory()) {
            await fs.promises.writeFile(target, '', { encoding: 'utf-8' });
        }
        else {
            throw new Error(`[path-nice] .ensureFile: ${dirname} already exists and is not a directory.`);
        }
    });
}
exports.ensureFile = ensureFile;
//# sourceMappingURL=ensure.js.map