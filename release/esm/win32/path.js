import * as nodepath from 'path';
import { PathNiceWin32 } from './path-nice-win32.js';
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
//# sourceMappingURL=path.js.map