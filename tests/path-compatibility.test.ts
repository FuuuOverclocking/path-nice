import nodepath from 'path';
import path from '../build/cjs/index.cjs.js';

test('props are equal to the original', () => {
    [
        [path, nodepath],
        [path.posix, nodepath.posix],
        [path.win32, nodepath.win32],
    ].forEach(([path, nodepath]) => {
        expect(path.sep).toBe(nodepath.sep);
        expect(path.delimiter).toBe(nodepath.delimiter);

        // functions of nodepath do not depend on `this`
        expect(path.basename).toBe(nodepath.basename);
        expect(path.dirname).toBe(nodepath.dirname);
        expect(path.extname).toBe(nodepath.extname);
        expect(path.format).toBe(nodepath.format);
        expect(path.isAbsolute).toBe(nodepath.isAbsolute);
        expect(path.join).toBe(nodepath.join);
        expect(path.normalize).toBe(nodepath.normalize);
        expect(path.parse).toBe(nodepath.parse);
        expect(path.relative).toBe(nodepath.relative);
        expect(path.resolve).toBe(nodepath.resolve);
        expect(path.toNamespacedPath).toBe(nodepath.toNamespacedPath);
    });
});
