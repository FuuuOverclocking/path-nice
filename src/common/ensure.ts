import type { FileSystem, PlatformPath } from './types.js';

export async function ensureDir(
    fs: FileSystem,
    target: string,
    options?: {
        mode?: number | string | undefined;
    },
) {
    await fs.promises.mkdir(target, { recursive: true, ...options });
}

export function ensureFile(path: PlatformPath, fs: FileSystem, target: string) {
    return fs.promises.stat(target).then(
        (stats) => {
            if (stats.isFile()) return;
            throw new Error(
                '[path-nice] .ensureFile(): the path already exists and is not a file.',
            );
        },
        async () => {
            const dirname = path.dirname(target);
            let parentStats: any;
            try {
                parentStats = await fs.promises.stat(dirname);
            } catch (e: any) {
                if (e.code === 'ENOENT') {
                    await ensureDir(fs, dirname);
                    await fs.promises.writeFile(target, '', { encoding: 'utf-8' });
                    return;
                }
                throw e;
            }
            if (parentStats.isDirectory()) {
                await fs.promises.writeFile(target, '', { encoding: 'utf-8' });
            } else {
                throw new Error(
                    `[path-nice] .ensureFile: ${dirname} already exists and is not a directory.`,
                );
            }
        },
    );
}
