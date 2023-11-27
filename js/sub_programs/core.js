const fs = require('fs');
const exec = require('child_process').exec;

const readline = require('readline').createInterface({
    input: process.stdin,
    outpur: process.stdout,
});

module.exports = {
    read_console: () => {
        return new Promise((resolve) => readline.question('> ', resolve));
    },

    token_manager: (command) => {
        // For this to work you need to run FScramble in decrypt mode, maybe add a check?
        return new Promise((resolve, reject) => {

            if (!command.includes('decrypt')) {
                reject('FScramble needs to be run in "decrypt" mode.');
            }

            const process = exec(command);
            let result = '';

            process.stdout.on('data', (data) => {
                result += data;
            });

            process.on('close', () => {
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
                return 1;
            } else {
                return 0;
            }
        });
    },
};