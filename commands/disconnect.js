const {SlashCommandBuilder} = require('discord.js');
const {getVoiceConnection} = require('@discordjs/voice');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('disconnect')
        .setDescription("Disconnect kappa or lambda access if present on this server"),

    async execute(interaction) {
        getVoiceConnection(interaction.guild.id)?.destroy();
        return interaction.reply('All access on this server are now disconnected');
    }
}