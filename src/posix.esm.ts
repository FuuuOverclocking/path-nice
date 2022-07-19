import { pathPosix } from './path.js';
import type { PathNice, PathNiceArr } from './path.js';
export type {
    ParsedPathNice,
    FileSystem,
    ParsedPath,
    FormatInputPathObject,
    PlatformPath,
} from './path.js';

export default pathPosix;

// prettier-ignore
const {
    delimiter, sep, posix, win32, PathNice, PathNiceArr,
    basename, dirname, extname, format, isAbsolute, join, normalize, parse,
    relative, resolve, toNamespacedPath,
} = pathPosix;

// prettier-ignore
export {
    delimiter, sep, posix, win32, PathNice, PathNiceArr,
    basename, dirname, extname, format, isAbsolute, join, normalize, parse,
    relative, resolve, toNamespacedPath,
};
