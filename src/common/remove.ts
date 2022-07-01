import type { FileSystem, PlatformPath } from './types.js';

export async function remove(
    fs: FileSystem,
    target: string,
): Promise<void> {
    if ((fs.promises as any).rm) {
        return (fs.promises as any).rm(target, { recursive: true, force: true });
    }

    const { lstat, rmdir, unlink } = fs.promises;
    
    const stats = await lstat(target);

    if (stats.isDirectory()) {
        await rmdir(target, { recursive: true });
        return;
    }

    await unlink(target);
}
