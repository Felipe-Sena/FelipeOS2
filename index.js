/* eslint-disable no-case-declarations*/
'use strict';
/*
----------------------------------------------------------------------------------------------------------------------------------
    Copyright: Felipe Sena Costa | 2023 | Licensed under the GNU General Public License
    Required modules:
        discord.js
        core.js (included)
        FScramble.exe (included)
        chalk
        undici
----------------------------------------------------------------------------------------------------------------------------------
*/

/*
----------------------------
REQUIRES
----------------------------
*/

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const core = require('./js/sub_programs/core');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');

/*
----------------------------
CHALK SETUP
----------------------------
*/

const emph = chalk.italic.rgb(102, 0, 255).bold;
const good = chalk.italic.greenBright.bold;
const warn = chalk.italic.yellowBright.bold;
const bad = chalk.italic.bgRedBright.black.bold;

/*
----------------------------
VARIABLE SECTION
----------------------------
*/

const client = new Client({ intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildBans,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
] });

client.commands = new Collection();
client.cooldowns = new Collection();

/*
----------------------------
ENTRY POINT
----------------------------
*/

(async () => {
    const token = await core.token_manager('start /b ./key_manager/FScramble.exe decrypt ./key_manager/output/crypt ./key_manager/output/keys')
        .then().catch((error) => console.log(error));

    client.once(Events.ClientReady, client_user => {
        console.log(good(`Startup finished. Logged in as ${client_user.user.tag}`));
    });


    /*
    ----------------------------
    Retrieve slash command files
    ----------------------------
    */

    const path_to_folders = path.join(__dirname, 'js', 'commands', 'slash');

    // Get an array of folders under "slash"
    const command_folders = fs.readdirSync(path_to_folders);

    for (const folder of command_folders) {
        const path_to_commands = path.join(path_to_folders, folder);

        // Get all of the .js files
        const command_files = fs.readdirSync(path_to_commands).filter(file => file.endsWith('.js'));
        for (const file of command_files) {
            const file_path = path.join(path_to_commands, file);
            const command = require(file_path);

            // Set a new item in the Collection

            if ('data' in command && 'execute' in command) {
                client.commands.set(command.data.name, command);
            } else {
                console.log(warn('[WARNING]'), emph(` The command at ${warn(file_path)} is missing a required "data" or "execute" property`));
            }

        }

    }

    /*
    ----------------------------
    Handle Interactions (slash commands)
    ----------------------------
    */

    client.on(Events.InteractionCreate, async (interaction) => {
        if (!interaction.isChatInputCommand()) return;

        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) {
            await interaction.reply({ content: `No command matching ${interaction.commandName} was found.`, ephemeral: true });
            return;
        }

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(bad('[ERROR]'), ' ', error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'There was an error while executing this command.', ephemeral: true });
            } else {
                await interaction.reply({ content: 'There was an error while executing this command.', ephemeral: true });
            }
        }
    });

    /*
    ----------------------------
    Handle messages (messages)
    ----------------------------
    */

    // TODO: Splice the messages to organize them into arrays
    client.on(Events.MessageCreate, (message_event) => {
        console.log(message_event.content);
    });

    client.login(token);
})();


module.exports = { client };