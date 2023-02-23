// Variables and classes
const startupSettings = require('./settings.json');
let testing = false;
let counting = startupSettings.count;
let countingTest = false;
let countingPath = 'count';
let verbose = false;
let useDevChannels = false;
let enableChatGPT = startupSettings.chatgpt;
let useDevAccount = false;
let logging = startupSettings.logging;
let randomEntertainment = startupSettings.randomentertainment;
let susRandomresponses = startupSettings.susrandomresponse;
let fChatResponses = startupSettings.fchatresponses;
let targeting = startupSettings.targeting;
// let logging = true;
let args;
const fs = require('fs');
const os = require('node:os');
const { PythonShell } = require('python-shell');
const chalk = require('chalk');
const error = chalk.redBright;
const sucess = chalk.greenBright;
const warn = chalk.yellowBright;
const log = console.log;
const { Client, Events, GatewayIntentBits, PermissionsBitField, codeBlock, ActivityType } = require('discord.js');
const readline = require('readline').createInterface({ input: process.stdin, output: process.stdout });
const config = require ('./config.json');
const { argv } = require('node:process');
const commandChannels = require('./command-lineChannels.json');
const susWords = require('./triggerWords.json');
const susResponses = require('./triggerResponses.json');
const entertainment = require('./randomEntertainment.json');
const info = require('./info.json');
const prefix = '-';
// Launch Arguments

argv.forEach((val) => {
    // console.log(`${index}: ${val}`);
    // console.log(val);
    args = [val];
    // log(args);
    if (args.includes('-h' || '-help')) {
        log(chalk.blueBright(chalk.bold('-h -help -testing -nocount -testcount -verbose -usedev -nolog -nogpt -testingAccount')));
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
        if (args.includes('-nogpt')) {
            enableChatGPT = false;
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

function fileAppend(name, text, encoding, cb) {
    fs.appendFile(name, `\n${text}`, encoding, err => {
        if (err) {
            return cb && cb(err);
        }
        if (verbose) log('WriteSuccessfull');
    });

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

function userInput() {
    readline.question('', uinput => {
        const commandArray = uinput.split(' ');
        let evenTest = 0;
        // log(commandArray);try
        switch (commandArray[0]) {
            case 'help':
                log(chalk.blueBright(chalk.bold('quit disableCount enableCount sendMessage {channel} {message} channelList toggleChatGPT')));
                break;
            case 'quit':
                log(error('QUITTING'));
                process.exit();
            // eslint-disable-next-line no-fallthrough
            case 'disableCount':
                if (counting) {
                    counting = false;
                    log(sucess('Counting is now disabled'));
                    break;
                }
                log(warn('The bot is currently not counting'));
                break;
            case 'enableCount':
                if (!counting) {
                    counting = true;
                    log(sucess('Counting is now enabled'));
                    break;
                }
                log(warn('The bot is already counting'));
                break;
            case 'toggleChatGPT':
                if (!enableChatGPT) {
                    enableChatGPT = true;
                    log(sucess('ChatGPT is now enabled'));
                } else {
                    enableChatGPT = false;
                    log(sucess('ChatGPT is now disabled'));
                }
                break;
            case 'sendMessage':
                // Check if we have a channel chosen
                if (commandArray.length > 1) {
                    log('CommandArray passes lenghtCheck');
                    if (commandChannels.channels.some(element => commandArray[1].includes(element)) && !useDevChannels) {
                        // Find the channel IDs and then take care of data formatting. Remove the first 2 entries of the command array with splice()
                        // ['sendMessage', 'General', 'FOO', 'BAR'] -> ['FOO', 'BAR']
                        const channelID = commandChannels.channels[commandChannels.channels.indexOf(commandArray[1]) + 1];
                        const channelSend = client.channels.cache.find(channelOverride => channelOverride.id === channelID);
                        commandArray.splice(0, 2);
                        // Join any remaining entries in the array and separate them with spaces. ['FOO', 'BAR'] -> 'FOO BAR'
                        const joinedArr = commandArray.join(' ');
                        if (!/\S/.test(joinedArr)) {
                        log(error('NonFatalError: '), warn('Cannot send messages composed of only whitespace'));
                        break;
                        }
                        channelSend.send(joinedArr);
                        // Prevent the bot from sending an empty string (only spaces)
                    } else if (!useDevChannels) { log(error('NonFatalError: '), warn('Missing channel, do the channelList command to get a list of available channels (mounted to a json file)')); }
                    if (useDevChannels) {
                        if (commandChannels.channelsDev.some(element => commandArray[1].includes(element))) {
                            // Find the channel IDs and then take care of data formatting. Remove the first 2 entries of the command array with splice()
                            // ['sendMessage', 'General', 'FOO', 'BAR'] -> ['FOO', 'BAR']
                            const channelID = commandChannels.channelsDev[commandChannels.channelsDev.indexOf(commandArray[1]) + 1];
                            const channelSend = client.channels.cache.find(channelOverride => channelOverride.id === channelID);
                            commandArray.splice(0, 2);
                            // Join any remaining entries in the array and separate them with spaces. ['FOO', 'BAR'] -> 'FOO BAR'
                            const joinedArr = commandArray.join(' ');
                            // Prevent the bot from sending an empty string (only spaces)
                            if (!/\S/.test(joinedArr)) {
                                log(error('NonFatalError: '), warn('Cannot send messages composed of only whitespace'));
                                break;
                            }
                            channelSend.send(joinedArr);
                        } else { log(error('NonFatalError: '), warn('Missing channel, do the channelList command to get a list of available channels (mounted to a json file)')); }
                    }
                }
                break;
            case 'channelList':
                // Important to note that we are testing if a number is even because the file structure goes CHANNEL NAME, ID and so on, so 0 is the first name, 2 is the second name and so on.
                if (useDevChannels) {
                    for (let i = 0; i < commandChannels.channelsDev.length; i++) {
                        evenTest = i % 2;
                        if (evenTest === 0) {
                            process.stdout.write(chalk.blueBright(chalk.bold(commandChannels.channelsDev[i])) + ' ');
                        }
                        process.stdout.write('\n');
                    }
                    break;
                }
                for (let i = 0; i < commandChannels.channels.length; i++) {
                    evenTest = i % 2;
                    if (evenTest === 0) {
                        process.stdout.write(chalk.blueBright(chalk.bold(commandChannels.channels[i])) + ' ');
                    }
                }
                process.stdout.write('\n');
                break;
        }
        readline.close;
        userInput();
    });
}
// Run this only once when the client is ready
// Arrow function using 'c' as a parameter for client so we don't have conflicting vars
client.once(Events.ClientReady, c => {
    log(sucess(`Ready! Logged in as ${c.user.tag}`));
    client.user.setActivity('The Swomp', { type: ActivityType.Watching });
    if (!testing) {
        const channelToSend = client.channels.cache.find(preChannel => preChannel.id === '691438591829868617');
        if (channelToSend) {
            channelToSend.send('https://tenor.com/view/3kilksphillip-hello-run-csgo-gif-20739439');
        } else {
            log(warn('Swomp general channel not found, are you running this on another server or was the channel removed?'));
        }
    }
    userInput();
});

// This here will read the chat, I've worked on this for so many hours I'd like to process.exit() myself
client.on(Events.GuildMemberAdd, member => {
    const townsRole = member.guild.roles.cache.find(r => r.id === config.townspersonRole);
    const countRol = member.guild.roles.cache.find(r => r.id === config.countRole);
    const announcements = member.guild.channels.cache.find(c => c.id === config.announcementsChannel);
    member.roles.add(townsRole).catch(console.error);
    member.roles.add(countRol).catch(console.error);
    announcements.send(`Hello <@${member.id}>! Welcome to the Swomp, make sure to read the rules in <#${config.rulesChannel}>`);
});

client.on(Events.MessageCreate, async message => {
    const randomNumber = Math.random();
    const date = new Date(message.createdTimestamp);
    log(chalk.blueBright(chalk.bold(message.author.username) + chalk.whiteBright(' on ') + chalk.cyanBright(chalk.bold(message.channel.name)) + chalk.whiteBright(' > ', message.content)));
    // Logs the questioning channel
    if (message.channel.id === config.questioningChannel) {
        fileAppend('questioningLogs.txt', `${date}: ${message.author.username} on ${message.channel.name} > ${message.content}`, 'utf-8', (err) => {
            if (err) {
                log(error('Error writing file', err));
            }
        });
    }
    // Logs everything else
    if (message.author.id !== config.CHEESEBOT && logging && message.channel.id !== config.questioningChannel) {
        fileAppend('logs.txt', `${date}: ${message.author.username} on ${message.channel.name} > ${message.content}`, 'utf-8', (err) => {
            if (err) {
                log(error('Error writing file', err));
            }
        });
    }
    if (verbose) log(`Random Number = ${randomNumber}`);
    // This is for the count channel
    if (counting) {
        if (countingTest) {
          config.countChannel = config.countChannelDev;
          countingPath = 'devCount';
        }
        if (message.channel.id === config.countChannel && !message.author.bot) {
            const messageToNumber = parseInt(message.content);
            if (verbose) log(messageToNumber);
            if (isNaN(messageToNumber)) return;
            jsonReader(`./${countingPath}.json`, (err, countData) => {
                if (err) {
                    log(error('Error reading file', err));
                }
                if (messageToNumber === countData.next && message.author.id != countData.prevID) {
                    countData.prevID = message.author.id;
                    countData.current = messageToNumber;
                    countData.next++;
                    if (countData.current > countData.highscore) {
                        countData.highscore = countData.current;
                    }
                    fs.writeFile('./count.json', JSON.stringify(countData), err => {
                        if (err) {
                            log(error('Error writing file:', err));
                            message.channel.send('Error writing to disk!');
                        }
                    });
                    message.react('✅');
                    if (verbose) log(countData);
                } else {
                    countData.prevID = message.author.id;
                    countData.current = 0;
                    countData.next = 1;
                    fs.writeFile('./count.json', JSON.stringify(countData), err => {
                        if (err) {
                        log(error('Error writing file:', err));
                        message.channel.send('Error writing to disk!');
                        }
                    });
                    message.react('❌');
                    if (verbose) log(countData);
                    message.channel.send(`<@${message.author.id}> ruined it! Laugh at this blunder!\nHighscore:${countData.highscore}`);
                }
            });
        }
    }
    // Funny chat responses idk
    if (susWords.words.some(element => message.content.toLowerCase().includes(element)) && susRandomresponses) {
        message.reply(susResponses.responses[Math.floor(randomNumber * susResponses.responses.length)]);
    }
    /* Easily abusable, fix fix fix!
    if (message.author.id === target) {
        message.channel.send('https://media.discordapp.net/attachments/900756167532376125/1062752488526205018/fuck_you.gif');
    }
    */
    if (!message.content.startsWith(prefix) || message.author.bot) return;
    // Command Handling
    const preProcess = message.content.slice(prefix.length).split(/ + /);
    const preProceess0 = preProcess.shift().toLowerCase();
    const messageArray = preProceess0.split(' ');
    const command = messageArray[0];
    let preProcessedArg = '';
    let defaultArg = 0;
    // if (verbose) console.log(chalk.blueBright(messageArray));
    // if (verbose) console.log(`preProcess = ${preProcess}\npreProcess0 = ${preProceess0}\nmessageArray = ${messageArray}\ncommand = ${command}\nmessageArray Lenght = ${messageArray.length}`);
    let containsArg = false;
    if (messageArray.length !== 1) {
        containsArg = true;
        preProcessedArg = messageArray[1];
        defaultArg = parseInt(preProcessedArg);
        if (verbose) log(chalk.blueBright(containsArg));
    }
    switch (command) {
        case 'settings':
            if (message.member.permissionsIn(message.channel).has('Administrator')) {
                // Maybe remove this if statement, but it's 2:22 am
                if (messageArray.length === 2) {
                    jsonReader('./settings.json', (err, settingsData) => {
                        if (err) {
                            log(error('Error reading file', err));
                        }
                        const nameArg = messageArray[1];
                        log(nameArg);
                        if (nameArg === 'list') {
                            if (verbose) log(JSON.stringify(settingsData).replace(/{*"*}*/g, '').replace(/,/g, '\n').replace(/:/g, ': ').replace(/false/g, 'disabled').replace(/true/g, 'enabled'));
                            // Formats the json to be ordered and separated by \n
                            message.channel.send(codeBlock(JSON.stringify(settingsData).replace(/{*"*}*/g, '').replace(/,/g, '\n').replace(/:/g, ': ').replace(/false/g, 'disabled').replace(/true/g, 'enabled')));
                        } else if (nameArg === 'help') {
                            message.reply('The settings command allows you to change the bot settings on runtime, previously this was only possible on compile/init arguments, to use it follow the syntax below:```-settings {setting} {true/false}``` To find the list of settings do:```-settings list```');
                        } else {
                            message.reply('Unknown command, did you mean to do the following commands? ```-settings list | -settings help```');
                        }
                    });
                } else if (messageArray.length === 3) {
                    jsonReader('./settings.json', (err, settingsData) => {
                        if (err) {
                            log(error('Error reading file', err));
                        }
                        // Avoids endless if statements by parsing the settings and changing the values on the specific key automatically
                        const nameArg = messageArray[1];
                        const boolArg = (messageArray[2].toLowerCase() === 'true');
                        const jsonData = JSON.parse(JSON.stringify(settingsData));
                        // I need that below so I can see if the json has the key we're trying to change
                        // eslint-disable-next-line no-prototype-builtins
                        if (!jsonData.hasOwnProperty(nameArg)) {
                            message.reply('Entry does not exist, did your message have a typo?\nTo see a list of settings do: ```-settings list``` to see a list of changeable settings\nThe syntax is: ```-settings {setting} {true/false}```');
                            return;
                        }
                        jsonData[nameArg] = boolArg;
                        // Sync variables, is this slow?
                        enableChatGPT = jsonData.chatgpt;
                        logging = jsonData.logging;
                        susRandomresponses = jsonData.susrandomresponses;
                        fChatResponses = jsonData.fchatresponses;
                        randomEntertainment = jsonData.randomentertainment;
                        targeting = jsonData.targeting;
                        counting = jsonData.count;
                        if (verbose) {
                            log(jsonData);
                            log(`${enableChatGPT}\n${logging}\n${susRandomresponses}\n${fChatResponses}\n${randomEntertainment}\n${targeting}\n${counting}`);
                        }
                        fs.writeFile('./settings.json', JSON.stringify(jsonData), err => {
                            if (err) {
                                log(error('Error writing to disk', err));
                            }
                        });
                    });
                } else {
                    message.reply('Please input a valid command, or, to see a list of settings do: ```-settings list```\nThe syntax is ```-settings {setting} {true/false}```');
                }
            } else {
                message.reply('You do not have the permission to use this command');
            }
            break;
        case 'chatgpt':
                if (!enableChatGPT) {
                    message.reply('Chat GPT is currently disabled, this might be for testing or the service has been blocked due to payments');
                    return;
                }
                // Join args
                messageArray.splice(0, 1);
                // eslint-disable-next-line no-case-declarations
                const prompt = messageArray.join(' ');
                log(prompt);
                // channelSend.send(joinedArr);
                message.reply('Generating...');
                try {
                    // Can cause crashes with certain chars;
                    PythonShell.run('./chatGPT.py', { args: [prompt] }, function(results) {
                        // if (err) throw new err;
                        if (results === null) {
                            log(error('NULL RESULT FROM CHATGPT'));
                            message.reply('Null response, oops!');
                            return;
                        }
                        if (verbose) log(results);
                        // log(results.toString().length);
                        if (results.toString.length < 2000) {
                            message.channel.send(results.join('\n'));
                        } else {
                            message.reply('Generated message is too long!');
                        }
                    });
                } catch (err) {
                    console.error(err);
                }
                break;
        case 'emergencyswitch':
            if (message.author.id === config.OwnerID || message.author.id === config.HelperID) {
                await message.channel.send('Quitting...');
                await message.channel.send('https://tenor.com/view/bye-ironic-meme-raffiboss22-ifunny-ironic-ifunny-gif-gif-19834066');
                log(warn('WARNING: ') + 'bot shutdown initiated by ' + warn(message.author.username));
                process.exit();
            }
            break;
        case 'versionnumber':
            await message.channel.send(`Bot is currently running version ${info.version}`);
            break;
        case 'credits':
            await message.channel.send(info.credits);
            break;
        case 'latestupdate':
            await message.channel.send(info.update);
            break;
        case 'help':
            await message.channel.send(codeBlock(info.commands));
            break;
        case 'randomvideo':
            if (!randomEntertainment) return;
            await message.reply(`Here is your video: ${entertainment.videos[Math.floor(randomNumber * entertainment.videos.length)]}`);
            break;
        case 'randomimage':
            if (!randomEntertainment) return;
            await message.channel.send(entertainment.images[Math.floor(randomNumber * entertainment.images.length)]);
            break;
        case 'randomgif':
            if (!randomEntertainment) return;
            await message.channel.send(entertainment.gifs[Math.floor(randomNumber * entertainment.gifs.length)]);
            break;
        case 'randommusic':
            if (!randomEntertainment) return;
            await message.channel.send(entertainment.music[Math.floor(randomNumber * entertainment.music.length)]);
            break;
        case 'sysinfo':
            await message.channel.send(codeBlock(`CPU ARCHITECTURE: ${os.arch()}\nTOTAL MEMORY: ${os.totalmem / 1e+9}GB\nFREE MEMORY: ${os.freemem / 1e+9}GB\nMACHINE TYPE: ${os.machine}\nOPERATING SYSTEM: ${os.type()}\nUPTIME (IN SECONDS): ${os.uptime}`));
            break;
        case 'bulkdel':
            // Checks to see if the person has admin
            // TODO: Maybe make it a role specific command? <- sure?
            if (!message.member.permissionsIn(message.channel).has('Administrator')) return;
            if (!containsArg || !Number.isInteger(defaultArg)) {
                await message.reply('Please enter a number for the amount of messages to delete!');
                if (verbose) log(error('noarg'));
                return;
            }

            if (defaultArg > 100) {
                await message.reply('Cannot delete more than 100 messages at a time, the bot will delete 100 messages now and you can delete the remaining ones with another command!');
                defaultArg = 100;
                if (verbose) log(error('arg int exceed 100'));
            }

            try {
                await message.channel.bulkDelete(defaultArg);
            } catch (err) {
                if (err.toString().includes('DiscordAPIError[50034]')) {
                    await message.reply('You can only bulk delete messages that are under 14 days old');
                    break;
                }
                await message.reply('It seems that you did not use a number as the argument to this command, please try again.');
                log(error(err));
            }
            break;
        case 'rolecreate':
            if (!message.member.permissionsIn(message.channel).has('Administrator')) {
                message.reply('You dont have the permission to use this command');
                return;
            }
            if (!containsArg && !messageArray[2]) {
                await message.reply('Please input a name and a scope for the new role');
                return;
            }
            // message.guild accesses the specific server the command was ran in
            switch (messageArray[2]) {
                case 'admin':
                    await message.guild.roles.create({ name: messageArray[1], color: 'Red', permissions: [PermissionsBitField.Flags.Administrator], position: message.guild.members.me.roles.botRole.position });
                    await message.channel.send(`New role "${messageArray[1]}" with administrator scope created by <@${message.author.id}> at ${date.toLocaleDateString('en-GB')} ${date.toLocaleTimeString('default')}`);
                    break;
                case 'normal':
                    await message.guild.roles.create({ name: messageArray[1], color: 'Green', permissions: [PermissionsBitField.Default], position: message.guild.members.me.roles.botRole.position - 5 });
                    await message.channel.send(`New role "${messageArray[1]}" with default scope created by <@${message.author.id}> at ${date.toLocaleDateString('en-GB')} ${date.toLocaleTimeString('default')}`);
                    break;
                default:
                    await message.reply('Format: -rolecreate {name} {admin/normal}');
            }
            break;
        case 'roledelete':
            if (!message.member.permissionsIn(message.channel).has('Administrator')) {
                await message.reply('You dont have the permission to use this command');
                return;
            }
            if (!containsArg) {
                await message.reply('Please input the role name');
                return;
            }
            // Should let the user know if an error happens but that can be fixed later
            try {
                const chosenRole = message.guild.roles.cache.find(role => role.name === messageArray[1]);
                await message.channel.send(`Role "${chosenRole.name}" was deleted by <@${message.author.id}> at ${date.toLocaleDateString('en-GB')} ${date.toLocaleTimeString('default')}`);
                chosenRole.delete();
            } catch (err) {
                log(error(err));
            }
            break;
        case 'ppsize':
            // TODO: Make randomness better, right now it's like the average r/teenagers post (GUYS MY DICK IS 200 INCHES LONG!!!)
            await message.channel.send(`<@${message.member.id}>'s dick is ${(randomNumber * 14).toFixed(2)} inches long!\n 8${'='.repeat(randomNumber * 14)}D`);
            break;
        default:
            await message.reply('Unknown command... maybe do -help?');
    }
});
// Log in to Discord, this should ALWAYS be the last line of code!
if (!useDevAccount) {
    client.login(config.token);
} else {
    client.login(config.testingToken);
}