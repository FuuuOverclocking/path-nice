import * as nodepath from 'path';
import * as nodefs from 'fs';
const lowpath = nodepath.posix;
export class PathNicePosix {
    constructor(path, fs) {
        this.raw = path;
        this.fs = fs || nodefs;
    }
    _new(str) {
        return new PathNicePosix(str, this.fs);
    }
    join(...paths) {
        const _paths = paths.map((p) => (typeof p === 'string' ? p : p.raw));
        return this._new(lowpath.join(this.raw, ..._paths));
    }
}
//# sourceMappingURL=path-nice-posix.js.map