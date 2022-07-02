const fs = require('fs-extra');
const concurrently = require('concurrently');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

main();
async function main() {
    await Promise.all([genDocs(), genRelease()]);
}

async function genDocs() {
    await fs.rename('README.md', 'README-en.md');
    await fs.rename('README-cn.md', 'README.md');

    await exec('yarn docs');
    await fs.rename('docs/index.html', 'docs/index-cn.html');

    await fs.rename('README.md', 'README-cn.md');
    await fs.rename('README-en.md', 'README.md');

    await exec('yarn docs');

    await Promise.all([fixPath('docs/index.html'), fixPath('docs/index-cn.html')]);

    async function fixPath(filepath) {
        let str = await fs.readFile(filepath, 'utf-8');
        str = str.replace(/docs\/images\//g, 'images/');
        str = str.replace('<a href="README-cn.md">', '<a href="index-cn.html">');
        str = str.replace('<a href="README.md">', '<a href="index.html">');
        await fs.writeFile(filepath, str, { encoding: 'utf-8' });
    }
}

async function genRelease() {
    await fs.remove('./build');
    await fs.remove('./release');

    // tsc concurrently
    const { result } = concurrently([
        'tsc -p tsconfig.cjs.json',
        'tsc -p tsconfig.esm.json',
    ]);
    await result;

    const path = require('../build/cjs/index.cjs.js');

    await Promise.all([
        path('build/cjs').copyToDir('release'),
        path('build/esm').copyToDir('release'),
        path('release/posix/package.json').outputJson(genPackageJson('posix')),
        path('release/win32/package.json').outputJson(genPackageJson('win32')),
        path('package.json')
            .copyToDir('./release')
            .then(() => path('./release/package.json').updateJson(updatePkgJson)),
        path('README.md').copyToDir('release'),
        path('LICENSE').copyToDir('release'),
    ]);
}

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
function genPackageJson(platform) {
    return {
        name: 'path-nice',
        description: 'How path and fs should be designed.',
        main: `../cjs/${platform}.cjs.js`,
        module: `../esm/${platform}.esm.js`,
        types: `../esm/${platform}.esm.d.ts`,
    };
}

function updatePkgJson(json) {
    return {
        ...json,

        // See .github/workflows/release.yml
        // $.jobs.release-please.steps[0].with.extra-files
        version: 'x-release-please-version',

        main: './cjs/index.cjs.js',
        module: './esm/index.esm.js',
        types: './esm/index.esm.d.ts',
        exports: {
            '.': {
                types: './esm/index.esm.d.ts',
                import: './esm/index.esm.js',
                require: './cjs/index.cjs.js',
            },
            './posix': {
                types: './esm/posix.esm.d.ts',
                import: './esm/posix.esm.js',
                require: './cjs/posix.cjs.js',
            },
            './win32': {
                types: './esm/win32.esm.d.ts',
                import: './esm/win32.esm.js',
                require: './cjs/win32.cjs.js',
            },
        },
    };
}
