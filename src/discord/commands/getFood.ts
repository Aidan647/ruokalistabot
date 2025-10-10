import { EmbedBuilder, SlashCommandBuilder } from "discord.js"
import type { SlashCommandOptions } from "./types"
import z from "zod"
import dayjs from "dayjs"
import DataCache from "../../data/DataCache"
import type { Day } from "../../types"
import getLocale from "../utility/locale"
import logger from "../../logger"
const weekday = z.int().min(0).max(5)

// get dayobject of the next occurrence of the given weekday (1-5, mon-fri)
// if day is null, return today
// if today past 13:00, return next weekday
// if today is weekend, return next monday
function getFoodDay(day: z.infer<typeof weekday> | null): dayjs.Dayjs {

	const now = dayjs().add(12, "h").hour(0).minute(0).second(0).millisecond(0)
	if (day === 0) return now
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
logger.info("Valid date formats:", validDates)

export function getEmbed(dayData: z.infer<typeof Day>, fi: boolean = false): EmbedBuilder {
	const embed = new EmbedBuilder()
		.setColor(0x0099ff) // #0099ff
		.setTitle(dayData.day.locale(fi ? "fi" : "en").format("dddd, DD.MM.YYYY"))
		.setTimestamp(dayData.lastUpdated.toDate())
	for (const type of ["lounas", "kasvis", "lisä", "jälki"] as const) {
		const foods = dayData.foods.filter((f) => f.type === type)
		if (foods.length === 0) continue
		embed.addFields({
			name: getLocale(type, fi),
			value: foods
				.map(
					(f) =>
						`- ${f.name}` +
						(f.allergyens.size > 0 ? " " + [...f.allergyens.values()].join(", ") : "")
				)
				.join("\n"),
		})
	}

	return embed
}

function getDay(day: string | number | null): dayjs.Dayjs | null {
	if (typeof day === "string") {
		const date = dayjs(day, validDates).hour(0).minute(0).second(0).millisecond(0)
		if (!date.isValid()) return null
		return date
	}
	return getFoodDay(day)
}

const dataCache = DataCache.getInstance()
export default {
	data: new SlashCommandBuilder()
		.setName("getfood")
		.setNameLocalization("fi", "ruoka")
		.setDescription("Day's food menu")
		.setDescriptionLocalization("fi", "Päivän ruokalista")
		.addNumberOption((option) =>
			option
				.setName("day")
				.setNameLocalization("fi", "viikonpäivä")
				.addChoices(
					{ name: "next", value: 0, name_localizations: { fi: "seuraava" } },
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
		)
		.addStringOption(
			(option) =>
				option
					.setName("date")
					.setNameLocalization("fi", "päivämäärä")
					.setDescription("DD.MM.YYYY / DD.MM format")
					.setDescriptionLocalization("fi", "PP.KK.VVVV / PP.KK formaatti")
			// .setRequired(true)
			// .setAutocomplete(true)
		),
	async execute(interaction) {
		const lang = interaction.locale
		const check = weekday.nullable().safeParse(interaction.options.getNumber("day"))

		const date =
			check.data ??
			interaction.options
				.getString("date")
				?.trim()
				?.replace(/[\.\/\,\_\:]+/g, "-") ??
			null
		const parced = getDay(date)
		if (parced === null) {
			await interaction.editReply({
				content: getLocale("invalidDate", lang === "fi")
			}).catch((e) => logger.warn("Failed to send invalid date message:", e))
			return
		}

		const path = DataCache.getStringDate(parced)
		const data = await dataCache.getFoodForDay(path)
		if (!data)
			await interaction.editReply({
				content: getLocale("noFoodForDay", lang === "fi").replace("{day}", parced.format("DD.MM.YYYY"))
			}).catch((e) => logger.warn("Failed to send no food for day message:", e))
		else
			await interaction.editReply({
				embeds: [getEmbed(data, lang === "fi")]
			}).catch((e) => logger.warn("Failed to send food embed:", e))
		if (
			interaction.options.getNumber("day") !== null &&
			interaction.options.getString("date") !== null
		)
			// add followup message saying that both day and date were provided, using date
			await interaction.followUp({
				content: getLocale("warnigBothDayAndDate", lang === "fi")
			}).catch((e) => logger.warn("Failed to send warning about both day and date:", e))

		// console.log(interaction)
	},
} satisfies SlashCommandOptions
