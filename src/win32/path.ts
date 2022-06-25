import * as nodepath from 'path';
import type { FileSystem, PathWin32 } from '../common/types.js';
import { PathNiceWin32 } from './path-nice-win32.js';
import { PathNice } from '../auto/path.js';
import { pathPosix, PathNicePosix } from '../posix/path.js';

const lowpath = nodepath;

export { PathNiceWin32 };

// prettier-ignore
export const pathWin32 = (
    (str?: string, fs?: FileSystem) =>
        str
            ? new PathNiceWin32(str, fs)
            : new PathNiceWin32(process.cwd(), fs)
) as PathWin32;

for (const [k, v] of Object.entries(lowpath)) {
    if (typeof v === 'function') {
        (pathWin32 as any)[k] = v.bind(lowpath);
    } else {
        (pathWin32 as any)[k] = v;
    }
}

(pathWin32 as any).posix = pathPosix;
(pathWin32 as any).win32 = pathWin32;
(pathWin32 as any).PathNice = PathNice;
(pathWin32 as any).PathNicePosix = PathNicePosix;
(pathWin32 as any).PathNiceWin32 = PathNiceWin32;
