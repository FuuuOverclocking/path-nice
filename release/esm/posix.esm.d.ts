import { pathPosix, PathNice, ParsedPathNice, PathNicePosix, PathNiceWin32 } from './path.js';
import type { Path, PathPosix, PathWin32, FileSystem, ParsedPath, FormatInputPathObject, PlatformPath } from './common/types.js';
export default pathPosix;
declare const delimiter: string, sep: string, posix: PathPosix, win32: PathWin32, basename: (p: string, ext?: string | undefined) => string, dirname: (p: string) => string, extname: (p: string) => string, format: (pP: FormatInputPathObject) => string, isAbsolute: (p: string) => boolean, join: (...paths: string[]) => string, normalize: (p: string) => string, parse: (p: string) => ParsedPath, relative: (from: string, to: string) => string, resolve: (...pathSegments: string[]) => string, toNamespacedPath: (path: string) => string;
export { delimiter, sep, posix, win32, basename, dirname, extname, format, isAbsolute, join, normalize, parse, relative, resolve, toNamespacedPath, };
export { PathNice, ParsedPathNice, PathNicePosix, PathNiceWin32 };
export type { Path, PathPosix, PathWin32, FileSystem, ParsedPath, FormatInputPathObject, PlatformPath, };
