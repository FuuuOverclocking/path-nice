import * as nodepath from 'path';
import { PathNiceWin32 } from './path-nice-win32.js';
import { PathNice } from '../auto/path.js';
import { pathPosix, PathNicePosix } from '../posix/path.js';
const lowpath = nodepath;
export { PathNiceWin32 };
// prettier-ignore
export const pathWin32 = ((str, fs) => str
    ? new PathNiceWin32(str, fs)
    : new PathNiceWin32(process.cwd(), fs));
for (const [k, v] of Object.entries(lowpath)) {
    if (typeof v === 'function') {
        pathWin32[k] = v.bind(lowpath);
    }
    else {
        pathWin32[k] = v;
    }
}
pathWin32.posix = pathPosix;
pathWin32.win32 = pathWin32;
pathWin32.PathNice = PathNice;
pathWin32.PathNicePosix = PathNicePosix;
pathWin32.PathNiceWin32 = PathNiceWin32;
//# sourceMappingURL=path.js.map