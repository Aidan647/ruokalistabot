import { MessageFlags, SlashCommandBuilder } from "discord.js"
import type { SlashCommand, SlashCommandOptions } from "./types"
import z, { number } from "zod"
import { da } from "zod/locales"
import dayjs from "dayjs"
import DataCache from "../../data/DataCache"

// get dayobject of the next occurrence of the given weekday (1-5, mon-fri)
// if day is null, return today
// if today past 13:00, return next weekday
// if today is weekend, return next monday
const dates = [
	["D", "DD"],
	["M", "MM"],
	["YY", "YYYY"],
] as const
const validDates: string[] = []
for (let i = 0; i < dates[0].length; i++) {
	for (let j = 0; j < dates[1].length; j++) {
		validDates.push(`${dates[0][i]}-${dates[1][j]}`)
		for (let k = 0; k < dates[2].length; k++) {
			validDates.push(`${dates[0][i]}-${dates[1][j]}-${dates[2][k]}`)
		}
	}
}
console.log(validDates);
function getDay(day: string): dayjs.Dayjs | null {
	const now = dayjs(day, validDates).hour(0).minute(0).second(0).millisecond(0)
	return now.isValid() ? now : null
}
const dataCache = DataCache.getInctance()
export default {
	data: new SlashCommandBuilder()
		.setName("getdate")
		.setNameLocalization("fi", "ruoka")
		.setDescription("Day's food menu")
		.setDescriptionLocalization("fi", "Päivän ruokalista")
		.addStringOption(
			(option) =>
				option
					.setName("date")
					.setNameLocalization("fi", "päivä")
					.setDescription("DD.MM.YYYY / DD.MM format")
					.setDescriptionLocalization("fi", "PP.KK.VVVV / PP.KK formaatti")
					.setRequired(true)
			// .setAutocomplete(true)
		),
	async execute(interaction) {
		const lang = interaction.locale
		const day = interaction.options
			.getString("date", true)
			.trim()
			.replace(/[\.\/\,\_\:]+/g, "-")
		const foodDay = getDay(day)
		console.log(foodDay?.format("DD-MM-YYYY"), "day:", day)
		if (!foodDay) {
			await interaction.reply({
				content: lang === "fi" ? "Virheellinen päivä!" : "Invalid day!",
				flags: MessageFlags.Ephemeral,
			})
			return
		}

		const path = DataCache.getStringDate(foodDay)
		const data = await dataCache.getFoodForDay(path)
		
		await interaction.reply(
			`${foodDay.format("dddd, DD.MM.YYYY")}:\`\`\`${JSON.stringify(data, null, 2)}\`\`\``
		)
		// console.log(interaction)
	},
} satisfies SlashCommandOptions
