"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emptyDir = void 0;
const remove_js_1 = require("./remove.js");
const ensure_js_1 = require("./ensure.js");
async function emptyDir(path, fs, target) {
    let files;
    try {
        files = await fs.promises.readdir(target);
    }
    catch (e) {
        await (0, ensure_js_1.ensureDir)(fs, target);
        return;
    }
    await Promise.all(files.map((f) => {
        return (0, remove_js_1.remove)(fs, path.join(target, f));
    }));
}
exports.emptyDir = emptyDir;
//# sourceMappingURL=empty-dir.js.map