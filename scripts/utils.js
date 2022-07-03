const chalk = require('chalk');
const util = require('util');
const { spawn, exec } = require('child_process');

const _exec = util.promisify(exec);
exports.x = async function x(cmd) {
    console.log(chalk.bgCyan('$ ' + cmd));
    const { stdout } = await _exec(cmd);
    return stdout.trim();
};

exports.sh = async function sh(cmd) {
    console.log(chalk.bgCyan('$ ' + cmd));
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
};
