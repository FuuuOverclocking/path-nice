import type { FileSystem, PlatformPath } from '../types.js';

// This file is a modified version of the fs's cp method.
// https://github.com/nodejs/node/blob/main/lib/internal/fs/cp/cp.js

type CopyOptions =
    | {
          force?: boolean | null | undefined;
          dereference?: boolean | null | undefined;
          errorOnExist?: boolean | null | undefined;
          filter?: ((src: string, dest: string) => boolean) | null | undefined;
          preserveTimestamps?: boolean | null | undefined;
          recursive?: boolean | null | undefined;
          verbatimSymlinks?: boolean | null | undefined;
      }
    | undefined
    | null;

export async function copy(
    path: PlatformPath,
    fs: FileSystem,
    src: string,
    dest: string,
    options?: CopyOptions,
): Promise<void> {
    const { dirname, isAbsolute, join, parse, resolve, sep } = path;
    const {
        chmod,
        copyFile,
        lstat,
        mkdir,
        readdir,
        readlink,
        stat,
        symlink,
        unlink,
        utimes,
    } = fs.promises;

    options ??= {};
    options.recursive ??= true;

    // Warn about using preserveTimestamps on 32-bit node
    if (options.preserveTimestamps && process.arch === 'ia32') {
        const warning =
            'Using the preserveTimestamps option in 32-bit ' + 'node is not recommended';
        process.emitWarning(warning, 'TimestampPrecisionWarning');
    }
    const stats = await checkPaths(src, dest, options);
    const { srcStat, destStat } = stats;
    await checkParentPaths(src, srcStat, dest);
    if (options.filter) {
        return handleFilter(checkParentDir, destStat, src, dest, options);
    }
    return checkParentDir(destStat, src, dest, options);

    async function checkPaths(src: string, dest: string, opts?: CopyOptions) {
        const { 0: srcStat, 1: destStat } = await getStats(src, dest, opts);
        if (destStat) {
            if (areIdentical(srcStat, destStat)) {
                throw new Error(`[path-nice] .copyTo: src and dest cannot be the same`);
            }
            if (srcStat.isDirectory() && !destStat.isDirectory()) {
                throw new Error(
                    `[path-nice] .copyTo: cannot overwrite directory ${src} ` +
                        `with non-directory ${dest}`,
                );
            }
            if (!srcStat.isDirectory() && destStat.isDirectory()) {
                throw new Error(
                    `[path-nice] .copyTo: cannot overwrite non-directory ${src} ` +
                        `with directory ${dest}`,
                );
            }
        }

        if (srcStat.isDirectory() && isSrcSubdir(src, dest)) {
            throw new Error(
                `[path-nice] .copyTo: cannot copy ${src} to a subdirectory of self ${dest}`,
            );
        }
        return { srcStat, destStat };
    }

    function areIdentical(srcStat: any, destStat: any) {
        return (
            destStat.ino &&
            destStat.dev &&
            destStat.ino === srcStat.ino &&
            destStat.dev === srcStat.dev
        );
    }

    function getStats(src: string, dest: string, opts: CopyOptions) {
        const statFunc = opts?.dereference
            ? (file: string) => stat(file, { bigint: true })
            : (file: string) => lstat(file, { bigint: true });
        return Promise.all([
            statFunc(src),
            statFunc(dest).catch((err) => {
                if (err.code === 'ENOENT') return null;
                throw err;
            }),
        ]);
    }

    async function checkParentDir(destStat: any, src: any, dest: any, opts: any) {
        const destParent = dirname(dest);
        const dirExists = await pathExists(destParent);
        if (dirExists) return getStatsForCopy(destStat, src, dest, opts);
        await mkdir(destParent, { recursive: true });
        return getStatsForCopy(destStat, src, dest, opts);
    }

    function pathExists(dest: any) {
        return stat(dest).then(
            () => true,
            (err) => (err.code === 'ENOENT' ? false : Promise.reject(err)),
        );
    }

    // Recursively check if dest parent is a subdirectory of src.
    // It works for all file types including symlinks since it
    // checks the src and dest inodes. It starts from the deepest
    // parent and stops once it reaches the src parent or the root path.
    async function checkParentPaths(src: any, srcStat: any, dest: any): Promise<any> {
        const srcParent = resolve(dirname(src));
        const destParent = resolve(dirname(dest));
        if (destParent === srcParent || destParent === parse(destParent).root) {
            return;
        }
        let destStat;
        try {
            destStat = await stat(destParent, { bigint: true });
        } catch (err: any) {
            if (err.code === 'ENOENT') return;
            throw err;
        }
        if (areIdentical(srcStat, destStat)) {
            throw new Error(
                `[path-nice] .copyTo: cannot copy ${src} to a subdirectory of self ${dest}`,
            );
        }
        return checkParentPaths(src, srcStat, destParent);
    }

    function normalizePathToArray(path: string) {
        return resolve(path).split(sep).filter(Boolean);
    }

    // Return true if dest is a subdir of src, otherwise false.
    // It only checks the path strings.
    function isSrcSubdir(src: string, dest: string) {
        const srcArr = normalizePathToArray(src);
        const destArr = normalizePathToArray(dest);

        return srcArr.every((cur, i) => destArr[i] === cur);
    }

    async function handleFilter(
        onInclude: any,
        destStat: any,
        src: any,
        dest: any,
        opts: any,
    ) {
        const include = await opts.filter(src, dest);
        if (include) return onInclude(destStat, src, dest, opts);
    }

    function startCopy(destStat: any, src: any, dest: any, opts: any) {
        if (opts.filter) {
            return handleFilter(getStatsForCopy, destStat, src, dest, opts);
        }
        return getStatsForCopy(destStat, src, dest, opts);
    }

    async function getStatsForCopy(destStat: any, src: any, dest: any, opts: any) {
        const statFn = opts.dereference ? stat : lstat;
        const srcStat = await statFn(src);
        if (srcStat.isDirectory() && opts.recursive) {
            return onDir(srcStat, destStat, src, dest, opts);
        } else if (srcStat.isDirectory()) {
            throw new Error(`[path-nice] .copyTo: ${src} is a directory (not copied)`);
        } else if (
            srcStat.isFile() ||
            srcStat.isCharacterDevice() ||
            srcStat.isBlockDevice()
        ) {
            return onFile(srcStat, destStat, src, dest, opts);
        } else if (srcStat.isSymbolicLink()) {
            return onLink(destStat, src, dest, opts);
        } else if (srcStat.isSocket()) {
            throw new Error(`[path-nice] .copyTo: cannot copy a socket file: ${dest}`);
        } else if (srcStat.isFIFO()) {
            throw new Error(`[path-nice] .copyTo: cannot copy a FIFO pipe: ${dest}`);
        }
        throw new Error(`[path-nice] .copyTo: cannot copy an unknown file type: ${dest}`);
    }

    function onFile(srcStat: any, destStat: any, src: any, dest: any, opts: any) {
        if (!destStat) return _copyFile(srcStat, src, dest, opts);
        return mayCopyFile(srcStat, src, dest, opts);
    }

    async function mayCopyFile(srcStat: any, src: any, dest: any, opts: any) {
        if (opts.force) {
            await unlink(dest);
            return _copyFile(srcStat, src, dest, opts);
        } else if (opts.errorOnExist) {
            throw new Error(`[path-nice] .copyTo: ${dest} already exists`);
        }
    }

    async function _copyFile(srcStat: any, src: any, dest: any, opts: any) {
        await copyFile(src, dest);
        if (opts.preserveTimestamps) {
            return handleTimestampsAndMode(srcStat.mode, src, dest);
        }
        return setDestMode(dest, srcStat.mode);
    }

    async function handleTimestampsAndMode(srcMode: any, src: any, dest: any) {
        // Make sure the file is writable before setting the timestamp
        // otherwise open fails with EPERM when invoked with 'r+'
        // (through utimes call)
        if (fileIsNotWritable(srcMode)) {
            await makeFileWritable(dest, srcMode);
            return setDestTimestampsAndMode(srcMode, src, dest);
        }
        return setDestTimestampsAndMode(srcMode, src, dest);
    }

    function fileIsNotWritable(srcMode: any) {
        return (srcMode & 0o200) === 0;
    }

    function makeFileWritable(dest: any, srcMode: any) {
        return setDestMode(dest, srcMode | 0o200);
    }

    async function setDestTimestampsAndMode(srcMode: any, src: any, dest: any) {
        await setDestTimestamps(src, dest);
        return setDestMode(dest, srcMode);
    }

    function setDestMode(dest: any, srcMode: any) {
        return chmod(dest, srcMode);
    }

    async function setDestTimestamps(src: any, dest: any) {
        // The initial srcStat.atime cannot be trusted
        // because it is modified by the read(2) system call
        // (See https://nodejs.org/api/fs.html#fs_stat_time_values)
        const updatedSrcStat = await stat(src);
        return utimes(dest, updatedSrcStat.atime, updatedSrcStat.mtime);
    }

    function onDir(srcStat: any, destStat: any, src: any, dest: any, opts: any) {
        if (!destStat) return mkDirAndCopy(srcStat.mode, src, dest, opts);
        return copyDir(src, dest, opts);
    }

    async function mkDirAndCopy(srcMode: any, src: any, dest: any, opts: any) {
        await mkdir(dest);
        await copyDir(src, dest, opts);
        return setDestMode(dest, srcMode);
    }

    async function copyDir(src: any, dest: any, opts: any) {
        const dir: any = await (readdir as any)(src, { withFileTypes: true });

        for (const { name } of dir) {
            const srcItem = join(src, name);
            const destItem = join(dest, name);
            const { destStat } = await checkPaths(srcItem, destItem, opts);
            await startCopy(destStat, srcItem, destItem, opts);
        }
    }

    async function onLink(destStat: any, src: any, dest: any, opts: any) {
        let resolvedSrc = (await readlink(src)) as string;
        if (!opts.verbatimSymlinks && !isAbsolute(resolvedSrc)) {
            resolvedSrc = resolve(dirname(src), resolvedSrc);
        }
        if (!destStat) {
            return symlink(resolvedSrc, dest);
        }
        let resolvedDest;
        try {
            resolvedDest = (await readlink(dest)) as string;
        } catch (err: any) {
            // Dest exists and is a regular file or directory,
            // Windows may throw UNKNOWN error. If dest already exists,
            // fs throws error anyway, so no need to guard against it here.
            if (err.code === 'EINVAL' || err.code === 'UNKNOWN') {
                return symlink(resolvedSrc, dest);
            }
            throw err;
        }
        if (!isAbsolute(resolvedDest)) {
            resolvedDest = resolve(dirname(dest), resolvedDest);
        }
        if (isSrcSubdir(resolvedSrc, resolvedDest)) {
            throw new Error(
                `[path-nice] .copyTo: cannot copy ${resolvedSrc} to a subdirectory of self ` +
                    `${resolvedDest}`,
            );
        }
        // Do not copy if src is a subdir of dest since unlinking
        // dest in this case would result in removing src contents
        // and therefore a broken symlink would be created.
        const srcStat = await stat(src);
        if (srcStat.isDirectory() && isSrcSubdir(resolvedDest, resolvedSrc)) {
            throw new Error(
                `[path-nice] .copyTo: cannot overwrite ${resolvedDest} with ${resolvedSrc}`,
            );
        }
        return copyLink(resolvedSrc, dest);
    }

    async function copyLink(resolvedSrc: any, dest: any) {
        await unlink(dest);
        return symlink(resolvedSrc, dest);
    }
}
