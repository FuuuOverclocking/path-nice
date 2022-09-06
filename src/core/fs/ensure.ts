import type { FileSystem, PlatformPath } from '../types.js';

export type EnsureDirOptions = {
    mode?: number | string | undefined;
};

export type EnsureFileOptions = {
    fileMode?: number | string | undefined;
    dirMode?: number | string | undefined;
};

export async function ensureDir(
    fs: FileSystem,
    target: string,
    options?: EnsureDirOptions,
) {
    await fs.promises.mkdir(target, { recursive: true, ...options });
}

export function ensureDirSync(
    fs: FileSystem,
    target: string,
    options?: EnsureDirOptions,
) {
    fs.mkdirSync(target, { recursive: true, ...options });
}

export async function ensureFile(
    path: PlatformPath,
    fs: FileSystem,
    target: string,
    options?: EnsureFileOptions,
): Promise<void> {
    let stats: any;
    try {
        stats = await fs.promises.stat(target);
    } catch (_) {
        const dirname = path.dirname(target);
        let parentStats: any;
        try {
            parentStats = await fs.promises.stat(dirname);
        } catch (e: any) {
            if (e.code === 'ENOENT') {
                await ensureDir(fs, dirname, { mode: options?.dirMode });
                await fs.promises.writeFile(target, '', {
                    encoding: 'utf-8',
                    mode: options?.fileMode,
                });
                return;
            }
            throw e;
        }
        if (parentStats.isDirectory()) {
            await fs.promises.writeFile(target, '', {
                encoding: 'utf-8',
                mode: options?.fileMode,
            });
            return;
        } else {
            throw new Error(
                `[path-nice] .ensureFile(): ${dirname} already exists and is not a directory.`,
            );
        }
    }
    if (stats.isFile()) return;
    throw new Error(
        '[path-nice] .ensureFile(): the path already exists and is not a file.',
    );
}

export function ensureFileSync(
    path: PlatformPath,
    fs: FileSystem,
    target: string,
    options?: EnsureFileOptions,
): void {
    let stats: any;
    try {
        stats = fs.statSync(target);
    } catch (_) {
        const dirname = path.dirname(target);
        let parentStats: any;
        try {
            parentStats = fs.statSync(dirname);
        } catch (e: any) {
            if (e.code === 'ENOENT') {
                ensureDirSync(fs, dirname, { mode: options?.dirMode });
                fs.writeFileSync(target, '', {
                    encoding: 'utf-8',
                    mode: options?.fileMode,
                });
                return;
            }
            throw e;
        }
        if (parentStats.isDirectory()) {
            fs.writeFileSync(target, '', { encoding: 'utf-8', mode: options?.fileMode });
            return;
        } else {
            throw new Error(
                `[path-nice] .ensureFileSync(): ${dirname} already exists and is not ` +
                    `a directory.`,
            );
        }
    }

    if (stats.isFile()) return;
    throw new Error(
        '[path-nice] .ensureFileSync(): the path already exists and is not a file.',
    );
}
