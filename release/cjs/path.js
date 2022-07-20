"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pathWin32 = exports.pathPosix = exports.path = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const path_js_1 = require("./core/path.js");
exports.path = (0, path_js_1.genPathWithCache)(path_1.default, fs_1.default);
exports.pathPosix = (0, path_js_1.genPathWithCache)(path_1.default.posix, fs_1.default);
exports.pathWin32 = (0, path_js_1.genPathWithCache)(path_1.default.win32, fs_1.default);
//# sourceMappingURL=path.js.map