import { path, PathNice, ParsedPathNice } from './auto/path.js';
import { PathNicePosix } from './posix/path.js';
import { PathNiceWin32 } from './win32/path.js';
/** @category 🌟 */
export default path;
// prettier-ignore
const { delimiter, sep, posix, win32, basename, dirname, extname, format, isAbsolute, join, normalize, parse, relative, resolve, toNamespacedPath, } = path;
/** @category 🌟 */
export { posix, win32 };
// prettier-ignore
export { delimiter, sep, basename, dirname, extname, format, isAbsolute, join, normalize, parse, relative, resolve, toNamespacedPath, };
//# sourceMappingURL=index.esm.js.map