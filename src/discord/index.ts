if (!process.env.BOT_TOKEN) {
	console.log("No BOT_TOKEN found in environment variables")
	process.exit(501)
}

declare global {
	namespace NodeJS {
		interface ProcessEnv {
			readonly BOT_TOKEN: string
		}
	}
}

// Require the necessary discord.js classes
import {
	ActionRowBuilder,
	Client,
	Events,
	GatewayIntentBits,
	MessageFlags,
	NewsChannel,
	StageChannel,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
	TextChannel,
	VoiceChannel,
} from "discord.js"
import { rawCommands } from "./commands"
import DataCache from "../data/DataCache"
import getLocale from "./utility/locale"
import ServerStore from "../data/Server"
import { channel } from 'diagnostics_channel';

export async function startBot() {
	// Create a new client instance
	const client = new Client({ intents: [GatewayIntentBits.Guilds] })
	const cache = DataCache.getInctance()
	// client.commands = rawCommands
	// When the client is ready, run this code (only once).
	// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
	// It makes some properties non-nullable.
	client.once(Events.ClientReady, (readyClient) => {
		console.log(`Ready! Logged in as ${readyClient.user.tag}`)
	})
	client.on(Events.InteractionCreate, async (interaction) => {
		if (!interaction.isChatInputCommand()) return
		console.log(`Interaction received: ${interaction.commandName}`)
		const command = rawCommands.get(interaction.commandName)

		if (!command) {
			console.error(`No command matching ${interaction.commandName} was found.`)
			return
		}

		try {
			await interaction.deferReply({ flags: MessageFlags.Ephemeral });
			await command.execute(interaction)
		} catch (error) {
			console.error(error)
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({
					content: getLocale("commandError", interaction.locale === "fi"),
					flags: MessageFlags.Ephemeral,
				})
			} else {
				await interaction.reply({
					content: getLocale("commandError", interaction.locale === "fi"),
					flags: MessageFlags.Ephemeral,
				})
			}
		}
	})
	client.on(Events.InteractionCreate, async (interaction) => {
		if (!interaction.isStringSelectMenu()) return
		console.log(interaction.message.id)
		console.log("Interaction received:", interaction?.customId, interaction.id)
	})

	// Log in to Discord with your client's token
	await ServerStore.loadAll()
	await client.login(process.env.BOT_TOKEN)
	for (const server of ServerStore) {
		const guild = await client.guilds.fetch(server.serverId).catch(() => null)
		if (!guild) continue
		const channels = await guild.channels.fetch()
		const sendTo = new Set<NewsChannel | StageChannel | TextChannel | VoiceChannel>()
		for (const channelId of server.infoChannels) {
			if (!channels.has(channelId)) return server.infoChannels.delete(channelId)
			const channel = channels.get(channelId)
			if (!channel || !channel.isTextBased())
				return server.infoChannels.delete(channelId)
			if (!channel.permissionsFor(guild.members.me!).has("SendMessages")) return
			await channel.sendTyping()
			sendTo.add(channel)
		}
		await Bun.sleep(5000)
		for (const channel of sendTo) {
			await channel.send({
				content: `"food"`,
			})
		}
	}

	return client
}
