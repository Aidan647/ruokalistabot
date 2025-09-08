import { REST, Routes, type RESTPostAPIChatInputApplicationCommandsJSONBody } from "discord.js"
import test from "./test"
import getFood from "./getFood"
import type { Commands, SlashCommand } from "./types"

export const rawCommands = new Map<string, Commands>()
function addCommand(command: Commands) {
	rawCommands.set(command.data.name, command)
}
addCommand(test)
addCommand(getFood)

// and deploy your commands!
export async function deployCommands() {
	const commands: RESTPostAPIChatInputApplicationCommandsJSONBody[] = []

	for (const [name, rawCommand] of rawCommands) {
		commands.push(rawCommand.data.toJSON())
	}

	// Construct and prepare an instance of the REST module
	const rest = new REST().setToken(process.env.BOT_TOKEN)

	console.log(`Started refreshing ${commands.length} application (/) commands.`)

	// The put method is used to fully refresh all commands in the guild with the current set
	const data: any = await rest.put(
		Routes.applicationGuildCommands("687941263168765963", "684508139646877708"),
		{
			body: commands,
		}
	)
	await rest.put(Routes.applicationCommands("687941263168765963"), { body: [] })

	console.log(`Successfully reloaded ${data.length} application (/) commands.`)
}
