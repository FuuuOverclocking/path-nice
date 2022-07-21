let path;

try {
    path = require('../build/cjs/index.cjs.js');
} catch (e) {
    console.log('Cannot import path-nice from ./build/cjs, do you forget to build?');
}

(async () => {
    await path('release').emptyDir();

    await Promise.all([
        path(
            'build/cjs',
            'build/esm',
            'package.json',
            'README.md',
            'README-cn.md',
            'LICENSE',
        ).copyToDir('release'),
        path('release/posix/package.json').outputJSON(genSubPkgJSON('posix')),
        path('release/win32/package.json').outputJSON(genSubPkgJSON('win32')),
    ]);

    await Promise.all([
        path('release/cjs/package.json').writeJSON({ type: 'commonjs' }),
        path('release/esm/package.json').writeJSON({ type: 'module' }),
        path('release/package.json').updateJSON(updatePkgJSON),
    ]);

    /**
     * As a package, `path-nice` exports the following paths:
     *
     * - `.`: the default entry
     * - `./posix` and `./win32`:
     *     - provides access to POSIX-specific or Windows-specific implementations of the
     *       path methods
     *     - are imitation of the exports of Node.js `path` module, see
     *       [posix](http://nodejs.cn/api/path.html#pathposix) and
     *       [win32](http://nodejs.cn/api/path.html#pathwin32)
     *
     * Recent versions of Node can recognize the `exports` field in `/package.json` to
     * directly achieve the exports mentioned above, but old versions or other packaging
     * tools can't.
     *
     * Therefore, a `/{platform}/package.json` file is provided here to guide them to relocate to
     * the correct place when they resolve this path.
     */
    function genSubPkgJSON(platform) {
        return {
            name: 'path-nice',
            description: 'How path and fs should be designed.',
            main: `../cjs/${platform}.cjs.js`,
            module: `../esm/${platform}.esm.js`,
            // types: `../esm/${platform}.esm.d.ts`,
        };
    }

    function updatePkgJSON(json) {
        return {
            ...json,
            main: './cjs/index.cjs.js',
            module: './esm/index.esm.js',
            // types: './esm/index.esm.d.ts',
            exports: {
                '.': {
                    // types: './esm/index.esm.d.ts',
                    import: './esm/index.esm.js',
                    require: './cjs/index.cjs.js',
                },
                './posix': {
                    // types: './esm/posix.esm.d.ts',
                    import: './esm/posix.esm.js',
                    require: './cjs/posix.cjs.js',
                },
                './win32': {
                    // types: './esm/win32.esm.d.ts',
                    import: './esm/win32.esm.js',
                    require: './cjs/win32.cjs.js',
                },
            },
            files: ['cjs/', 'esm/', 'posix/', 'win32/', 'README-cn.md'],
        };
    }
})();
