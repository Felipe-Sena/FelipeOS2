// Require the necessary discord.js classes
const version = '1.0.5';
let testing = false;
const fs = require('fs');
const { Client, Events, GatewayIntentBits, PermissionsBitField, codeBlock, ActivityType } = require('discord.js');
const config = require ('./config.json');
const { argv } = require('node:process');
const susWords = require('./triggerWords.json');
const susResponses = require('./triggerResponses.json');
const entertainment = require('./randomEntertainment.json');
const info = require('./info.json');
const prefix = '-';
// Launch Arguments

// print process.argv
argv.forEach((val) => {
  // console.log(`${index}: ${val}`);
  // console.log(val);
  const arg = [val];
  console.log(arg);
  if (arg.includes('-testing')) {
    testing = true;
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

// Run this only once when the client is ready
// Arrow function using 'c' as a parameter for client so we don't have conflicting vars
client.once(Events.ClientReady, c => {
    console.log(`Ready! Logged in as ${c.user.tag}`);
    client.user.setActivity('The Swomp', { type: ActivityType.Watching });
    if (!testing) {
        console.log('GIF SENT');
    }
});

// This here will read the chat, I've worked on this for so many hours I'd like to process.exit() myself

client.on('guildMemberAdd', member => {
    const townsRole = member.guild.roles.cache.find(r => r.id === config.townspersonRole);
    const countRol = member.guild.roles.cache.find(r => r.id === config.countRole);
    const announcements = member.guild.channels.cache.find(c => c.id === config.announcementsChannel);
    member.roles.add(townsRole).catch(console.error);
    member.roles.add(countRol).catch(console.error);
    announcements.send(`Hello <@${member.id}>! Welcome to the Swomp, make sure to read the rules in <#${config.rulesChannel}>`);
});

client.on(Events.MessageCreate, async message => {
    const randomNumber = Math.random();
    console.log(message.content);
    // This is for the count channel
    if (message.channel.id === config.countChannel && !message.author.bot) {
        const messageToNumber = parseInt(message.content);
        if (isNaN(messageToNumber)) return;
        jsonReader('./count.json', (err, countData) => {
            if (err) {
                console.log('Error reading file', err);
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
                        console.log('Error writing file:', err);
                        message.channel.send('Error writing to disk!');
                    }
                });
                message.react('✅');
            } else {
                console.log('uh oh!');
                countData.prevID = message.author.id;
                countData.current = 0;
                countData.next = 1;
                fs.writeFile('./count.json', JSON.stringify(countData), err => {
                    if (err) {
                      console.log('Error writing file:', err);
                      message.channel.send('Error writing to disk!');
                    }
                });
                message.react('❌');
                message.channel.send(`<@${message.author.id}> ruined it! Laugh at this blunder!\nHighscore:${countData.highscore}`);
            }
        });
        // console.log(messageToNumber);
    }
    // Funny chat responses idk
    if (susWords.words.some(element => message.content.toLowerCase().includes(element))) {
        console.log('WORKING');
        message.reply(susResponses.responses[Math.floor(randomNumber * susResponses.responses.length)]);
    }
    /* Easily abusable, fix fix fix!
    if (message.author.id === target) {
        message.channel.send('https://media.discordapp.net/attachments/900756167532376125/1062752488526205018/fuck_you.gif');
    }
    */
    if (!message.content.startsWith(prefix) || message.author.bot) return;
    console.clear();
    // Command Handling
    const preProcess = message.content.slice(prefix.length).split(/ + /);
    const preProceess0 = preProcess.shift().toLowerCase();
    const messageArray = preProceess0.split(' ');
    const command = messageArray[0];
    let preProcessedArg = '';
    let defaultArg = 0;
    const date = new Date(message.createdTimestamp);
    console.log(messageArray);
    // console.log(`preProcess = ${preProcess}\npreProcess0 = ${preProceess0}\nmessageArray = ${messageArray}\ncommand = ${command}\nmessageArray Lenght = ${messageArray.length}`);
    let containsArg = false;
    if (messageArray.length !== 1) {
        containsArg = true;
        preProcessedArg = messageArray[1];
        defaultArg = parseInt(preProcessedArg);
        console.log(containsArg);
    }
    switch (command) {
        case 'emergencyswitch':
            if (message.author.id === config.OwnerID || message.author.id === config.HelperID) {
                await message.channel.send('Quitting...');
                await message.channel.send('https://tenor.com/view/bye-ironic-meme-raffiboss22-ifunny-ironic-ifunny-gif-gif-19834066');
                process.exit();
            }
            break;
        case 'versionnumber':
            await message.channel.send(`Bot is currently running version ${version}`);
            break;
        case 'credits':
            await message.channel.send(info.credits);
            break;
        case 'help':
            await message.channel.send(codeBlock(info.commands));
            break;
        case 'randomvideo':
            // console.log(Math.round(randomNumber * entertainment.videos.length));
            await message.reply(`Here is your video: ${entertainment.videos[Math.floor(randomNumber * entertainment.videos.length)]}`);
            break;
        case 'randomimage':
            await message.channel.send(entertainment.images[Math.floor(randomNumber * entertainment.images.length)]);
            break;
        case 'randomgif':
            await message.channel.send(entertainment.gifs[Math.floor(randomNumber * entertainment.gifs.length)]);
            break;
        case 'randommusic':
            await message.channel.send(entertainment.music[Math.floor(randomNumber * entertainment.music.length)]);
            break;
        case 'bulkdel':
            // Checks to see if the person has admin
            // TODO: Maybe make it a role specific command? <- sure?
            if (!message.member.permissionsIn(message.channel).has('Administrator')) return;
            if (!containsArg || !Number.isInteger(defaultArg)) {
                await message.reply('Please enter a number for the amount of messages to delete!');
                console.log('noarg');
                return;
            }

            if (defaultArg > 100) {
                await message.reply('Cannot delete more than 100 messages at a time, the bot will delete 100 messages now and you can delete the remaining ones with another command!');
                defaultArg = 100;
            }

            try {
                await message.channel.bulkDelete(defaultArg);
            } catch (error) {
                await message.reply('It seems that you did not use a number as the argument to this command, please try again.');
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
                console.log(err);
            }
            break;
        case 'ppsize':
            // TODO: Make randomness better, right now it's like the average r/teenagers post (GUYS MY DICK IS 200 INCHES LONG!!!)
            await message.channel.send(`<@${message.member.id}>'s dick is ${(randomNumber * 14).toFixed(2)} inches long!\n 8${'='.repeat(randomNumber * 14)}D`);
            break;
        default:
            await message.reply('Unknown command... maybe do -help?');
    }
    console.log(message.content);
});

// Log in to Discord, this should ALWAYS be the last line of code!
client.login(config.token);