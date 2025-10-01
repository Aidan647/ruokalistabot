import { REST, Routes, type RESTPostAPIChatInputApplicationCommandsJSONBody } from "discord.js"
import getFood from "./getFood"
import type { Commands, SlashCommand } from "./types"
import setRole from "./setRole"
import getRole from "./getRole"
import setChannel from "./setChannel"
import logger from "../../logger"

export const rawCommands = new Map<string, Commands>()
function addCommand(command: Commands) {
	rawCommands.set(command.data.name, command)
}
// addCommand(test)
addCommand(getFood)
addCommand(setRole)
addCommand(getRole)
addCommand(setChannel)

// and deploy your commands!
export async function deployCommands() {
	const commands: RESTPostAPIChatInputApplicationCommandsJSONBody[] = []

	for (const [name, rawCommand] of rawCommands) {
		commands.push(rawCommand.data.toJSON())
	}

	// Construct and prepare an instance of the REST module
	const rest = new REST().setToken(Bun.env.BOT_TOKEN)

	logger.info(`Started refreshing ${commands.length} application (/) commands.`)

	// The put method is used to fully refresh all commands in the guild with the current set
	const data: any = await rest
		.put(Routes.applicationCommands("687941263168765963"), { body: commands })
		.catch((err) => {
			logger.error("Failed to deploy commands:", err)
			throw err
		})

	logger.info(`Successfully reloaded ${data.length} application (/) commands.`)
}
