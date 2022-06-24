import * as nodepath from 'path';
import { PathNice } from './path-nice.js';
import type { Path } from './types.js';

export type { Path };

// prettier-ignore
export const path = (
    (str?: string, forceSep?: '/' | '\\', fs?: Path.FileSystem) =>
        str
            ? new PathNice(str, forceSep, fs)
            : new PathNice(process.cwd(), forceSep, fs)
) as Path;

for (const [k, v] of Object.entries(nodepath)) {
    if (typeof v === 'function') {
        (path as any)[k] = v.bind(nodepath);
    } else {
        (path as any)[k] = v;
    }
}
