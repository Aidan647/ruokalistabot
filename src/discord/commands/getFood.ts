import { MessageFlags, SlashCommandBuilder } from "discord.js"
import type { SlashCommand, SlashCommandOptions } from "./types"
import z, { number } from "zod"
import { da } from "zod/locales"
import dayjs from "dayjs"
import DataCache from "../../data/DataCache"
const weekday = z.int().min(1).max(5)

// get dayobject of the next occurrence of the given weekday (1-5, mon-fri)
// if day is null, return today
// if today past 13:00, return next weekday
// if today is weekend, return next monday
function getFoodDay(day: z.infer<typeof weekday> | null): dayjs.Dayjs {
	const now = dayjs().add(12, "h").hour(0).minute(0).second(0).millisecond(0)
	const today = now.day()
	if (day === null) {
		if (today === 6) return now.add(2, "d")
		if (today === 0) return now.add(1, "d")
		return now
	}

	if (today === day) return now
	if (today < day) return now.day(day)

	return now.add(1, "week").day(day)
}
const dataCache = DataCache.getInctance()
export default {
	data: new SlashCommandBuilder()
		.setName("getfood")
		.setNameLocalization("fi", "ruoka")
		.setDescription("Day's food menu")
		.setDescriptionLocalization("fi", "Päivän ruokalista")
		.addNumberOption((option) =>
			option
				.setName("day")
				.setNameLocalization("fi", "päivä")
				.addChoices(
					{ name: "monday", value: 1, name_localizations: { fi: "maanantai" } },
					{ name: "tuesday", value: 2, name_localizations: { fi: "tiistai" } },
					{
						name: "wednesday",
						value: 3,
						name_localizations: { fi: "keskiviikko" },
					},
					{ name: "thursday", value: 4, name_localizations: { fi: "torstai" } },
					{ name: "friday", value: 5, name_localizations: { fi: "perjantai" } }
				)
				.setDescription("Select the day you want the food menu for")
				.setDescriptionLocalization("fi", "Valitse päivä, jolta haluat ruokalistan")
				.setRequired(false)
		),
	async execute(interaction) {
		const lang = interaction.locale
		const check = weekday.nullable().safeParse(interaction.options.getNumber("day"))
		if (!check.success) {
			await interaction.reply({
				content: lang === "fi" ? "Virheellinen päivä!" : "Invalid day!",
				flags: MessageFlags.Ephemeral,
			})
			return
		}
		const day = check.data
		const foodDay = getFoodDay(day)
		console.log(foodDay.format("dddd, DD.MM.YYYY"), "day:", day)
		// interaction.user is the object representing the User who ran the command
		// interaction.member is the GuildMember object, which represents the user in the specific guild

		// const filePath = path.join(
		// 				"data",
		// 				year.toString(),
		// 				(month + 1).toString().padStart(2, "0"),
		// 				`${day.toString().padStart(2, "0")}.json`
		// 			)
		const path = DataCache.getStringDate(foodDay)
		const data = await dataCache.getFoodForDay(path)
		console.log(data);
		await interaction.reply(
			`${foodDay.format("dddd, DD.MM.YYYY")}:\`\`\`${JSON.stringify(data, null, 2)}\`\`\``
		)
		// console.log(interaction)
	},
} satisfies SlashCommandOptions
