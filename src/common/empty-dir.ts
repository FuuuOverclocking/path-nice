import type { FileSystem, PlatformPath } from './types.js';
import { remove } from './remove.js';

export async function emptyDir(path: PlatformPath, fs: FileSystem, target: string) {
    const files: string[] = await (fs.promises as any).readdir(target);
    await Promise.all(
        files.map((f) => {
            return remove(fs, path.join(target, f));
        }),
    );
}
