import type {
	ChatInputCommandInteraction,
	CommandInteraction,
	SlashCommandBuilder,
	SlashCommandOptionsOnlyBuilder,
	SlashCommandSubcommandsOnlyBuilder,
} from "discord.js"

export type Commands = SlashCommand | SlashCommandOptions | SlashCommandSubcommands
export type SlashCommand = {
	data: SlashCommandBuilder
	execute: (interaction: CommandInteraction) => Promise<any>
}
export type SlashCommandOptions = {
	data: SlashCommandOptionsOnlyBuilder
	execute: (interaction: ChatInputCommandInteraction) => Promise<any>
}
export type SlashCommandSubcommands = {
	data: SlashCommandSubcommandsOnlyBuilder
	execute: (interaction: ChatInputCommandInteraction) => Promise<any>
}
