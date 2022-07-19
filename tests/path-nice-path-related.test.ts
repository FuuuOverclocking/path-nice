import path from '../build/cjs/index.cjs.js';

const pathPosix = path.posix;
const pathWin32 = path.win32;

test('PathNice.raw', () => {
    const p = path('!@#$%^&()1234567890');
    expect(p.raw).toBe('!@#$%^&()1234567890');
});

test('PathNice.join()', () => {
    expect(pathPosix('../data').join('settings.json').raw).toBe('../data/settings.json');

    expect(pathWin32('../data').join('settings.json').raw).toBe(
        '..\\data\\settings.json',
    );

    expect(pathPosix('/home').join('fuu', pathPosix('data.json')).raw).toBe(
        '/home/fuu/data.json',
    );

    expect(pathWin32('C:\\Users').join('fuu', pathWin32('data.json')).raw).toBe(
        'C:\\Users\\fuu\\data.json',
    );
});

test('PathNice.dirname()', () => {
    expect(pathPosix('/usr/local/bin').dirname().raw).toBe('/usr/local');

    expect(pathWin32('C:\\Users\\fuu').dirname().raw).toBe('C:\\Users');

    expect(pathPosix('./src/index.ts').dirname('./dist').raw).toBe('dist/index.ts');
    expect(pathWin32('./src/index.ts').dirname('./dist').raw).toBe('dist\\index.ts');

    expect(pathPosix('./src/index.ts').dirname(pathPosix('./dist')).raw).toBe(
        'dist/index.ts',
    );
    expect(pathWin32('./src/index.ts').dirname(pathWin32('./dist')).raw).toBe(
        'dist\\index.ts',
    );

    expect(
        pathPosix('path-nice/dist/types.ts').dirname((old) =>
            old.replace(/dist/g, 'build'),
        ).raw,
    ).toBe('path-nice/build/types.ts');
    expect(
        pathWin32('path-nice/dist/types.ts').dirname((old) =>
            old.replace(/dist/g, 'build'),
        ).raw,
    ).toBe('path-nice\\build\\types.ts');
});

test('PathNice.parent', () => {
    expect(pathPosix('/usr/local/bin').parent.raw).toBe('/usr/local');
    expect(pathWin32('C:\\Users\\fuu').parent.raw).toBe('C:\\Users');
});

test('PathNice.filename()', () => {
    expect(path('./src/index.js').filename()).toBe('index.js');

    expect(pathPosix('/home/fuu///').filename()).toBe('fuu');

    expect(pathPosix('/home/fuu/bar.txt').filename('foo.md').raw).toBe(
        '/home/fuu/foo.md',
    );

    expect(pathWin32('C:\\Users\\fuu\\\\\\').filename()).toBe('fuu');

    expect(pathWin32('C:\\Users\\fuu\\bar.txt').filename('foo.md').raw).toBe(
        'C:\\Users\\fuu\\foo.md',
    );

    expect(pathPosix('./data/storage.json').filename((n) => 'old.' + n).raw).toBe(
        'data/old.storage.json',
    );
    expect(pathWin32('./data/storage.json').filename((n) => 'old.' + n).raw).toBe(
        'data\\old.storage.json',
    );
});

test('PathNice.ext()', () => {
    expect(path('./src/index.js').ext()).toBe('.js');
    ('.js');

    expect(path('./LICENSE').ext()).toBe('');
    ('');

    expect(path('.bashrc').ext()).toBe('');
    ('');

    expect(pathPosix('./src/index.js').ext('.ts').raw).toBe('./src/index.ts');
    expect(pathWin32('./src/index.js').ext('.ts').raw).toBe('./src\\index.ts');

    expect(
        pathPosix('./public/help.htm').ext((ext) => (ext === '.htm' ? '.html' : ext)).raw,
    ).toBe('./public/help.html');
    expect(
        pathWin32('./public/help.htm').ext((ext) => (ext === '.htm' ? '.html' : ext)).raw,
    ).toBe('./public\\help.html');

    expect(pathPosix('./README.md').ext(null).raw).toBe('./README');
    expect(pathWin32('./README.md').ext(null).raw).toBe('.\\README');
});

test('PathNice.separator()', () => {
    expect(path('/home/fuu/data.json').separator()).toBe('/');

    expect(path('C:\\Windows\\System32').separator()).toBe('\\');

    expect(path('index.js').separator()).toBe('none');

    expect(path('C:\\Windows/System32').separator()).toBe('hybrid');

    expect(path('/home/fuu/data.json').separator('\\').raw).toBe(
        '\\home\\fuu\\data.json',
    );

    expect(path('C:\\Windows\\System32').separator('/').raw).toBe('C:/Windows/System32');
});

test('PathNice.prefixFilename()', () => {
    expect(pathPosix('data/January').prefixFilename('2021-').raw).toBe(
        'data/2021-January',
    );
    expect(pathWin32('data/January').prefixFilename('2021-').raw).toBe(
        'data\\2021-January',
    );
});

// test('PathNice.', () => {});
