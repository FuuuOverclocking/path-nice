import { copy, copySync } from './copy.js';
import { remove, removeSync } from './remove.js';
export async function move(path, fs, src, dest, options) {
    const { dirname, parse, resolve, sep } = path;
    const { mkdir, rename, stat } = fs.promises;
    options = options || {};
    const overwrite = options.overwrite || false;
    const stats = await checkPaths(src, dest, options);
    const { srcStat, isChangingCase = false } = stats;
    await checkParentPaths(src, srcStat, dest);
    if (isParentRoot(dest))
        return doRename(src, dest, overwrite, isChangingCase);
    await mkdir(dirname(dest), { recursive: true });
    return doRename(src, dest, overwrite, isChangingCase);
    function isParentRoot(dest) {
        const parent = path.dirname(dest);
        const parsedPath = path.parse(parent);
        return parsedPath.root === parent;
    }
    function doRename(src, dest, overwrite, isChangingCase) {
        if (isChangingCase)
            return _rename(src, dest, overwrite);
        if (overwrite) {
            return remove(fs, dest).then(() => _rename(src, dest, overwrite));
        }
        return pathExists(dest).then((destExists) => {
            if (destExists)
                throw new Error('[path-nice] .move(): dest already exists.');
            return _rename(src, dest, overwrite);
        });
    }
    function pathExists(dest) {
        return stat(dest).then(() => true, (err) => (err.code === 'ENOENT' ? false : Promise.reject(err)));
    }
    async function _rename(src, dest, overwrite) {
        try {
            await rename(src, dest);
        }
        catch (err) {
            if (err.code !== 'EXDEV')
                throw err;
            await moveAcrossDevice(src, dest, overwrite);
        }
    }
    async function moveAcrossDevice(src, dest, overwrite) {
        await copy(path, fs, src, dest, {
            force: overwrite,
            errorOnExist: true,
        });
        await remove(fs, src);
    }
    async function checkPaths(src, dest, opts) {
        const stats = await getStats(src, dest, opts);
        const { 0: srcStat, 1: destStat } = stats;
        if (destStat) {
            if (areIdentical(srcStat, destStat)) {
                const srcBaseName = path.basename(src);
                const destBaseName = path.basename(dest);
                if (srcBaseName !== destBaseName &&
                    srcBaseName.toLowerCase() === destBaseName.toLowerCase()) {
                    return { srcStat, destStat, isChangingCase: true };
                }
                throw new Error('[path-nice] .move(): src and dest must not be the same.');
            }
            if (srcStat.isDirectory() && !destStat.isDirectory()) {
                throw new Error(`[path-nice] .move(): cannot overwrite non-directory ${dest} with directory ${src}.`);
            }
            if (!srcStat.isDirectory() && destStat.isDirectory()) {
                throw new Error(`[path-nice] .move(): cannot overwrite directory '${dest}' with non-directory '${src}'.`);
            }
        }
        if (srcStat.isDirectory() && isSrcSubdir(src, dest)) {
            throw new Error(`[path-nice] .move(): cannot move ${src} to a subdirectory of self ${dest}`);
        }
        return { srcStat, destStat };
    }
    function getStats(src, dest, options) {
        const statFunc = (file) => stat(file, { bigint: true });
        return Promise.all([
            statFunc(src),
            statFunc(dest).catch((err) => {
                if (err.code === 'ENOENT')
                    return null;
                throw err;
            }),
        ]);
    }
    function areIdentical(srcStat, destStat) {
        return (destStat.ino != null &&
            destStat.dev != null &&
            destStat.ino === srcStat.ino &&
            destStat.dev === srcStat.dev);
    }
    function normalizePathToArray(path) {
        return resolve(path).split(sep).filter(Boolean);
    }
    // Return true if dest is a subdir of src, otherwise false.
    // It only checks the path strings.
    function isSrcSubdir(src, dest) {
        const srcArr = normalizePathToArray(src);
        const destArr = normalizePathToArray(dest);
        return srcArr.every((cur, i) => destArr[i] === cur);
    }
    // Recursively check if dest parent is a subdirectory of src.
    // It works for all file types including symlinks since it
    // checks the src and dest inodes. It starts from the deepest
    // parent and stops once it reaches the src parent or the root path.
    async function checkParentPaths(src, srcStat, dest) {
        const srcParent = resolve(dirname(src));
        const destParent = resolve(dirname(dest));
        if (destParent === srcParent || destParent === parse(destParent).root) {
            return;
        }
        let destStat;
        try {
            destStat = (await stat(destParent, { bigint: true }));
        }
        catch (err) {
            if (err.code === 'ENOENT')
                return;
            throw err;
        }
        if (areIdentical(srcStat, destStat)) {
            throw new Error(`[path-nice] .move(): cannot copy ${src} to a subdirectory of self ${dest}`);
        }
        return checkParentPaths(src, srcStat, destParent);
    }
}
export function moveSync(path, fs, src, dest, options) {
    const { dirname, parse, resolve, sep } = path;
    const { mkdirSync, renameSync, statSync } = fs;
    options = options || {};
    const overwrite = options.overwrite || false;
    const stats = checkPaths(src, dest, options);
    const { srcStat, isChangingCase = false } = stats;
    checkParentPaths(src, srcStat, dest);
    if (isParentRoot(dest))
        return doRename(src, dest, overwrite, isChangingCase);
    mkdirSync(dirname(dest), { recursive: true });
    return doRename(src, dest, overwrite, isChangingCase);
    function isParentRoot(dest) {
        const parent = path.dirname(dest);
        const parsedPath = path.parse(parent);
        return parsedPath.root === parent;
    }
    function doRename(src, dest, overwrite, isChangingCase) {
        if (isChangingCase)
            return _rename(src, dest, overwrite);
        if (overwrite) {
            remove(fs, dest);
            return _rename(src, dest, overwrite);
        }
        const destExists = pathExists(dest);
        if (destExists)
            throw new Error('[path-nice] .moveSync(): dest already exists.');
        return _rename(src, dest, overwrite);
    }
    function pathExists(dest) {
        try {
            statSync(dest);
            return true;
        }
        catch (err) {
            if (err.code === 'ENOENT')
                return false;
            throw err;
        }
    }
    function _rename(src, dest, overwrite) {
        try {
            renameSync(src, dest);
        }
        catch (err) {
            if (err.code !== 'EXDEV')
                throw err;
            moveAcrossDevice(src, dest, overwrite);
        }
    }
    function moveAcrossDevice(src, dest, overwrite) {
        copySync(path, fs, src, dest, {
            force: overwrite,
            errorOnExist: true,
        });
        removeSync(fs, src);
    }
    function checkPaths(src, dest, opts) {
        const stats = getStats(src, dest, opts);
        const { 0: srcStat, 1: destStat } = stats;
        if (destStat) {
            if (areIdentical(srcStat, destStat)) {
                const srcBaseName = path.basename(src);
                const destBaseName = path.basename(dest);
                if (srcBaseName !== destBaseName &&
                    srcBaseName.toLowerCase() === destBaseName.toLowerCase()) {
                    return { srcStat, destStat, isChangingCase: true };
                }
                throw new Error('[path-nice] .moveSync(): src and dest must not be the same.');
            }
            if (srcStat.isDirectory() && !destStat.isDirectory()) {
                throw new Error(`[path-nice] .moveSync(): cannot overwrite non-directory ${dest} ` +
                    `with directory ${src}.`);
            }
            if (!srcStat.isDirectory() && destStat.isDirectory()) {
                throw new Error(`[path-nice] .moveSync(): cannot overwrite directory '${dest}' with ` +
                    `non-directory '${src}'.`);
            }
        }
        if (srcStat.isDirectory() && isSrcSubdir(src, dest)) {
            throw new Error(`[path-nice] .moveSync(): cannot move ${src} to a subdirectory of self ${dest}`);
        }
        return { srcStat, destStat };
    }
    function getStats(src, dest, options) {
        const statFunc = (file) => statSync(file, { bigint: true });
        const result = [statFunc(src)];
        try {
            result.push(statFunc(dest));
        }
        catch (err) {
            if (err.code === 'ENOENT')
                result.push(null);
            throw err;
        }
        return result;
    }
    function areIdentical(srcStat, destStat) {
        return (destStat.ino != null &&
            destStat.dev != null &&
            destStat.ino === srcStat.ino &&
            destStat.dev === srcStat.dev);
    }
    function normalizePathToArray(path) {
        return resolve(path).split(sep).filter(Boolean);
    }
    // Return true if dest is a subdir of src, otherwise false.
    // It only checks the path strings.
    function isSrcSubdir(src, dest) {
        const srcArr = normalizePathToArray(src);
        const destArr = normalizePathToArray(dest);
        return srcArr.every((cur, i) => destArr[i] === cur);
    }
    // Recursively check if dest parent is a subdirectory of src.
    // It works for all file types including symlinks since it
    // checks the src and dest inodes. It starts from the deepest
    // parent and stops once it reaches the src parent or the root path.
    function checkParentPaths(src, srcStat, dest) {
        const srcParent = resolve(dirname(src));
        const destParent = resolve(dirname(dest));
        if (destParent === srcParent || destParent === parse(destParent).root) {
            return;
        }
        let destStat;
        try {
            destStat = statSync(destParent, { bigint: true });
        }
        catch (err) {
            if (err.code === 'ENOENT')
                return;
            throw err;
        }
        if (areIdentical(srcStat, destStat)) {
            throw new Error(`[path-nice] .moveSync(): cannot copy ${src} to a subdirectory of ` +
                `self ${dest}`);
        }
        return checkParentPaths(src, srcStat, destParent);
    }
}
//# sourceMappingURL=move.js.map