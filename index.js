// Felipe Sena | 2023 | Licenced under the GNU General Public Licence | Read the licence on the LICENCE.txt file
// Rewritten for better performance, organization and for refactoring
// -------------------------------------------------------------------------------------------------------------
// Variable definitions
'use strict';
const data = require('./json/data.json');
let counting = data.settings.count;
let messageCounter = 0;
let logging = data.settings.logging;
let randomEntertainment = data.settings.randomentertainment;
let fChatResponses = data.settings.fchatresponses;
let randomResponses = data.settings.susrandomresponse;
let targeting = data.settings.targeting;
let args;
let testing = false;
let countingTest = false;
let verbose = false;
let useDevChannels = false;
let useDevAccount = true;
let sendGif = true;

// Requires

const prefix = '-';
const fs = require('fs');
const os = require('os');
const chalk = require('chalk');
const error = chalk.redBright;
const success = chalk.greenBright;
const warn = chalk.yellowBright;
const info = chalk.blueBright.bold;
const description = chalk.cyanBright.bold;
const log = console.log;
const readline = require('readline').createInterface({ input: process.stdin, output: process.stdout });
const { argv } = require('node:process');
const { Client, Events, GatewayIntentBits, PermissionsBitField, Codeblock, ActivityType, Message } = require('discord.js');
const { request } = require('undici');

// Functions

function logVerbose(index, message) {
    if (verbose) {
        switch (index) {
            case 'table':
                console.table(message);
                return;
            default:
                log(message);
                return;
        }
    }
}

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
        logVerbose(null, 'WriteSuccessfull');
    });
}

function count(message) {
    if (counting) {
        // TODO: Implement counting test as a startup command! | FIX JSON ERASURE
        // Using data as a var name here is pretty confusing, since we're acessing ./json/count. Maybe I should rewrite this later...
        const messageToNumber = parseInt(message.content);
        jsonReader('./json/count.json', (err, Data) => {
            logVerbose('table', Data);
            // Maybe rewrite this to use 2 files, this is way too unreadable in my opinion...
            if (countingTest) {
                if (messageToNumber === Data.devCount.next && message.author.id !== Data.devCount.prevID) {
                    Data.devCount.prevID = message.author.id;
                    Data.devCount.current = messageToNumber;
                    Data.devCount.next++;
                    if (Data.devCount.current > Data.devCount.highscore) {
                        Data.devCount.highscore = Data.devCount.current;
                    }
                    fs.writeFile('./json/count.json', JSON.stringify(Data), err => {
                        if (err) {
                            log(error('Error reading file: ', err));
                            message.channel.send('Error writing to disk!');
                        }
                    });
                    message.react('✅');
                    logVerbose('table', Data);
                } else {
                    Data.devCount.prevID = message.author.id;
                    Data.devCount.current = 0;
                    Data.devCount.next = 1;
                    fs.writeFile('./json/count.json', JSON.stringify(Data), err => {
                        if (err) {
                            log(error('Error reading file: ', err));
                            message.channel.send('Error writing to disk!');
                        }
                    });
                    message.react('❌');
                    message.channel.send(`<@${message.author.id}> ruined it! Laugh at this blunder!\nHighscore:${Data.devCount.highscore}`);
                    logVerbose('table', Data);
                }
                return;
            }
            /*
            // Handles non numbers
            logVerbose(messageToNumber);
            if (isNaN(messageToNumber) && !message.author.bot) {
                messageCounter++;
                if (messageCounter >= 4) {
                    message.channel.send(`Hey, just to remind you guys, the previous number is: ${Data.devCount.current}\nTyped by <@${Data.devCount.prevID}>`);
                    messageCounter = 0;
                }
                return;
            }
            if (messageToNumber === Data.count.next && message.author.id !== Data.count.prevID) {
                Data.count.prevID = message.author.id;
                Data.count.current = messageToNumber;
                Data.count.next++;
                if (Data.count.highscore > Data.count.current) {
                    Data.count.highscore = Data.count.current;
                }
                fs.writeFile('./json/count.json', JSON.stringify(Data), err => {
                    log(error('Error reading file: ', err));
                    message.channel.send('Error writing to disk!');
                });
                message.react('✅');
                console.table(Data);
            } else {
                Data.count.prevID = message.author.id;
                Data.count.current = 0;
                Data.count.next = 1;
                fs.writeFile('./json/count.json', JSON.stringify(Data), err => {
                    if (err) {
                        log(error('Error reading file: ', err));
                        message.channel.send('Error writing to disk!');
                    }
                });
                message.react('❌');
                message.channel.send(`<@${message.author.id}> ruined it! Laugh at this blunder!\nHighscore:${Data.count.highscore}`);
                logVerbose('table', Data);
            }
            */
        });
    }
}

function logMessages(message) {
    const date = new Date(message.createdTimestamp);
    if (message.channel.id === data.config.questioningChannel) {
        fileAppend('questioningLogs.txt', `${date}: ${message.author.username} on ${message.channel.name} > ${message.content}`, 'utf-8', (err) => {
            if (err) {
                log(error('Error writing file', err));
            }
        });
    } else if (logging) {
        fileAppend('logs.txt', `${date}: ${message.author.username} on ${message.channel.name} > ${message.content}`, 'utf-8', (err) => {
            if (err) {
                log(error('Error writing file', err));
            }
        });
    }
}

function settings (hasPermissions, message) {
    // TODO
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
    readline.question('', async uinput => {
        const commandArray = uinput.split(' ');
        let isEven = 0; // Used for finding channels
        switch (commandArray[0]) {
            case 'quit':
                log(warn('QUITTING...'));
                process.exit();
                break;
            case 'help':
                console.table(data.userInputHelp);
                userInput();
                break;
            case 'toggleCount':
                // TODO
                userInput();
                break;
            case 'randomCat':
                // eslint-disable-next-line no-case-declarations
        }
    });
    // This is here so this function runs endlessly
}

// This once the client is ready (not a loop)
client.once(Events.ClientReady, c => {
    log(success(`Login successfull, ${useDevAccount ? `you are using a developer account: ${c.user.tag}` : `you are using a normal account ${c.user.tag}`}`));
    client.user.setActivity('The Swomp', { type: ActivityType.Watching });
    if (!testing) {
        const channelToSend = client.channels.cache.find(Channel => Channel.id === data.channels[0]);
        if (channelToSend && sendGif) {
            channelToSend.send('https://tenor.com/view/3kilksphillip-hello-run-csgo-gif-20739439');
        } if (!channelToSend) {
            log(warn('Swomp general channel could not be found, are you running this on another server or was the channel removed?'));
        }
    }
    userInput();
});

// Runs on every message sent
client.on(Events.MessageCreate, async message => {
    log(info(message.author.username) + chalk.whiteBright(' on ') + description(message.channel.name) + chalk.whiteBright(' > ', message.content));
    const randomNumber = Math.random();
    logVerbose(null, randomNumber);
    const date = new Date(message.createdTimestamp);
    log(chalk.blueBright(chalk.bold(message.author.username) + chalk.whiteBright(' on ') + chalk.cyanBright(chalk.bold(message.channel.name)) + chalk.whiteBright(' > ', message.content)));
    // Handles logging, if the channel is not the questioning channel then we'll log normally with the option to disable the logging (only disables normal logs)
    logMessages(message);
    count(message);
    if (data.triggerWords.some(element => message.content.toLowerCase().includes(element) && randomResponses)) {
        message.reply(data.triggerResponses[Math.floor(randomNumber * data.triggerResponses.length)]);
    }
    // Parse the received message
    if (!message.content.startsWith(prefix) || message.author.bot) return;
    const parsedMessage = message.content.slice(prefix.length).split(/ +/);
    const command = parsedMessage[0];
    const parsedArgs = parsedMessage.slice(1);
    logVerbose(null, `parsedMessage: ${JSON.stringify(parsedMessage)}\nparsedArgs: ${JSON.stringify(parsedArgs)}`);
    switch (command) {
        case 'randomcat':
            // eslint-disable-next-line no-case-declarations
            const randomCat = await request('https://aws.random.cat/meow');
            log(await randomCat.body.json());
            userInput();
    }
});

// Login
if (!useDevAccount) {
    client.login(data.config.token);
} else {
    client.login(data.config.testingToken);
}