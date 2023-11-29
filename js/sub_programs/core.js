const fs = require('fs');
const exec = require('child_process').exec;
const chalk = require('chalk');
const event_emitter = require('events').EventEmitter;
const read_line = require('readline');

const rl = read_line.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> ',
});

const console_output_event = new event_emitter();

module.exports = {
    console_output_event,

    read_console: () => {
        rl.prompt();
            rl.on('line', (line) => {
                // CORE COMMANDS
                switch (line.trim()) {
                    case 'refresh':
                        this.read_console;
                        break;
                }
                console_output_event.emit('output', line.trim());
                rl.prompt();
            }).on('close', () => {
                process.exit(0);
            });
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