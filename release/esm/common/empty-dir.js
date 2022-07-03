import { remove } from './remove.js';
import { ensureDir } from './ensure.js';
export async function emptyDir(path, fs, target) {
    let files;
    try {
        files = await fs.promises.readdir(target);
    }
    catch (e) {
        await ensureDir(fs, target);
        return;
    }
    await Promise.all(files.map((f) => {
        return remove(fs, path.join(target, f));
    }));
}
//# sourceMappingURL=empty-dir.js.map