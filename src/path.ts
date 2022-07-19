import nodepath from 'path';
import nodefs from 'fs';
import { genPathWithCache } from './core/path.js';

export const path = genPathWithCache(nodepath, nodefs);
export const pathPosix = genPathWithCache(nodepath.posix, nodefs);
export const pathWin32 = genPathWithCache(nodepath.win32, nodefs);

export type {
    PathNice,
    PathNiceArr,
    ParsedPathNice,
    FileSystem,
    PlatformPath,
    ParsedPath,
    FormatInputPathObject,
} from './core/types.js';
