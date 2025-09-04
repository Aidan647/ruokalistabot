import type { ChatInputCommandInteraction, CommandInteraction, SlashCommandBuilder, SlashCommandOptionsOnlyBuilder, SlashCommandSubcommandsOnlyBuilder } from "discord.js"

export type Commands = SlashCommand | SlashCommandOptions
export type SlashCommand ={
			data: SlashCommandBuilder
			execute: (interaction: CommandInteraction) => Promise<void>
	  }
export type SlashCommandOptions = {
	data: SlashCommandOptionsOnlyBuilder
	execute: (interaction: ChatInputCommandInteraction) => Promise<void>
}
	// | {
	// 		data: SlashCommandSubcommandsOnlyBuilder
	// 		execute: (interaction: ChatInputCommandInteraction) => Promise<void>
	//   }


