"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emptyDirSync = exports.emptyDir = void 0;
const remove_js_1 = require("./remove.js");
const ensure_js_1 = require("./ensure.js");
async function emptyDir(lowpath, fs, target) {
    let files;
    try {
        files = await fs.promises.readdir(target);
    }
    catch (e) {
        await (0, ensure_js_1.ensureDir)(fs, target);
        return;
    }
    await Promise.all(files.map((f) => {
        return (0, remove_js_1.remove)(fs, lowpath.join(target, f));
    }));
}
exports.emptyDir = emptyDir;
function emptyDirSync(lowpath, fs, target) {
    let files;
    try {
        files = fs.readdirSync(target);
    }
    catch (e) {
        (0, ensure_js_1.ensureDirSync)(fs, target);
        return;
    }
    files.forEach((f) => {
        (0, remove_js_1.removeSync)(fs, lowpath.join(target, f));
    });
}
exports.emptyDirSync = emptyDirSync;
//# sourceMappingURL=empty-dir.js.map