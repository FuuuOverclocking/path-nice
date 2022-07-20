/// <reference types="node" />
import { pathPosix } from './path.js';
import type { PathNice, PathNiceArr } from './path.js';
export type { ParsedPathNice, FileSystem, ParsedPath, FormatInputPathObject, PlatformPath, } from './path.js';
export default pathPosix;
declare const delimiter: ";" | ":", sep: "/" | "\\", posix: typeof import("./core/types.js").path, win32: typeof import("./core/types.js").path, PathNice: any, PathNiceArr: any, basename: (p: string, ext?: string | undefined) => string, dirname: (p: string) => string, extname: (p: string) => string, format: (pathString: import("path").FormatInputPathObject) => string, isAbsolute: (p: string) => boolean, join: (...paths: string[]) => string, normalize: (p: string) => string, parse: (pathString: string) => import("path").ParsedPath, relative: (from: string, to: string) => string, resolve: (...pathSegments: string[]) => string, toNamespacedPath: (path: string) => string;
export { delimiter, sep, posix, win32, PathNice, PathNiceArr, basename, dirname, extname, format, isAbsolute, join, normalize, parse, relative, resolve, toNamespacedPath, };
