const { SlashCommandBuilder, ChannelType } = require('discord.js');
const { joinVoiceChannel, getVoiceConnection } = require('@discordjs/voice');
const AudioMixer = require('audio-mixer');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('connect')
        .setDescription("Connect specified voice channel to Wormhole via an access")
        .addSubcommand(subcommand => {
            return subcommand
                .setName("kappa")
                .setDescription("Connect specified voice channel to Warp by the kappa access if available")
                .addChannelOption(option => option.setName("channel").setDescription("Voice channel").setRequired(true))
        })
        .addSubcommand(subcommand => {
            return subcommand
                .setName("lambda")
                .setDescription("Connect specified voice channel to Warp by the lambda access if available")
                .addChannelOption(option => option.setName("channel").setDescription("Voice channel").setRequired(true))
        }),

    async execute(interaction, db) {

        let subcommand = interaction.options.getSubcommand()

        let channel = interaction.options.getChannel("channel")
        if (channel.type !== ChannelType.GuildVoice) return await interaction.reply("Provided channel must be a voice channel");

        if (channel.guild == db.lambda.channel?.guild || channel.guild == db.kappa.channel?.guild) {
            return await interaction.reply("Cannot connect both access points to the same server")
        }
        
        switch (subcommand) {
            case "lambda":
                if (db.lambda.connection) return await interaction.reply("Lambda access point is already occupied");

                db.lambda.channel = channel
                db.lambda.connection = joinVoiceChannel({
                    channelId: channel.id,
                    guildId: channel.guild.id,
                    adapterCreator: channel.guild.voiceAdapterCreator,
                    selfDeaf: false
                });

                return await interaction.reply("Lambda access point successfully connected to this server");

            case "kappa":
                if (db.kappa.connection) return await interaction.reply("Kappa access point is already occupied");

                db.kappa.channel = channel
                db.kappa.connection = joinVoiceChannel({
                    channelId: channel.id,
                    guildId: channel.guild.id,
                    adapterCreator: channel.guild.voiceAdapterCreator,
                    selfDeaf: false
                });

                return await interaction.reply("Kappa access point successfully connected to this server");
        }
        
        return await interaction.reply("Access point must be specified");

    }
}