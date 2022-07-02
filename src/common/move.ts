import type { BigIntStats } from 'fs';
import type { FileSystem, PlatformPath } from './types.js';
import { copy } from './copy.js';
import { remove } from './remove.js';

// This file is a modified version of the fs-extra's move method.
// https://github.com/jprichardson/node-fs-extra/blob/master/lib/move/move.js

type MoveOptions = {
    overwrite?: boolean | null | undefined;
};

export async function move(
    path: PlatformPath,
    fs: FileSystem,
    src: string,
    dest: string,
    options?: MoveOptions | null,
) {
    const { dirname, parse, resolve, sep } = path;
    const { mkdir, rename, stat } = fs.promises;

    options = options || {};

    const overwrite = options.overwrite || false;
    const stats = await checkPaths(src, dest, options);
    const { srcStat, isChangingCase = false } = stats;
    await checkParentPaths(src, srcStat, dest);

    if (isParentRoot(dest)) return doRename(src, dest, overwrite, isChangingCase);
    await mkdir(dirname(dest), { recursive: true });
    return doRename(src, dest, overwrite, isChangingCase);

    function isParentRoot(dest: string) {
        const parent = path.dirname(dest);
        const parsedPath = path.parse(parent);
        return parsedPath.root === parent;
    }

    function doRename(
        src: string,
        dest: string,
        overwrite: boolean,
        isChangingCase: boolean,
    ): Promise<void> {
        if (isChangingCase) return _rename(src, dest, overwrite);
        if (overwrite) {
            return remove(fs, dest).then(() => _rename(src, dest, overwrite));
        }
        return pathExists(dest).then((destExists) => {
            if (destExists) throw new Error('dest already exists.');
            return _rename(src, dest, overwrite);
        });
    }

    function pathExists(dest: string): Promise<boolean> {
        return stat(dest).then(
            () => true,
            (err) => (err.code === 'ENOENT' ? false : Promise.reject(err)),
        );
    }

    async function _rename(src: string, dest: string, overwrite: boolean): Promise<void> {
        try {
            await rename(src, dest);
        } catch (err: any) {
            if (err.code !== 'EXDEV') throw err;
            await moveAcrossDevice(src, dest, overwrite);
        }
    }

    async function moveAcrossDevice(src: string, dest: string, overwrite: boolean) {
        await copy(path, fs, src, dest, {
            force: overwrite,
            errorOnExist: true,
        });
        await remove(fs, src);
    }

    async function checkPaths(src: string, dest: string, opts: MoveOptions) {
        const stats = await getStats(src, dest, opts);
        const { 0: srcStat, 1: destStat } = stats;

        if (destStat) {
            if (areIdentical(srcStat, destStat)) {
                const srcBaseName = path.basename(src);
                const destBaseName = path.basename(dest);
                if (
                    srcBaseName !== destBaseName &&
                    srcBaseName.toLowerCase() === destBaseName.toLowerCase()
                ) {
                    return { srcStat, destStat, isChangingCase: true };
                }
                throw new Error(
                    '[path-nice] .moveTo: src and dest must not be the same.',
                );
            }
            if (srcStat.isDirectory() && !destStat.isDirectory()) {
                throw new Error(
                    `[path-nice] .moveTo: cannot overwrite non-directory ${dest} with directory ${src}.`,
                );
            }
            if (!srcStat.isDirectory() && destStat.isDirectory()) {
                throw new Error(
                    `[path-nice] .moveTo: cannot overwrite directory '${dest}' with non-directory '${src}'.`,
                );
            }
        }

        if (srcStat.isDirectory() && isSrcSubdir(src, dest)) {
            throw new Error(
                `[path-nice] .moveTo: cannot move ${src} to a subdirectory of self ${dest}`,
            );
        }
        return { srcStat, destStat };
    }

    function getStats(
        src: string,
        dest: string,
        options: MoveOptions,
    ): Promise<[BigIntStats, BigIntStats | null]> {
        const statFunc = (file: string) => stat(file, { bigint: true });
        return Promise.all([
            statFunc(src),
            statFunc(dest).catch((err) => {
                if (err.code === 'ENOENT') return null;
                throw err;
            }),
        ]) as Promise<[BigIntStats, BigIntStats | null]>;
    }

    function areIdentical(srcStat: BigIntStats, destStat: BigIntStats): boolean {
        return (
            destStat.ino != null &&
            destStat.dev != null &&
            destStat.ino === srcStat.ino &&
            destStat.dev === srcStat.dev
        );
    }

    function normalizePathToArray(path: string): string[] {
        return resolve(path).split(sep).filter(Boolean);
    }

    // Return true if dest is a subdir of src, otherwise false.
    // It only checks the path strings.
    function isSrcSubdir(src: string, dest: string): boolean {
        const srcArr = normalizePathToArray(src);
        const destArr = normalizePathToArray(dest);

        return srcArr.every((cur, i) => destArr[i] === cur);
    }

    // Recursively check if dest parent is a subdirectory of src.
    // It works for all file types including symlinks since it
    // checks the src and dest inodes. It starts from the deepest
    // parent and stops once it reaches the src parent or the root path.
    async function checkParentPaths(
        src: string,
        srcStat: BigIntStats,
        dest: string,
    ): Promise<void> {
        const srcParent = resolve(dirname(src));
        const destParent = resolve(dirname(dest));
        if (destParent === srcParent || destParent === parse(destParent).root) {
            return;
        }
        let destStat: BigIntStats;
        try {
            destStat = (await stat(destParent, { bigint: true })) as BigIntStats;
        } catch (err: any) {
            if (err.code === 'ENOENT') return;
            throw err;
        }
        if (areIdentical(srcStat, destStat)) {
            throw new Error(
                `[path-nice] .moveTo: cannot copy ${src} to a subdirectory of self ${dest}`,
            );
        }
        return checkParentPaths(src, srcStat, destParent);
    }
}
