import type { CommandInteraction, SlashCommandBuilder } from "discord.js"

export type command = {
	data: SlashCommandBuilder
	execute: (interaction: CommandInteraction) => Promise<void>
}


