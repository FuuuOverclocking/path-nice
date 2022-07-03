const path = require('../release/cjs/index.cjs.js');
const { shell } = require('./utils');

main();
async function main() {
    await path('README.md').rename('README-en.md');
    await path('README-cn.md').rename('README.md');

    await shell('typedoc --options typedoc.json');

    await path('docs/index.html').rename('docs/index-cn.html');

    await path('README.md').rename('README-cn.md');
    await path('README-en.md').rename('README.md');

    await shell('typedoc --options typedoc.json');

    await Promise.all([fixPath('docs/index.html'), fixPath('docs/index-cn.html')]);

    async function fixPath(filepath) {
        await path(filepath).updateString((str) => {
            str = str.replace('<a href="README-cn.md">', '<a href="index-cn.html">');
            str = str.replace('<a href="README.md">', '<a href="index.html">');
            return str;
        });
    }
}
