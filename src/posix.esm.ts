import {
    pathPosix,
    PathNice,
    ParsedPathNice,
    PathNicePosix,
    PathNiceWin32,
} from './path.js';
import type {
    Path,
    PathPosix,
    PathWin32,
    FileSystem,
    ParsedPath,
    FormatInputPathObject,
    PlatformPath,
} from './common/types.js';

export default pathPosix;

// prettier-ignore
const {
    delimiter, sep, posix, win32,
    basename, dirname, extname, format, isAbsolute, join, normalize, parse,
    relative, resolve, toNamespacedPath,
} = pathPosix;

// prettier-ignore
export {
    delimiter, sep, posix, win32,
    basename, dirname, extname, format, isAbsolute, join, normalize, parse,
    relative, resolve, toNamespacedPath,
};

export { PathNice, ParsedPathNice, PathNicePosix, PathNiceWin32 };

export type {
    Path,
    PathPosix,
    PathWin32,
    FileSystem,
    ParsedPath,
    FormatInputPathObject,
    PlatformPath,
};
