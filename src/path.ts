import { path, PathNice, ParsedPathNice } from './platform/path.js';
import { pathPosix, PathNicePosix } from './posix/path.js';
import { pathWin32, PathNiceWin32 } from './win32/path.js';

(path as any).posix = pathPosix;
(path as any).win32 = pathWin32;
(path as any).PathNice = PathNice;
(path as any).PathNicePosix = PathNicePosix;
(path as any).PathNiceWin32 = PathNiceWin32;

(pathPosix as any).posix = pathPosix;
(pathPosix as any).win32 = pathWin32;
(pathPosix as any).PathNice = PathNice;
(pathPosix as any).PathNicePosix = PathNicePosix;
(pathPosix as any).PathNiceWin32 = PathNiceWin32;

(pathWin32 as any).posix = pathPosix;
(pathWin32 as any).win32 = pathWin32;
(pathWin32 as any).PathNice = PathNice;
(pathWin32 as any).PathNicePosix = PathNicePosix;
(pathWin32 as any).PathNiceWin32 = PathNiceWin32;

export { path, PathNice, ParsedPathNice };
export { pathPosix, PathNicePosix };
export { pathWin32, PathNiceWin32 };
