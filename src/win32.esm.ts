import { pathWin32 } from './win32/path.js';

export default pathWin32;

export {
    FileSystem,
    ParsedPath,
    FormatInputPathObject,
    PlatformPath,
} from './common/types.js';

// prettier-ignore
const {
    delimiter, sep, posix, win32,
    basename, dirname, extname, format, isAbsolute, join, normalize, parse,
    relative, resolve, toNamespacedPath,
    PathNice, PathNicePosix, PathNiceWin32
} = pathWin32;

// prettier-ignore
export {
    delimiter, sep, posix, win32,
    basename, dirname, extname, format, isAbsolute, join, normalize, parse,
    relative, resolve, toNamespacedPath,
    PathNice, PathNicePosix, PathNiceWin32
};
