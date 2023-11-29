const { SlashCommandBuilder } = require('discord.js');

// Show ping in ms

module.exports = {
    data: new SlashCommandBuilder()
        .setName('fos_ping')
        .setDescription('Replies with "Pong!"'),

        async execute(interaction) {
            await interaction.reply('Pong!');
        },
};