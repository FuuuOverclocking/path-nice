import nodepath from 'path';
import path from '../build/cjs/index.cjs.js';

test('member variables are equal to the original', () => {
    expect(path.sep).toBe(nodepath.sep);
    expect(path.delimiter).toBe(nodepath.delimiter);

    expect(path.posix.sep).toBe(nodepath.posix.sep);
    expect(path.posix.delimiter).toBe(nodepath.posix.delimiter);

    expect(path.win32.sep).toBe(nodepath.win32.sep);
    expect(path.win32.delimiter).toBe(nodepath.win32.delimiter);
});
