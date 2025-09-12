import { EmbedBuilder, MessageFlags, SlashCommandBuilder } from "discord.js"
import type { SlashCommandOptions } from "./types"
import z from "zod"
import dayjs from "dayjs"
import DataCache from "../../data/DataCache"
import type { Day } from "../../types"
import getLocale from "../utility/locale"
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
console.log(validDates)
function getDay(day: string): dayjs.Dayjs | null {
	const now = dayjs(day, validDates).hour(0).minute(0).second(0).millisecond(0)
	return now.isValid() ? now : null
}
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

function gatDay(day: string | number | null): dayjs.Dayjs | null {
	if (typeof day === "string") {
		const date = getDay(day)
		if (!date) return null
		return date
	}
	return getFoodDay(day)
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
				.setNameLocalization("fi", "viikonpäivä")
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

		const day =
			check.data ??
			interaction.options
				.getString("date")
				?.trim()
				?.replace(/[\.\/\,\_\:]+/g, "-") ??
			null
		const parced = gatDay(day)
		if (parced === null) {
			await interaction.reply({
				content: getLocale("invalidDate", lang === "fi"),
				flags: MessageFlags.Ephemeral,
			})
			return
		}

		console.log(parced.format("dddd, DD.MM.YYYY"), "day:", day)

		const path = DataCache.getStringDate(parced)
		const data = await dataCache.getFoodForDay(path)
		if (!data)
			await interaction.reply({
				content: getLocale("noFoodForDay", lang === "fi").replace("{day}", parced.format("DD.MM.YYYY")),
				flags: MessageFlags.Ephemeral,
			})
		else
			await interaction.reply({
				embeds: [getEmbed(data, lang === "fi")],
				flags: MessageFlags.Ephemeral,
			})
		if (
			interaction.options.getNumber("day") !== null &&
			interaction.options.getString("date") !== null
		)
			// add followup message saying that both day and date were provided, using date
			await interaction.followUp({
				content: getLocale("warnigBothDayAndDate", lang === "fi"),
				flags: MessageFlags.Ephemeral,
			})

		// console.log(interaction)
	},
} satisfies SlashCommandOptions
