import { path, PathNice, ParsedPathNice, PathNicePosix, PathNiceWin32 } from './path.js';
import type { Path, PathPosix, PathWin32, FileSystem, ParsedPath, FormatInputPathObject, PlatformPath } from './common/types.js';
/** @category 🌟 */
export default path;
declare const delimiter: string, sep: string, posix: PathPosix, win32: PathWin32, basename: (p: string, ext?: string | undefined) => string, dirname: (p: string) => string, extname: (p: string) => string, format: (pP: FormatInputPathObject) => string, isAbsolute: (p: string) => boolean, join: (...paths: string[]) => string, normalize: (p: string) => string, parse: (p: string) => ParsedPath, relative: (from: string, to: string) => string, resolve: (...pathSegments: string[]) => string, toNamespacedPath: (path: string) => string;
/** @category 🌟 */
export { posix, win32 };
export { delimiter, sep, basename, dirname, extname, format, isAbsolute, join, normalize, parse, relative, resolve, toNamespacedPath, };
/** @category 🌟 */
export { PathNice, PathNicePosix, PathNiceWin32 };
export { ParsedPathNice };
/** @category 🌟 */
export type { Path, PathPosix, PathWin32 };
export type { FileSystem, ParsedPath, FormatInputPathObject, PlatformPath };
