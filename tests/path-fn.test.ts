import nodepath from 'path';
import path from '../build/cjs/index.cjs.js';


test('path() should return the correct type', () => {
    expect(() => (path as any)()).toThrowError();

    expect(path('foo.txt')).toBeInstanceOf(path.PathNice);
    expect(path(path('foo.txt'))).toBeInstanceOf(path.PathNice);
    expect(path('foo.txt', path('bar.md'))).toBeInstanceOf(path.PathNiceArr);
    expect(path(['foo.txt', 'bar.md'])).toBeInstanceOf(path.PathNiceArr);
    expect(path(path(['foo.txt', 'bar.md']))).toBeInstanceOf(path.PathNiceArr);
});
