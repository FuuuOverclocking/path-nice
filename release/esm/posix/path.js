import * as nodepath from 'path';
import { PathNicePosix } from './path-nice-posix.js';
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
//# sourceMappingURL=path.js.map