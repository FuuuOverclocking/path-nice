import { pathPosix } from './posix/path.js';

export default pathPosix;

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
} = pathPosix;

// prettier-ignore
export {
    delimiter, sep, posix, win32,
    basename, dirname, extname, format, isAbsolute, join, normalize, parse,
    relative, resolve, toNamespacedPath,
    PathNice, PathNicePosix, PathNiceWin32
};
