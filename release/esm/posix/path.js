import * as nodepath from 'path';
import { PathNicePosix } from './path-nice-posix.js';
import { PathNice } from '../auto/path.js';
import { pathWin32, PathNiceWin32 } from '../win32/path.js';
const lowpath = nodepath;
export { PathNicePosix };
// prettier-ignore
export const pathPosix = ((str, fs) => str
    ? new PathNicePosix(str, fs)
    : new PathNicePosix(process.cwd(), fs));
for (const [k, v] of Object.entries(lowpath)) {
    if (typeof v === 'function') {
        pathPosix[k] = v.bind(lowpath);
    }
    else {
        pathPosix[k] = v;
    }
}
pathPosix.posix = pathPosix;
pathPosix.win32 = pathWin32;
pathPosix.PathNice = PathNice;
pathPosix.PathNicePosix = PathNicePosix;
pathPosix.PathNiceWin32 = PathNiceWin32;
//# sourceMappingURL=path.js.map