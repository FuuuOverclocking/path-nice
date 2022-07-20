const https = require('https');
let path;

try {
    path = require('../build/cjs/index.cjs.js');
} catch (e) {
    console.log('Cannot import path-nice from ./build/cjs, do you forget to build?');
}

(async () => {
    const badgePath = path('docs/images/coverage.svg');

    const summary = await path('coverage/coverage-summary.json').readJSON();
    const coverage = summary.total.lines.pct;

    console.log('Updating coverage badge...');
    await downloadFromShield(badgePath, coverage);
})();

function downloadFromShield(badgePath, coverage) {
    const color = coverage < 60 ? 'red' : coverage < 80 ? 'yellow' : 'brightgreen';
    const coverageStr = encodeURIComponent(coverage.toFixed(1) + '%');
    const URL = `https://img.shields.io/badge/coverage-${coverageStr}-${color}?logo=jest`;

    return new Promise((ok, err) => {
        const ws = badgePath.createWriteStream();
        https.get(URL, (res) => {
            res.pipe(ws);

            ws.on('finish', () => {
                ws.close();
                ok();
            });
        }).on('error', err);
    });
}
