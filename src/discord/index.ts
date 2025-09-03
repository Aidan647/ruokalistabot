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
import { Client, Events, GatewayIntentBits } from "discord.js"
import type { command } from "./commands/types"
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

	// Log in to Discord with your client's token
	client.login(process.env.BOT_TOKEN)
	return client
}

