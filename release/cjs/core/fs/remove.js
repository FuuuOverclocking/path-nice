"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeSync = exports.remove = void 0;
async function remove(fs, target) {
    if (fs.promises.rm) {
        return fs.promises.rm(target, { recursive: true, force: true });
    }
    const { lstat, rmdir, unlink } = fs.promises;
    const stats = await lstat(target);
    if (stats.isDirectory()) {
        await rmdir(target, { recursive: true });
        return;
    }
    await unlink(target);
}
exports.remove = remove;
function removeSync(fs, target) {
    if (fs.rm) {
        return fs.rmSync(target, { recursive: true, force: true });
    }
    const { lstatSync, rmdirSync, unlinkSync } = fs;
    const stats = lstatSync(target);
    if (stats.isDirectory()) {
        rmdirSync(target, { recursive: true });
        return;
    }
    unlinkSync(target);
}
exports.removeSync = removeSync;
//# sourceMappingURL=remove.js.map