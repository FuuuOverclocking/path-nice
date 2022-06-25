import * as nodepath from 'path';
import type { FileSystem, PathPosix } from '../common/types.js';
import { PathNicePosix } from './path-nice-posix.js';
import { PathNice } from '../auto/path.js';
import { pathWin32, PathNiceWin32 } from '../win32/path.js';

const lowpath = nodepath;

export { PathNicePosix };

// prettier-ignore
export const pathPosix = (
    (str?: string, fs?: FileSystem) =>
        str
            ? new PathNicePosix(str, fs)
            : new PathNicePosix(process.cwd(), fs)
) as PathPosix;

for (const [k, v] of Object.entries(lowpath)) {
    if (typeof v === 'function') {
        (pathPosix as any)[k] = v.bind(lowpath);
    } else {
        (pathPosix as any)[k] = v;
    }
}

(pathPosix as any).posix = pathPosix;
(pathPosix as any).win32 = pathWin32;
(pathPosix as any).PathNice = PathNice;
(pathPosix as any).PathNicePosix = PathNicePosix;
(pathPosix as any).PathNiceWin32 = PathNiceWin32;
