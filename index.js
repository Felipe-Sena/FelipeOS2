/* eslint-disable no-case-declarations */
/*
------------------------------------------------------------------------------------------------------------
    Copyright Felipe Sena | 2023 | Licenced under the GNU General Public Licence | Read the licence on the LICENCE.txt file | Node libraries might not have the same license as this file.
    Includes the following modules:
    chalk
    discord.js
    undici
    Rewritten for better performance, organization and for refactoring
------------------------------------------------------------------------------------------------------------
*/
'use strict';
// Variable definitions
const data = require('./json/data.json');
const count = require('./json/count.json');
let counting = data.settings.count;
let logging = data.settings.logging;
const randomEntertainment = data.settings.randomentertainment;
// let fChatResponses = data.settings.fchatresponses;
const randomResponses = data.settings.susrandomresponse;
// let targeting = data.settings.targeting; might deprecate
let args;
let testing = false;
// let countingTest = false;
let verbose = false;
let useDevChannels = false;
let useDevAccount = false;
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
const { Client, Events, GatewayIntentBits, PermissionsBitField, ActivityType, codeBlock, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
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

function countFunction(message, userID, randomNumber) {
    const messageToNumber = parseInt(message);
    if (isNaN(messageToNumber) || message.channel.id != count.channelID) return;
    jsonReader('./json/count.json', (err, countJSON) => {
        if (err) {
            log(error('Error'));
        }
        if (userID !== countJSON.previousUserID && messageToNumber === countJSON.nextNumber) {
            log('win');
            countJSON.currentNumber = messageToNumber;
            countJSON.nextNumber = countJSON.currentNumber + 1;
            countJSON.previousUserID = userID;
            if (countJSON.currentNumber > countJSON.highscore) countJSON.highscore = countJSON.currentNumber;
            fs.writeFile('./json/count.json', JSON.stringify(countJSON), err => {
                if (err) {
                    log(error('Error'));
                }
            });
            message.react('✅');
        } else {
            log('lose');
            countJSON.currentNumber = 0;
            countJSON.nextNumber = 1;
            countJSON.previousUserID = userID;
            fs.writeFile('./json/count.json', JSON.stringify(countJSON), err => {
                if (err) {
                    log(error('Error'));
                }
            });
            message.react('❌');
            message.reply(`<@${userID}> ruined it! ${data.randomCountLossMessages[Math.floor(randomNumber * data.randomCountLossMessages.length)]}\nHighscore: ${countJSON.highscore}`);
        }
    });
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

function settings(name, value) {
    if (name === undefined || value === undefined) {
        return;
    }
    jsonReader('./json/data.json', (err, dataFile) => {
        if (err) {
            log(error('Error reading file ', err));
        }
        const bool = (value === 'true');
        // eslint-disable-next-line no-prototype-builtins
        if (!dataFile.settings.hasOwnProperty(name)) {
            log('Invalid entry');
            return;
        }
        dataFile.settings[name] = bool;
        fs.writeFile('./json/data.json', JSON.stringify(dataFile, null, 2), err => {
            if (err) {
                log(error('Error writing to disk', err));
            }
        });
    });
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
}

// Launch arguments

argv.forEach((val) => {
    args = [val];
    if (args.includes('-h' || '-help')) {
        log(chalk.blueBright(chalk.bold('-h -help -testing -nocount -verbose -usedevchannels -nolog -testingAccount -nogif')));
        process.exit();
    }
    if (args.includes('-testing')) {
        testing = true;
    }
    if (args.includes('-nocount')) {
        counting = false;
    }
    if (args.includes('-verbose')) {
        verbose = true;
    }
    if (args.includes('-usedevchannels')) {
        useDevChannels = true;
    }
    if (args.includes('-nolog')) {
        logging = false;
    }
    if (args.includes('-testingAccount')) {
        useDevAccount = true;
    }
    if (args.includes('-nogif')) {
        sendGif = false;
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
        switch (commandArray[0]) {
            case 'quit':
                log(warn('QUITTING...'));
                process.exit();
                break;
            case 'help':
                console.table(data.userInputHelp);
                break;
            case 'toggleCount':
                if (counting) {
                    counting = false;
                    log(success('Counting is now disabled'));
                } else {
                    counting = true;
                    log(success('Counting is now enabled'));
                }
                break;
            case 'sendMessage':
                if (commandArray.length > 1) {
                    if (!useDevChannels && data.channels.some(element => commandArray[1].includes(element))) {
                        // Find the channel IDs and then take care of data formatting. Remove the first 2 entries of the command array with splice()
                        const channelID = data.channels[data.channels.indexOf(commandArray[1]) + 1];
                        const channelSender = client.channels.cache.find(channelToFind => channelToFind.id === channelID);
                        // ['sendMessage', 'General', 'FOO', 'BAR'] -> ['FOO', 'BAR']
                        commandArray.splice(0, 2);
                        // Join any remaining entries in the array and separate them with spaces. ['FOO', 'BAR'] -> 'FOO BAR'
                        const joinedArr = commandArray.join(' ');
                        // Check to see if the joined array is empty (only whitespace)
                        if (!joinedArr.replace(/\s/g, '').length) {
                            log(error('NonFatalError: '), warn('Cannot send messages that only have whitespace'));
                            break;
                        }
                        channelSender.send(joinedArr);
                    } else if (useDevChannels && data.channelsDev.some(element => commandArray[1].includes(element))) {
                        // Find the channel IDs and then take care of data formatting. Remove the first 2 entries of the command array with splice()
                        const channelID = data.channelsDev[data.channelsDev.indexOf(commandArray[1]) + 1];
                        log(channelID);
                        const channelSender = client.channels.cache.find(channelToFind => channelToFind.id === channelID);
                        // ['sendMessage', 'General', 'FOO', 'BAR'] -> ['FOO', 'BAR']
                        commandArray.splice(0, 2);
                        // Join any remaining entries in the array and separate them with spaces. ['FOO', 'BAR'] -> 'FOO BAR'
                        const joinedArr = commandArray.join(' ');
                        log(joinedArr);
                        // Check to see if the joined array is empty (only whitespace)
                        if (!joinedArr.replace(/\s/g, '').length) {
                            log(error('NonFatalError: '), warn('Cannot send messages that only have whitespace'));
                            break;
                        }
                        channelSender.send(joinedArr);
                    } else {
                        log(error('NonFatalError: '), warn('Missing channel, you can do the channelList command to get a list of channels'));
                    }
                }
                break;
            case 'channelList':
                /*
                    We're checking if the index is even or odd because the file structure goes:
                    CHANNEL
                    ID
                    CHANNEL
                    ID
                    ...
                */
                if (useDevChannels) {
                    for (let i = 0; i < data.channelsDev.length; i++) {
                        if (i % 2 === 0) {
                            log(info(chalk.bold(data.channelsDev[i])), ' ');
                        }
                    }
                    break;
                } else {
                    for (let i = 0; i < data.channels.length; i++) {
                        if (i % 2 === 0) {
                            log(info(data.channels[i]), ' ');
                        }
                    }
                    break;
                }

            case 'dataBackup':
                // TODO: Allow you to specify a filename and warn if you're overwriting a file.
                fs.copyFile('./json/data.json', './json/backups/dataBACKUP.json', err => {
                    if (err) {
                        log(error('ERROR COPYING FILE\n', err));
                    } else {
                        log(success('Success!'));
                    }
                });
                break;
        }
    readline.close;
    userInput();
    });
}

// This once the client is ready (not a loop)
client.once(Events.ClientReady, c => {
    setInterval(reconnect, 14400000); // 4 hours is 14400000 ms
    log(success(`Login successfull, ${useDevAccount ? `you are using a developer account: ${c.user.tag}` : `you are using a normal account ${c.user.tag}`}`));
    c.user.setActivity('The Swomp', { type: ActivityType.Watching });
    if (!testing) {
        const channelToSend = client.channels.cache.find(Channel => Channel.id === data.config.generalChannelID);
        if (channelToSend && sendGif) {
            channelToSend.send('https://tenor.com/view/3kilksphillip-hello-run-csgo-gif-20739439');
        } if (!channelToSend) {
            log(warn('Swomp general channel could not be found, are you running this on another server or was the channel removed?'));
        }
    }
    userInput();
});

client.on('guildMemberAdd', member => {
    // Set member role
    member.roles.add([data.config.townspersonRole, data.config.countRole]);

    // Send a message with an embed to the announcements channel
    const joinEmbed = new EmbedBuilder()
        .setColor([117, 65, 240])
        .setTitle(`${member.displayName} has joined The Swomp!`)
        .setDescription(`Be sure to read the rules  at <#${data.config.rulesChannel}>, <@${member.id}>`)
        .setThumbnail(member.avatar)
        .setTimestamp();

    client.channels.cache.get(data.config.announcementsChannel).send({ embeds: [joinEmbed] });
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
    if (counting) countFunction(message, message.author.id, randomNumber);

    // Handle trigger words in chat
    if (data.triggerWords.some(element => message.content.toLowerCase().includes(element) && randomResponses)) {
        message.reply(data.triggerResponses[Math.floor(randomNumber * data.triggerResponses.length)]);
    }

    // Parse the received message
    if (!message.content.startsWith(prefix) || message.author.bot) return;
    const parsedMessage = message.content.toLowerCase().slice(prefix.length).split(/ +/);
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

        case 'settings':
            if (message.member.permissionsIn(message.channel).has('Administrator')) {
                if (parsedArgs.length === 2) {
                    settings(parsedArgs[0], parsedArgs[1]);
                } else {
                    if (parsedArgs[0] === 'list') {
                        jsonReader('./json/data.json', (err, JSONData) => {
                            if (err) {
                                log('ERROR READING FILE', err);
                            }
                            message.channel.send(codeBlock(JSON.stringify(JSONData.settings).replace(/{*"*}*/g, '').replace(/,/g, '\n').replace(/:/g, ': ').replace(/false/g, 'disabled').replace(/true/g, 'enabled')));
                        });
                        break;
                    }
                    message.reply('Please put in a setting name and a state');
                }
            } else {
                message.reply('You do not have permission to use thsi command');
            }
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
                        if (m.bulkDeletable) {
                            mArr.push(0);
                        }
                    });
                    message.channel.bulkDelete(mArr.length);
                    if (mArr.length < deletionNumber) {
                        message.reply(`Could not delete all desired messages due to an API limitation (deleted ${mArr.length} messages), messages older than 14 days cannot be bulk deleted.`);
                    }
                });
                maxDelTriggered ? message.reply('Deletions were clamped to 100 due API limitations, if you want to delete more messages run this command again') : log('success');
            } catch (err) {
                log(error(err));
                break;
            }
            break;

        case 'rolecreate':
            if (!message.member.permissionsIn(message.channel).has('Administrator')) {
                message.reply('You dont have the permission to use this command');
                return;
            } else if (parsedArgs[0] === undefined || parsedArgs[1] === undefined) {
                await message.reply('Please input a name and a scope for the new role');
                return;
            }
            switch (parsedArgs[1]) {
                case 'admin':
                    await message.guild.roles.create({
                        name: parsedArgs[0],
                        color: 'Red',
                        permissions: [PermissionsBitField.Flags.Administrator],
                        position: message.guild.members.me.roles.botRole.position,
                    });
                    message.channel.send(`New role "${parsedArgs[0]}" with administrator scope created by <@${message.author.id}> at ${date.toLocaleDateString('en-GB')} ${date.toLocaleTimeString('default')}`);
                    break;
                case 'regular':
                    await message.guild.roles.create({
                        name: parsedArgs[0],
                        color: 'Green',
                        permissions: [PermissionsBitField.Default],
                        position: message.guild.members.me.roles.botRole.position - 5,
                    });
                    message.channel.send(`New role "${parsedArgs[0]}" with default scope created by <@${message.author.id}> at ${date.toLocaleDateString('en-GB')} ${date.toLocaleTimeString('default')}`);
                    break;
                default:
                    message.reply('Unknown permission scope, you can only use admin and regular (Format: -rolecreate {name} {admin/regular}');
                    break;
            }
            break;

        case 'roledelete':
            if (!message.member.permissionsIn(message.channel).has('Administrator')) {
                message.reply('You dont have the permission to use this command');
                return;
            } else if (parsedArgs[0] === undefined) {
                await message.reply('Please input the name of the role you want to delete');
                return;
            }
            // I don't know if an error will happen here, if it does I'll change it to send a message instead of just logging
            try {
                const chosenRole = message.guild.roles.cache.find(role => role.name === parsedArgs[0]);
                await chosenRole.delete();
                message.channel.send(`Role "${chosenRole.name}" was deleted by <@${message.author.id}> at ${date.toLocaleDateString('en-GB')} ${date.toLocaleTimeString('default')}`);
            } catch (err) {
                log(error(err));
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
                    try {
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
                    } catch (err) {
                        log(error(err));
                        message.channel.send('This api has encountered an error, possibly a timeout. If this persists contact the bot owner if available');
                    }
                    break;

                case 'dog':
                    try {
                        const randomDogRequest = await request('https://dog.ceo/api/breeds/image/random');
                        const randomDog = await randomDogRequest.body.json();
                        const randomDogEmbed = new EmbedBuilder()
                            .setColor([117, 65, 240])
                            .setTitle('A random dog!')
                            .setDescription('woof!')
                            .setImage(randomDog.message)
                            .setTimestamp()
                            .setFooter({ text: `Prompted by ${message.author.username}` });
                        message.channel.send({ embeds: [randomDogEmbed] });
                    } catch (err) {
                        log(error(err));
                        message.channel.send('This api has encountered an error, possibly a timeout. If this persists contact the bot owner if available');
                    }
                    break;

                // Add lorem picsum later

                case 'joke':
                    try {
                        const randomjokeRequest = await request('https://api.api-ninjas.com/v1/dadjokes?limit=1', { headers: { 'X-Api-Key': data.config.apiNinjasKey } });
                        const randomJoke = await randomjokeRequest.body.json();
                        message.reply(randomJoke[0].joke);
                    } catch (err) {
                        log(error(err));
                        message.channel.send('This api has encountered an error, possibly a timeout. If this persists contact the bot owner if available');
                    }
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
            break;

        case 'ppsize':
            // I love coding I love coding I love coding I love coding I love coding I love coding I love coding I love coding I love coding I love coding I love coding I love coding
            message.channel.send(`<@${message.member.id}>'s dick is this big:\n8${'='.repeat(randomNumber * 14)}D`);
            break;

        default:
            await message.reply('Unknown command... maybe do -help?');
    }
});

if (!useDevAccount) {
    client.login(data.config.token);
} else {
    client.login(data.config.testingToken);
}