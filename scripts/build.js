const fs = require('fs-extra');
const { sh } = require('./utils');

(async () => {
    await fs.remove('./build');
    await sh('tsc -p tsconfig.cjs.json');
    await sh('tsc -p tsconfig.esm.json');

    const path = require('../build/cjs/index.cjs.js');

    const { files } = await path('./src').ls();

    await files
        .filter((f) => f.filename().endsWith('.cjs.d.ts'))
        .copyToDir('./build/cjs');
    await files
        .filter((f) => f.filename().endsWith('.esm.d.ts'))
        .copyToDir('./build/esm');
})();
