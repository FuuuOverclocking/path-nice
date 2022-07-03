export async function remove(fs, target) {
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
//# sourceMappingURL=remove.js.map