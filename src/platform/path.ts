import * as nodepath from 'path';
import type { Path } from '../common/types.js';
import { PathNice, ParsedPathNice } from './path-nice.js';

const lowpath = nodepath;

export { PathNice, ParsedPathNice };

export const path = ((...paths: Array<string | PathNice>) => {
    if (paths.length === 1) {
        if (typeof paths[0] === 'string') return new PathNice(paths[0]);
        return paths[0];
    }
    if (paths.length !== 0) {
        const _paths = paths.map((p) => (typeof p === 'string' ? p : p.raw));
        return new PathNice(lowpath.join(..._paths));
    }
    return new PathNice('.');
}) as Path;

for (const [k, v] of Object.entries(lowpath)) {
    if (typeof v === 'function') {
        (path as any)[k] = v.bind(lowpath);
    } else {
        (path as any)[k] = v;
    }
}
