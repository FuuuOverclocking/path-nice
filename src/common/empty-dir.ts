import type { FileSystem, PlatformPath } from './types.js';
import { remove } from './remove.js';
import { ensureDir } from './ensure.js';

export async function emptyDir(path: PlatformPath, fs: FileSystem, target: string) {
    let files!: string[];
    try {
        files = await (fs.promises as any).readdir(target);
    } catch (e) {
        await ensureDir(fs, target);
        return;
    }
    await Promise.all(
        files.map((f) => {
            return remove(fs, path.join(target, f));
        }),
    );
}
