import path from 'path';
import pathnice from '../build/cjs/index.cjs.js';

test('path.sep equals original one', () => {
    expect(pathnice.sep).toBe(path.sep);
});
