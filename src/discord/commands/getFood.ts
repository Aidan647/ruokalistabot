import { MessageFlags, SlashCommandBuilder } from "discord.js"
import type { SlashCommand, SlashCommandOptions } from "./types"
import z from "zod"
const weekday = z.enum(["monday", "tuesday", "wednesday", "thursday", "friday"])
export default {
	data: new SlashCommandBuilder()
		.setName("getFood")
		.setNameLocalization("fi", "ruoka")
		.setDescription("Day's food menu")
		.setDescriptionLocalization("fi", "Päivän ruokalista")
		.addStringOption((option) =>
			option
				.setName("day")
				.setNameLocalization("fi", "päivä")
				.addChoices(
					{ name: "monday", value: "monday", name_localizations: { fi: "maanantai" } },
					{ name: "tuesday", value: "tuesday", name_localizations: { fi: "tiistai" } },
					{
						name: "wednesday",
						value: "wednesday",
						name_localizations: { fi: "keskiviikko" },
					},
					{ name: "thursday", value: "thursday", name_localizations: { fi: "torstai" } },
					{ name: "friday", value: "friday", name_localizations: { fi: "perjantai" } }
				)
				.setDescription("Select the day you want the food menu for")
				.setDescriptionLocalization("fi", "Valitse päivä, jolta haluat ruokalistan")
				.setRequired(false)
		),
	async execute(interaction) {
		const lang = interaction.locale
		const check = weekday.nullable().safeParse(interaction.options.getString("day"))
		if (!check.success) {
			await interaction.reply({
				content: lang === "fi" ? "Virheellinen päivä!" : "Invalid day!",
				flags: MessageFlags.Ephemeral,
			})
			return
		}
		// interaction.user is the object representing the User who ran the command
		// interaction.member is the GuildMember object, which represents the user in the specific guild
		await interaction.reply(`This command was run by ${interaction.user.username}.`)
		console.log(interaction)
	},
} satisfies SlashCommandOptions
