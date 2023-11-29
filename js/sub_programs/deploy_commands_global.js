const core = require('./core');
const { REST, Routes } = require('discord.js');
const { clientId } = require('../../json/config.json');
const fs = require('fs');
const path = require('path');

const commands = [];

// Grab all of the command folders from the commands directory (slash)

const path_to_folders = path.join(__dirname, '..', 'commands', 'slash');
const command_folders = fs.readdirSync(path_to_folders);

for (const folder of command_folders) {
    // Now grab all of the command files

    const path_to_commands = path.join(path_to_folders, folder);
    const command_files = fs.readdirSync(path_to_commands).filter(file => file.endsWith('.js'));

    // Grab the SlashCommandBuilder output of data

    for (const file of command_files) {
        const path_to_file = path.join(path_to_commands, file);
        const command = require(path_to_file);

        if ('data' in command && 'execute' in command) {
            commands.push(command.data.toJSON());
        } else {
            console.log(`[WARNING] The command at ${path_to_file} is missing a required "data" or "execute" property.`);
        }
    }

}

// Construct and prepare a new instance of the REST module

async function constructRest() {
    const token = await core.token_manager('start /b ./../../key_manager/FScramble.exe decrypt ./../../key_manager/output/crypt ./../../key_manager/output/keys')
        .then().catch((error) => console.log(error));

    const rest = new REST().setToken(token);
    return rest;
}

(async () => {
    let rest;
    rest = await constructRest().then((value) => {
        rest = value;
        return rest;
    });
    try {
        console.log('[GLOBAL COMMANDS]');
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationCommands(clientId),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
    process.exit();
})();
