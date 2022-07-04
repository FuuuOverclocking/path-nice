const fs = require('fs-extra');
const chalk = require('chalk');
const { x, sh } = require('./utils');

main();
async function main() {
    const version = getInput();

    console.log('release: v' + version);

    if ((await x('git branch --show-current')) !== 'dev') {
        console.log(`x('git branch --show-current') !== 'dev'`);
        return;
    }

    if ((await x('git status --porcelain')) !== '') {
        console.log(`x('git status --porcelain') !== ''`);
        return;
    }

    await sh('git rebase -i main');
    await sh('git checkout main');
    await sh('git merge dev');

    await fs.remove('./build');
    await sh('tsc -p tsconfig.cjs.json');
    await sh('tsc -p tsconfig.esm.json');
    await sh('jest');

    const path = require('../build/cjs/index.cjs.js');

    await path('package.json').updateJSON((pkg) => {
        pkg.version = version;
    });
    await genRelease();
    await sh('yarn docs');
    await sh('conventional-changelog -p angular -i CHANGELOG.md -s');

    await sh('git add -A');
    await sh(`git commit -m "chore: release ${version}"`);
    await sh('git checkout dev');
    await sh('git merge main');
    await sh('git push --all');
    await sh(`git tag v${version}`);
    await sh(`git push origin v${version}`);

    console.log(chalk.red(`Critical operation:`));
    console.log(chalk.red(`  $ npm publish --dry-run ./release`));
    console.log(chalk.red(`  $ npm publish ./release`));
    console.log(chalk.red(`Copy the command and execute it yourself.`));
}

function getInput() {
    const version = process.argv[2];
    if (!/\d+\.\d+\.\d+/.test(version)) {
        throw new Error('invalid version');
    }
    const nums = version.match(/(\d+)\.(\d+)\.(\d+)/);
    const n = parseInt(nums[1]) * 1000000 + parseInt(nums[2]) * 1000 + parseInt(nums[3]);

    const currVersion = fs.readJSONSync('package.json').version;
    const currNums = currVersion.match(/(\d+)\.(\d+)\.(\d+)/);
    const currN =
        parseInt(currNums[1]) * 1000000 +
        parseInt(currNums[2]) * 1000 +
        parseInt(currNums[3]);

    if (n <= currN) {
        throw new Error('invalid version');
    }

    return version;
}

async function genRelease() {
    const path = require('../build/cjs/index.cjs.js');

    await path('release').remove();
    await path('release').ensureDir();

    await Promise.all([
        path('build/cjs')
            .copyToDir('release')
            .then(() => path('release/cjs/package.json').writeJSON({ type: 'commonjs' })),
        path('build/esm')
            .copyToDir('release')
            .then(() => path('release/esm/package.json').writeJSON({ type: 'module' })),
        path('release/posix/package.json').outputJSON(genSubPkgJSON('posix')),
        path('release/win32/package.json').outputJSON(genSubPkgJSON('win32')),
        path('package.json')
            .copyToDir('release')
            .then(() => path('release/package.json').updateJSON(updatePkgJSON)),
        path('README.md').copyToDir('release'),
        path('LICENSE').copyToDir('release'),
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
            types: `../esm/${platform}.esm.d.ts`,
        };
    }

    function updatePkgJSON(json) {
        return {
            ...json,
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
            files: ['cjs/', 'esm/', 'posix/', 'win32/'],
        };
    }
}
