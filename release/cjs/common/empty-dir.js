"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emptyDir = void 0;
const remove_js_1 = require("./remove.js");
async function emptyDir(path, fs, target) {
    const files = await fs.promises.readdir(target);
    await Promise.all(files.map((f) => {
        return (0, remove_js_1.remove)(fs, path.join(target, f));
    }));
}
exports.emptyDir = emptyDir;
//# sourceMappingURL=empty-dir.js.map