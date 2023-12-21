const fs = require('node:fs')
const { REST } = require('@discordjs/rest')
const { Routes } = require('discord-api-types/v9')
const { token, client, guilds } = require('./config.json')

const commands = []
for (const file of fs.readdirSync('./commands').filter(file => file.endsWith('.js'))) {
	const command = require(`./commands/${file}`)
	commands.push(command.data.toJSON())
}

const rest = new REST({ version: '9' }).setToken(token)

guilds.forEach(guild => {
	rest.put(Routes.applicationGuildCommands(client, guild), { body: commands }).then().catch()
})