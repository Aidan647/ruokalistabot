import { type ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js"
import type { Commands, SlashCommand } from "./types"
export default {
	data: new SlashCommandBuilder()
		.setName("test")
		.setDescription("Provides information about the user."),
	async execute(interaction) {
		// interaction.user is the object representing the User who ran the command
		// interaction.member is the GuildMember object, which represents the user in the specific guild
		await interaction.reply(`This command was run by ${interaction.user.username}.`)
	},
} satisfies SlashCommand
