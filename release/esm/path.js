import nodepath from 'path';
import nodefs from 'fs';
import { genPathWithCache } from './core/path.js';
export const path = genPathWithCache(nodepath, nodefs);
export const pathPosix = genPathWithCache(nodepath.posix, nodefs);
export const pathWin32 = genPathWithCache(nodepath.win32, nodefs);
//# sourceMappingURL=path.js.map