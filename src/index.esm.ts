import { path } from './path.js';
import type { PathNice, PathNiceArr } from './path.js';
export type {
    ParsedPathNice,
    FileSystem,
    ParsedPath,
    FormatInputPathObject,
    PlatformPath,
} from './path.js';

export default path;

// prettier-ignore
const {
    delimiter, sep, posix, win32, PathNice, PathNiceArr,
    basename, dirname, extname, format, isAbsolute, join, normalize, parse,
    relative, resolve, toNamespacedPath,
} = path;

// prettier-ignore
export {
    delimiter, sep, posix, win32, PathNice, PathNiceArr,
    basename, dirname, extname, format, isAbsolute, join, normalize, parse,
    relative, resolve, toNamespacedPath,
};
