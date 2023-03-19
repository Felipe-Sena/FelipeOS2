/* eslint-disable no-case-declarations */
/*
    Copyright Felipe Sena | 2023 | Licenced under the GNU General Public Licence | Read the licence on the LICENCE.txt file | Node libraries might not have the same license as this file.
    Includes the following modules:
    chalk
    discord.js
    python-shell
    undici
    Rewritten for better performance, organization and for refactoring
------------------------------------------------------------------------------------------------------------*/
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
let restartTimeout;
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
const { Client, Events, GatewayIntentBits, PermissionsBitField, ActivityType, Message, codeBlock, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
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

// File append is used in logging
function fileAppend(name, text, encoding, cb) {
    fs.appendFile(name, `\n${text}`, encoding, err => {
        if (err) {
            return cb && cb(err);
        }
        logVerbose(null, 'WriteSuccessfull');
    });
}

// This does not work, it ends up erasing the count.json file. Rewrite
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

// Possible fix for bot randomly disconnecting
function reconnect() {
    log(warn('RECONNECTING...'));
    client.destroy();
    if (!useDevAccount) {
        log(success('Successfully logged in! (Regular Account)'));
        client.login(data.config.token);
    } else {
        log(success('Successfully logged in! (Developer Account)'));
        client.login(data.config.testingToken);
    }
    clearTimeout(restartTimeout);
}

// Launch arguments

argv.forEach((val) => {
    args = [val];
    if (args.includes('-h' || '-help')) {
        log(chalk.blueBright(chalk.bold('-h -help -testing -nocount -testcount -verbose -usedev -nolog -testingAccount')));
        process.exit();
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
        }
    });
    // This is here so this function runs endlessly
}

// This once the client is ready (not a loop)
client.once(Events.ClientReady, c => {
    restartTimeout = setInterval(reconnect, 14400000); // 4 hours
    log(success(`Login successfull, ${useDevAccount ? `you are using a developer account: ${c.user.tag}` : `you are using a normal account ${c.user.tag}`}`));
    c.user.setActivity('The Swomp', { type: ActivityType.Watching });
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
    // CLI stuff
    log(info(message.author.username) + chalk.whiteBright(' on ') + description(message.channel.name) + chalk.whiteBright(' > ', message.content));
    const randomNumber = Math.random();
    logVerbose(null, randomNumber);
    const date = new Date(message.createdTimestamp);

    // Handles logging, if the channel is not the questioning channel then we'll log normally with the option to disable the logging (only disables normal logs)
    logMessages(message);
    // count(message);

    // Handle trigger words in chat
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

        // Dev things and utilities

        case 'quit':
            // Do we need await here?
            if (message.author.id === data.config.OwnerID || message.author.id === data.config.HelperID) {
                await message.channel.send('Quitting...');
                await message.channel.send('https://tenor.com/view/bye-ironic-meme-raffiboss22-ifunny-ironic-ifunny-gif-gif-19834066');
                log(warn('WARNING: ') + 'bot shutdown initiated by ' + warn(message.author.username));
                process.exit();
            }
            break;

        case 'help':
            const HelpEmbed = new EmbedBuilder()
                .setColor([117, 65, 240])
                .setTitle('Help')
                .addFields(
                    { name: 'List', value: `${codeBlock(data.info.commands)}` },
                )
                .setTimestamp()
                .setFooter({ text: `Prompted by ${message.author.username}` });
            message.channel.send({ embeds: [HelpEmbed] });
            break;

        case 'botinfo':
            const gitButton = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setLabel('GitHub')
                    .setURL(data.info.gitRepo)
					.setStyle(ButtonStyle.Link),
			);
            const infoEmbed = new EmbedBuilder()
                .setColor([117, 65, 240])
                .setTitle('Info')
                .addFields(
                    { name: 'Credits:', value: data.info.credits },
                    { name: 'Latest patch note:', value: data.info.update },
                    { name: 'Current version: ', value: data.info.version },
                    { name: 'GitHub repository: ', value: data.info.gitRepo }, // Should I keep this? We have a button...
                    { name: 'License: ', value: 'GNU GENERAL PUBLIC LICENSE VERSION 3' },
                )
                .setFooter({ text: `Prompted by ${message.author.username}` });
            message.channel.send({ embeds: [infoEmbed], components: [gitButton] });
            break;

        case 'sysinfo':
            message.channel.send(codeBlock(`CPU ARCHITECTURE: ${os.arch()}\nTOTAL MEMORY: ${os.totalmem / 1e+9}GB\nFREE MEMORY: ${os.freemem / 1e+9}GB\nMACHINE TYPE: ${os.machine}\nOPERATING SYSTEM: ${os.type()}\nUPTIME (IN MINUTES): ${Math.trunc(os.uptime / 60)}`));
            break;

        case 'bulkdel':
            if (!message.member.permissionsIn(message.channel).has('Administrator')) return;
            // Handles invalid numbers/undefined cases
            let deletionNumber = parseInt(parsedArgs[0]);
            let maxDelTriggered = false;
            if (parsedArgs[0] === undefined || !Number.isInteger(deletionNumber)) {
                await message.reply('Please enter a number for the amount of messages to delete!');
                if (verbose) log(error('BulkDeletion: No argument'));
                return;
            }

            // Discord doesn't allow you to delete more than 100 messages
            if (deletionNumber > 100) {
                maxDelTriggered = true;
                deletionNumber = 100;
            }

            try {
                /*
                    We can't bulk delete messages older than 14 days, so we'll do the following:
                        Fetch the amount of messages desired by the user (1-100);
                        Create a new array to store messageIDs;
                        Get all bulkdeletable messages and push them into that array;
                        BulkDelete by the array lenght.
                */
                await message.channel.messages.fetch({ limit: deletionNumber }).then(fetchedMessages => {
                    const mArr = new Array(0);
                    fetchedMessages.forEach(m => {
                        if (m.bulkDeletable) mArr.push(m.id);
                    });
                    // log (mArr.length);
                    message.channel.bulkDelete(mArr.length);
                    if (mArr.length < deletionNumber) {
                        message.reply('Could not delete all desired messages due to an API limitation, messages older than 14 days cannot be bulk deleted.');
                    }
                });
                maxDelTriggered ? message.reply('Deletions were clamped to 100 due API limitations, if you want to delete more messages run this command again') : log('success');
            } catch (err) {
                log(err);
                break;
            }
            break;
        // Fun stuff

        case 'random':
            if (!randomEntertainment) {
                message.reply('Random commands are disabled');
                return;
            }
            switch (parsedArgs[0]) {
                case undefined:
                    message.reply('Missing argument! Did you forget to specify what random thing you want? If you are confused be sure to do "-help"');
                    break;
                case 'cat':
                    const randomCat = await request('https://aws.random.cat/meow');
                    const rJS = await randomCat.body.json();
                    const randomCatEmbed = new EmbedBuilder()
                        .setColor([117, 65, 240])
                        .setTitle('A random cat!')
                        .setDescription('meow!')
                        .setImage(rJS.file)
                        .setTimestamp()
                        .setFooter({ text: `Prompted by ${message.author.username}` });
                    message.channel.send({ embeds: [randomCatEmbed] });
                    log(rJS.file);
                    userInput();
                    break;
                case 'video':
                    message.reply(data.randomEntertainment.videos[Math.floor(randomNumber * data.randomEntertainment.videos.length)]);
                    break;
                case 'image':
                    message.reply(data.randomEntertainment.images[Math.floor(randomNumber * data.randomEntertainment.images.length)]);
                    break;
                case 'gif':
                    message.reply(data.randomEntertainment.gifs[Math.floor(randomNumber * data.randomEntertainment.gifs.length)]);
                    break;
                case 'song':
                    message.reply(data.randomEntertainment.music[Math.floor(randomNumber * data.randomEntertainment.music.length)]);
                    break;
                default:
                    message.reply('Unknown command, please run "-help"');
            }
    }
});

// Login
if (!useDevAccount) {
    client.login(data.config.token);
} else {
    client.login(data.config.testingToken);
}