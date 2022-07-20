import { remove, removeSync } from './remove.js';
import { ensureDir, ensureDirSync } from './ensure.js';
export async function emptyDir(lowpath, fs, target) {
    let files;
    try {
        files = await fs.promises.readdir(target);
    }
    catch (e) {
        await ensureDir(fs, target);
        return;
    }
    await Promise.all(files.map((f) => {
        return remove(fs, lowpath.join(target, f));
    }));
}
export function emptyDirSync(lowpath, fs, target) {
    let files;
    try {
        files = fs.readdirSync(target);
    }
    catch (e) {
        ensureDirSync(fs, target);
        return;
    }
    files.forEach((f) => {
        removeSync(fs, lowpath.join(target, f));
    });
}
//# sourceMappingURL=empty-dir.js.map