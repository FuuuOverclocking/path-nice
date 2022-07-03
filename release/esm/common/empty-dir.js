import { remove } from './remove.js';
export async function emptyDir(path, fs, target) {
    const files = await fs.promises.readdir(target);
    await Promise.all(files.map((f) => {
        return remove(fs, path.join(target, f));
    }));
}
//# sourceMappingURL=empty-dir.js.map