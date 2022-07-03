import * as nodepath from 'path';
import { PathNice, ParsedPathNice } from './path-nice.js';
import { pathPosix, PathNicePosix } from '../posix/path.js';
import { pathWin32, PathNiceWin32 } from '../win32/path.js';
const lowpath = nodepath;
export { PathNice, ParsedPathNice };
export const path = ((...paths) => {
    if (paths.length === 1) {
        if (typeof paths[0] === 'string')
            return new PathNice(paths[0]);
        return paths[0];
    }
    if (paths.length !== 0) {
        const _paths = paths.map((p) => (typeof p === 'string' ? p : p.raw));
        return new PathNice(lowpath.join(..._paths));
    }
    return new PathNice('.');
});
for (const [k, v] of Object.entries(lowpath)) {
    if (typeof v === 'function') {
        path[k] = v.bind(lowpath);
    }
    else {
        path[k] = v;
    }
}
path.posix = pathPosix;
path.win32 = pathWin32;
path.PathNice = PathNice;
path.PathNicePosix = PathNicePosix;
path.PathNiceWin32 = PathNiceWin32;
//# sourceMappingURL=path.js.map