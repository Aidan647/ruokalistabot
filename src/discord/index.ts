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
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
} from "discord.js"
import type { SlashCommand } from "./commands/types"
import { rawCommands } from "./commands"
import DataCache from "../data/DataCache"
import getLocale from "./utility/locale"

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
	await client.login(process.env.BOT_TOKEN)
	await client.guilds
		.fetch("684508139646877708")
		.then((guild) => guild.channels.fetch("697376499199901697"))
		.then(async (channel) => {
			if (!channel?.isTextBased()) return
			if (!channel) return
			const select = new StringSelectMenuBuilder()
				.setCustomId("starter")
				.setPlaceholder("Make a selection!")
				.addOptions(
					new StringSelectMenuOptionBuilder().setLabel("Bulbasaur").setValue("bulbasaur"),
					new StringSelectMenuOptionBuilder()
						.setLabel("Charmander")
						.setValue("charmander"),
					new StringSelectMenuOptionBuilder().setLabel("Squirtle").setValue("squirtle")
				)

			const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select)

			const msg = await channel.send({
				content: "Choose your starter!",
				components: [row],
			})
			// await Bun.sleep(2000)
			// await msg.edit({ components: [] })
			return
		})
		.catch(console.error)
	return client
}
