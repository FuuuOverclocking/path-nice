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
exports.PathNicePosix = void 0;
const nodepath = __importStar(require("path"));
const nodefs = __importStar(require("fs"));
const lowpath = nodepath.posix;
class PathNicePosix {
    constructor(str, fs) {
        this.raw = str;
        this.fs = fs || nodefs;
    }
    _new(str) {
        return new PathNicePosix(str, this.fs);
    }
    join(...paths) {
        return this._new(lowpath.join(this.raw, ...paths));
    }
}
exports.PathNicePosix = PathNicePosix;
//# sourceMappingURL=path-nice-posix.js.map