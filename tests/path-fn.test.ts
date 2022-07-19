import { fs as memfs } from 'memfs';
import path from '../build/cjs/index.cjs.js';

test('path(): return type', () => {
    [path, path.posix, path.win32].forEach((path) => {
        expect(() => (path as any)()).toThrowError();

        const p = path('foo.txt');
        expect(p).toBeInstanceOf(path.PathNice);
        expect(path(p)).toBeInstanceOf(path.PathNice);

        const pp = ['foo.txt', path('bar.md')] as const;
        expect(path(...pp)).toBeInstanceOf(path.PathNiceArr);
        expect(path(pp)).toBeInstanceOf(path.PathNiceArr);
        expect(path(path(pp))).toBeInstanceOf(path.PathNiceArr);
    });
});

test('path.bindFS()', () => {
    [path, path.posix, path.win32].forEach((path) => {
        const _path = path.bindFS(memfs as any);

        _path('/foo.txt').writeFileSync('test');
        expect(_path('/foo.txt').readFileToStringSync()).toBe('test');

        const { dirs, files } = _path('/').lsSync();
        expect(dirs.length).toBe(0);
        expect(files.length).toBe(1);
        expect(files[0].separator('/').raw).toBe('/foo.txt');
    });
});
