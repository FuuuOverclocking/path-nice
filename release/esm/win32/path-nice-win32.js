import * as nodepath from 'path';
import * as nodefs from 'fs';
const lowpath = nodepath.win32;
export class PathNiceWin32 {
    constructor(str, fs) {
        this.str = str;
        this.fs = fs || nodefs;
    }
}
//# sourceMappingURL=path-nice-win32.js.map