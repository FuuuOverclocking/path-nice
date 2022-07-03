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
exports.pathPosix = exports.PathNicePosix = void 0;
const nodepath = __importStar(require("path"));
const path_nice_posix_js_1 = require("./path-nice-posix.js");
Object.defineProperty(exports, "PathNicePosix", { enumerable: true, get: function () { return path_nice_posix_js_1.PathNicePosix; } });
const lowpath = nodepath;
// prettier-ignore
exports.pathPosix = ((str, fs) => str
    ? new path_nice_posix_js_1.PathNicePosix(str, fs)
    : new path_nice_posix_js_1.PathNicePosix(process.cwd(), fs));
for (const [k, v] of Object.entries(lowpath)) {
    if (typeof v === 'function') {
        exports.pathPosix[k] = v.bind(lowpath);
    }
    else {
        exports.pathPosix[k] = v;
    }
}
//# sourceMappingURL=path.js.map