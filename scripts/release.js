const fs = require('fs-extra');
const chalk = require('chalk');
const util = require('util');
const { spawn, exec } = require('child_process');

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

    await shell('git rebase -i main');
    await shell('git checkout main');
    await shell('git merge dev');

    await fs.remove('./build');
    await shell('tsc -p tsconfig.cjs.json');
    await shell('tsc -p tsconfig.esm.json');
    await shell('jest');

    const path = require('../build/cjs/index.cjs.js');
    await path('package.json').updateJSON((pkg) => {
        pkg.version = version;
    });
    await genDocs();
    await genRelease();
    await shell('conventional-changelog -p angular -i CHANGELOG.md -s');
    await shell('git add -A');
    await shell(`git commit -m "chore: release ${version}"`);
    await shell('git push');
    await shell(`git tag v${version}`);
    await shell(`git push origin v${version}`);

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

async function x(cmd) {
    console.log(chalk.bgCyan(cmd));
    const { stdout } = await util.promisify(exec)(cmd);
    return stdout.trim();
}

async function shell(cmd) {
    console.log(chalk.bgCyan(cmd));
    return new Promise((ok, err) => {
        const proc = spawn(cmd, {
            stdio: 'inherit',
            shell: true,
        });
        proc.on('close', (code) => {
            if (code === 0) ok();
            err(code ?? 1);
        });
    });
}

async function genDocs() {
    const path = require('../build/cjs/index.cjs.js');
    await path('README.md').rename('README-en.md');
    await path('README-cn.md').rename('README.md');

    await shell('yarn docs');

    await path('docs/index.html').rename('docs/index-cn.html');

    await path('README.md').rename('README-cn.md');
    await path('README-en.md').rename('README.md');

    await shell('yarn docs');

    await Promise.all([fixPath('docs/index.html'), fixPath('docs/index-cn.html')]);

    async function fixPath(filepath) {
        await path(filepath).updateString((str) => {
            str = str.replace('<a href="README-cn.md">', '<a href="index-cn.html">');
            str = str.replace('<a href="README.md">', '<a href="index.html">');
            return str;
        });
    }
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
