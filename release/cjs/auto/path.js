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
exports.path = exports.ParsedPathNice = exports.PathNice = void 0;
const nodepath = __importStar(require("path"));
const path_nice_js_1 = require("./path-nice.js");
Object.defineProperty(exports, "PathNice", { enumerable: true, get: function () { return path_nice_js_1.PathNice; } });
Object.defineProperty(exports, "ParsedPathNice", { enumerable: true, get: function () { return path_nice_js_1.ParsedPathNice; } });
const path_js_1 = require("../posix/path.js");
const path_js_2 = require("../win32/path.js");
const lowpath = nodepath;
exports.path = ((...paths) => {
    if (paths.length === 1) {
        if (typeof paths[0] === 'string')
            return new path_nice_js_1.PathNice(paths[0]);
        return paths[0];
    }
    if (paths.length !== 0) {
        const _paths = paths.map((p) => (typeof p === 'string' ? p : p.raw));
        return new path_nice_js_1.PathNice(lowpath.join(..._paths));
    }
    return new path_nice_js_1.PathNice('.');
});
for (const [k, v] of Object.entries(lowpath)) {
    if (typeof v === 'function') {
        exports.path[k] = v.bind(lowpath);
    }
    else {
        exports.path[k] = v;
    }
}
exports.path.posix = path_js_1.pathPosix;
exports.path.win32 = path_js_2.pathWin32;
exports.path.PathNice = path_nice_js_1.PathNice;
exports.path.PathNicePosix = path_js_1.PathNicePosix;
exports.path.PathNiceWin32 = path_js_2.PathNiceWin32;
//# sourceMappingURL=path.js.map