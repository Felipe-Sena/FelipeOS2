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

const core = require('./js/sub_programs/core');
const { Client, Events, GatewayIntentBits } = require('discord.js');

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

/*
----------------------------
ENTRY POINT & SSTARTUP
----------------------------
*/

(async () => {
    const token = await core.token_manager('start /b ./key_manager/FScramble.exe decrypt ./key_manager/output/crypt ./key_manager/output/keys')
        .then().catch((error) => console.log(error));

    client.login(token);

})();


client.once(Events.ClientReady, client_user => {
    console.log(`Startup finished. Logged in as ${client_user.user.tag}`);
});

module.exports = { client };