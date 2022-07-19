import type { FileSystem, PlatformPath } from '../types.js';
import { remove, removeSync } from './remove.js';
import { ensureDir, ensureDirSync } from './ensure.js';

export async function emptyDir(lowpath: PlatformPath, fs: FileSystem, target: string) {
    let files!: string[];
    try {
        files = await (fs.promises as any).readdir(target);
    } catch (e) {
        await ensureDir(fs, target);
        return;
    }
    await Promise.all(
        files.map((f) => {
            return remove(fs, lowpath.join(target, f));
        }),
    );
}

export function emptyDirSync(lowpath: PlatformPath, fs: FileSystem, target: string) {
    let files!: string[];
    try {
        files = fs.readdirSync(target);
    } catch (e) {
        ensureDirSync(fs, target);
        return;
    }
    files.forEach((f) => {
        removeSync(fs, lowpath.join(target, f));
    });
}
