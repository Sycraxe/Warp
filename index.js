const fs = require('fs');
const { Client, GatewayIntentBits, Collection } = require('discord.js');

const { token } = require('./config.json');

const client = new Client({ intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
	GatewayIntentBits.GuildVoiceStates
] });

const db = {
	"lambda": {
		channel: null,
		connection: null,
		members: new Collection(),
		mixer: null
	},
	"kappa": {
		channel: null,
		connection: null,
		members: new Collection(),
		mixer: null
	}, 
}

client.commands = new Collection()
for (const file of fs.readdirSync('./commands').filter(file => file.endsWith('.js'))) {
	const command = require(`./commands/${file}`)
	client.commands.set(command.data.name, command)
}

for (const file of fs.readdirSync('./events').filter(file => file.endsWith('.js'))) {
	const event = require(`./events/${file}`);
	if (event.once) client.once(event.name, (...args) => event.execute(...args, db));
	else client.on(event.name, (...args) => event.execute(...args, db));
}

client.login(token);