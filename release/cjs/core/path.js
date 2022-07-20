"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.genPath = exports.genPathWithCache = void 0;
const path_nice_impl_js_1 = require("./path-nice-impl.js");
const util_js_1 = require("./util.js");
const cache = new Map();
function genPathWithCache(lowpath, fs) {
    let map = cache.get(lowpath);
    if (!map) {
        map = new Map();
        cache.set(lowpath, map);
    }
    let path = map.get(fs);
    if (!path) {
        path = genPath(lowpath, fs);
        map.set(fs, path);
    }
    return path;
}
exports.genPathWithCache = genPathWithCache;
function genPath(lowpath, fs) {
    const { PathNice: _PathNice, PathNiceArr: _PathNiceArr } = (0, path_nice_impl_js_1.genPathNice)(lowpath, fs);
    function path(...args) {
        if (args.length === 1) {
            if (!Array.isArray(args[0]))
                return _PathNice._from(args[0]);
            return _PathNiceArr._from(args[0]);
        }
        if (args.length > 1)
            return _PathNiceArr._from(args);
        throw new Error('[path-nice] path(): One or more arguments must be provided.');
    }
    path.bindFS = (fs) => genPathWithCache(lowpath, fs);
    // Lazy override. Avoid falling into infinite recursion.
    (0, util_js_1.defineLazyOverride)(path, 'posix', () => genPathWithCache(lowpath.posix, fs), {
        configurable: false,
        enumerable: true,
    });
    (0, util_js_1.defineLazyOverride)(path, 'win32', () => genPathWithCache(lowpath.win32, fs), {
        configurable: false,
        enumerable: true,
    });
    path.PathNice = _PathNice;
    path.PathNiceArr = _PathNiceArr;
    // No need to bind. All methods of `path` do not use `this`.
    // Assign values manually one by one, otherwise the JSDoc will not be inherited.
    path.normalize = lowpath.normalize;
    path.join = lowpath.join;
    path.resolve = lowpath.resolve;
    path.isAbsolute = lowpath.isAbsolute;
    path.relative = lowpath.relative;
    path.dirname = lowpath.dirname;
    path.basename = lowpath.basename;
    path.extname = lowpath.extname;
    path.sep = lowpath.sep;
    path.delimiter = lowpath.delimiter;
    path.parse = lowpath.parse;
    path.format = lowpath.format;
    path.toNamespacedPath = lowpath.toNamespacedPath;
    return path;
}
exports.genPath = genPath;
//# sourceMappingURL=path.js.map