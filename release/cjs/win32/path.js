"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pathWin32 = exports.PathNiceWin32 = void 0;
const nodepath = __importStar(require("path"));
const path_nice_win32_js_1 = require("./path-nice-win32.js");
Object.defineProperty(exports, "PathNiceWin32", { enumerable: true, get: function () { return path_nice_win32_js_1.PathNiceWin32; } });
const path_js_1 = require("../auto/path.js");
const path_js_2 = require("../posix/path.js");
const lowpath = nodepath;
// prettier-ignore
exports.pathWin32 = ((str, fs) => str
    ? new path_nice_win32_js_1.PathNiceWin32(str, fs)
    : new path_nice_win32_js_1.PathNiceWin32(process.cwd(), fs));
for (const [k, v] of Object.entries(lowpath)) {
    if (typeof v === 'function') {
        exports.pathWin32[k] = v.bind(lowpath);
    }
    else {
        exports.pathWin32[k] = v;
    }
}
exports.pathWin32.posix = path_js_2.pathPosix;
exports.pathWin32.win32 = exports.pathWin32;
exports.pathWin32.PathNice = path_js_1.PathNice;
exports.pathWin32.PathNicePosix = path_js_2.PathNicePosix;
exports.pathWin32.PathNiceWin32 = path_nice_win32_js_1.PathNiceWin32;
//# sourceMappingURL=path.js.map