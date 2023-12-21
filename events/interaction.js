const {Events} = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction, db) {
        if (!(interaction.isChatInputCommand())) return;

        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) return;

        try { 
            await command.execute(interaction, db) 
        } 
        catch (error) {
            console.error(error)
            await interaction.reply({
                content: "Unexpected error happened during command execution",
                ephemeral: true
            })
        }
    }
}