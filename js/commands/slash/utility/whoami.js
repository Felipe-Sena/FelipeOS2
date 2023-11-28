const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Show messages sent, time in vc, etc
// Make it a discord embed

// it don't wok :c

module.exports = {
    data: new SlashCommandBuilder()
        .setName('whoami')
        .setDescription('Gives information about the user who ran the command.'),

        async execute(interaction) {
            const user_info_embed = [
                new EmbedBuilder()
                    .setTitle(`${interaction.user.username}'s information:`),
            ];
            await interaction.reply({ embeds: [user_info_embed] });
        },
};