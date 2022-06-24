const path = require('path');
const fs = require('fs-extra');
const concurrently = require('concurrently');

const dirDist = path.resolve(__dirname, '../dist');

// clean
fs.removeSync(dirDist);

// tsc
const { result } = concurrently(['tsc -p tsconfig.cjs.json', 'tsc -p tsconfig.esm.json']);

result.then(() => {
    // cjs/esm fixup
    fs.writeJSONSync(
        path.join(dirDist, 'cjs/package.json'),
        { type: 'commonjs' },
        { encoding: 'utf-8', spaces: 4 },
    );
    fs.writeJSONSync(
        path.join(dirDist, 'esm/package.json'),
        { type: 'module' },
        { encoding: 'utf-8', spaces: 4 },
    );
});
