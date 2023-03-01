// Rewritten for better performance, organization and for refactoring
// Variable definitions
const data = require('./data.json');
let counting = data.settings.count;
let logging = data.settings.logging;
let randomEntertainment = data.settings.randomentertainment;
let fChatResponses = data.settings.fchatresponses;
let targeting = data.settings.targeting;
let args;
let testing = false;
let countingTest = false;
let verbose = false;
let useDevChannels = false;
let useDevAccount = false;

// Requires

const prefix = '-';
const fs = require('fs');
const os = require('os');
const chalk = require('chalk');
const error = chalk.redBright;
const sucess = chalk.greenBright;
const warn = chalk.yellowBright;
const log = console.log;
const readline = require('readline').createInterface({ input: process.stdin, output: process.stdout });
const argv = require('node:process');
const { Client, Events, GatewayIntentBits, PermissionsBitField, Codeblock, ActivityType } = require('discord.js');

// Functions

function jsonReader(filePath, cb) {
    fs.readFile(filePath, (err, fileData) => {
        if (err) {
            return cb && cb(err);
        }
        try {
            const object = JSON.parse(fileData);
            return cb && cb(null, object);
        } catch (err) {
            return cb && cb(err);
        }
    });
}

function fileAppend(name, text, encoding, cb) {
    fs.appendFile(name, `\n${text}`, encoding, err => {
        if (err) {
            return cb && cb(err);
        }
        if (verbose) log(sucess('WriteSuccessfull'));
    });
}

// launch arguments

argv.forEach((val) => {
    args = [val];
    if (args.includes('-h' || '-help')) {
        log(chalk.blueBright(chalk.bold('-h -help -testing -nocount -testcount -verbose -usedev -nolog -testingAccount')));
    }
    if (args.includes('-testing')) {
        testing = true;
    }
    if (args.includes('-nocount')) {
        counting = false;
    }
    if (args.includes('-testcount') && !args.includes('-nocount')) {
        countingTest = true;
    }
    if (args.includes('-verbose')) {
        verbose = true;
    }
    if (args.includes('-usedev')) {
        useDevChannels = true;
    }
    if (args.includes('-nolog')) {
        logging = false;
    }
    if (args.includes('-testingAccount')) {
        useDevAccount = true;
    }
});

// Initialize a new client instance

const client = new Client({ intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildBans,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
] });

// The function userInput is down here because it requires the Discord.JS client in order to work properly

function userInput() {
    readline.question('', uinput => {
        const commandArray = uinput.split(' ');
        let isEven = 0; // Used for finding channels
        switch (commandArray[0]) {
            case 'help':
                console.table();
        }
    });
}