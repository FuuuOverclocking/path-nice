import * as nodepath from 'path';
import * as nodefs from 'fs';
const lowpath = nodepath.posix;
export class PathNicePosix {
    constructor(str, fs) {
        this.raw = str;
        this.fs = fs || nodefs;
    }
    _new(str) {
        return new PathNicePosix(str, this.fs);
    }
    join(...paths) {
        return this._new(lowpath.join(this.raw, ...paths));
    }
}
//# sourceMappingURL=path-nice-posix.js.map