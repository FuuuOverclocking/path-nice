import * as nodepath from 'path';
import type { Path } from '../common/types.js';
import { PathNice } from './path-nice.js';
import { pathPosix, PathNicePosix } from '../posix/path.js';
import { pathWin32, PathNiceWin32 } from '../win32/path.js';

const lowpath = nodepath;

export { PathNice };

export const path = ((path?: string | PathNice) => {
    if (typeof path === 'string') return new PathNice(path);
    if (!path) return new PathNice('.');
    return path;
}) as Path;

for (const [k, v] of Object.entries(lowpath)) {
    if (typeof v === 'function') {
        (path as any)[k] = v.bind(lowpath);
    } else {
        (path as any)[k] = v;
    }
}

(path as any).posix = pathPosix;
(path as any).win32 = pathWin32;
(path as any).PathNice = PathNice;
(path as any).PathNicePosix = PathNicePosix;
(path as any).PathNiceWin32 = PathNiceWin32;
