if (!Bun.env.BOT_TOKEN) {
	console.info("No BOT_TOKEN found in environment variables")
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
import { Cron } from "croner"
import sendFood from "./sendFood"
import logger from "../logger"

export async function startBot(): Promise<readonly [Client<true>, Cron]> {
	// Create a new client instance
	const client = new Client({ intents: [GatewayIntentBits.Guilds] })
	// client.commands = rawCommands
	// When the client is ready, run this code (only once).
	// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
	// It makes some properties non-nullable.
	
	client.on(Events.InteractionCreate, async (interaction) => {
		if (!interaction.isChatInputCommand()) return
		const command = rawCommands.get(interaction.commandName)

		if (!command) {
			logger.error(`No command matching ${interaction.commandName} was found.`)
			return
		}

		try {
			await interaction.deferReply({ flags: MessageFlags.Ephemeral });
			await command.execute(interaction)
		} catch (error) {
			logger.error (error)
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
	// client.on(Events.InteractionCreate, async (interaction) => {
	// 	if (!interaction.isStringSelectMenu()) return
	// 	console.log(interaction.message.id)
	// 	console.log("Interaction received:", interaction?.customId, interaction.id)
	// })

	// Log in to Discord with your client's token
	await ServerStore.loadAll()
	const botready = new Promise<Client<true>>((resolve) => {
		client.once(Events.ClientReady, (client) => resolve(client))
	})
	await client.login(Bun.env.BOT_TOKEN)
	await botready
	if (!client.isReady()) {
		logger.error("Client failed to become ready after login")
		throw new Error("Client failed to become ready after login")
	}
	const cron = new Cron(
		Bun.env.FOOD_SEND_CRON,
		async () => {
			logger.info("Running scheduled food send")
			await sendFood(client)
		},
		{ timezone: Bun.env.TIMEZONE || "Europe/Helsinki" }
	)
	return [client, cron] as const
}
