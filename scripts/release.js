const fs = require('fs-extra');
const chalk = require('chalk');
const { x, sh } = require('./utils');

(async () => {
    const version = parseInput();

    console.log('release: v' + version);

    // at dev branch
    if ((await x('git branch --show-current')) !== 'dev') {
        console.log(`x('git branch --show-current') !== 'dev'`);
        return;
    }

    // working tree is clean
    if ((await x('git status --porcelain')) !== '') {
        console.log(`x('git status --porcelain') !== ''`);
        return;
    }

    // rebase & merge
    await sh('git rebase -i main');
    await sh('git checkout main');
    await sh('git merge dev');

    // build & test
    await sh('yarn build');
    await sh('yarn test');

    // we can use path-nice now
    const path = require('../build/cjs/index.cjs.js');

    await path('package.json').updateJSON((pkg) => {
        pkg.version = version;
    });
    // generate release/
    await sh('yarn gen-release');
    // generate docs/
    await sh('yarn docs');
    // generate CHANGLOG.md
    await sh('conventional-changelog -p angular -i CHANGELOG.md -s');

    // commit, back to dev branch, tag
    await sh('git add -A');
    await sh(`git commit -m "chore: release ${version}"`);
    await sh(`git tag v${version}`);
    await sh('git checkout dev');
    await sh('git merge main');

    // sync
    await sh('git push --all');
    await sh(`git push origin v${version}`);

    console.log(chalk.red(`Critical operation:`));
    console.log(chalk.red(`  $ npm publish --dry-run ./release`));
    console.log(chalk.red(`  $ npm publish ./release`));
    console.log(chalk.red(`Copy the command and execute it yourself.`));

    function parseInput() {
        const version = process.argv[2];
        if (!/\d+\.\d+\.\d+/.test(version)) {
            throw new Error('invalid version');
        }
        const nums = version.match(/(\d+)\.(\d+)\.(\d+)/);
        const n =
            parseInt(nums[1]) * 1000000 + parseInt(nums[2]) * 1000 + parseInt(nums[3]);

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
})();
