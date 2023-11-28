const fs = require('fs');
const exec = require('child_process').exec;
const chalk = require('chalk');

const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
});

module.exports = {
    read_console: () => {
        return new Promise((resolve) => readline.question('> ', resolve));
    },

    token_manager: (command) => {
        return new Promise((resolve, reject) => {
            // Check if we're running FScramble.exe in decrypt mode.
            if (!command.includes('decrypt')) {
                reject('FScramble needs to be run in "decrypt" mode.');
            }

            console.log('Initializing token decryption...');
            const start = Date.now();

            const process = exec(command);
            let result = '';

            process.stdout.on('data', (data) => {
                result += data;
            });

            process.on('close', () => {
                const end = Date.now();
                console.log(`Elapsed time during decryption: ${chalk.blue(end - start)} ms`);
                resolve(result);
            });
        });

    },

    JSON_read: (path) => {
        return new Promise((resolve, reject) => {
            fs.readFile(path, 'utf-8', (err, data) => {
                if (err) reject(err);
                resolve(JSON.parse(data));
            });
        });
    },

    JSON_write: (path, data) => {
        fs.writeFile(path, JSON.stringify(data, null, 1), (err) => {
            if (err) {
                return err;
            } else {
                return 0;
            }
        });
    },
};