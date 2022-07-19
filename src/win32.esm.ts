import { pathWin32 } from './path.js';
import type { PathNice, PathNiceArr } from './path.js';
export type {
    ParsedPathNice,
    FileSystem,
    ParsedPath,
    FormatInputPathObject,
    PlatformPath,
} from './path.js';

export default pathWin32;

// prettier-ignore
const {
    delimiter, sep, posix, win32, PathNice, PathNiceArr,
    basename, dirname, extname, format, isAbsolute, join, normalize, parse,
    relative, resolve, toNamespacedPath,
} = pathWin32;

// prettier-ignore
export {
    delimiter, sep, posix, win32, PathNice, PathNiceArr,
    basename, dirname, extname, format, isAbsolute, join, normalize, parse,
    relative, resolve, toNamespacedPath,
};
