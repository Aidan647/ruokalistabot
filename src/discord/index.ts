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
import { Client, Events, GatewayIntentBits, MessageFlags } from "discord.js"
import type { SlashCommand } from "./commands/types"
import { rawCommands } from "./commands"

export async function startBot() {
	// Create a new client instance
	const client = new Client({ intents: [GatewayIntentBits.Guilds] })
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
					content:
						interaction.locale === "fi"
							? "Komennon suorittamisessa tapahtui virhe!"
							: "There was an error while executing this command!",
					flags: MessageFlags.Ephemeral,
				})
			} else {
				await interaction.reply({
					content:
						interaction.locale === "fi"
							? "Komennon suorittamisessa tapahtui virhe!"
							: "There was an error while executing this command!",
					flags: MessageFlags.Ephemeral,
				})
			}
		}
	})

	// Log in to Discord with your client's token
	client.login(process.env.BOT_TOKEN)
	return client
}
