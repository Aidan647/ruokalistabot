import { EmbedBuilder, type Client, type NewsChannel, type StageChannel, type TextChannel, type VoiceChannel } from "discord.js"
import { ServerStore } from "../data/Server"
import type z from "zod"
import type { Day } from "../types"
import getLocale from "./utility/locale"
import dayjs from "dayjs"
import DataCache from '../data/DataCache';
function getTodayEmbed(dayData: z.infer<typeof Day>): EmbedBuilder {
		const embed = new EmbedBuilder()
			.setColor(0x0099ff) // #0099ff
			.setTitle(dayData.day.locale("fi").format("Tänään, dddd, DD.MM.YYYY"))
			.setTimestamp(dayData.lastUpdated.toDate())
		for (const type of ["lounas", "kasvis", "lisä", "jälki"] as const) {
			const foods = dayData.foods.filter((f) => f.type === type)
			if (foods.length === 0) continue
			embed.addFields({
				name: getLocale(type, "fi"),
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
const DataCacheInstance = DataCache.getInctance()
export async function sendFood(client: Client) {
	const daydata = DataCache.getStringDate(dayjs())
	const todayData = await DataCacheInstance.getFoodForDay(daydata)
	if (!todayData) {
		console.log("No food data for today, not sending")
		return
	}
	const embed = getTodayEmbed(todayData)
	for (const server of ServerStore.getInstance()) {
		const guild = await client.guilds.fetch(server.serverId).catch(() => null)
		if (!guild) continue
		const channels = await guild.channels.fetch()
		const sendTo = new Set<NewsChannel | StageChannel | TextChannel | VoiceChannel>()
		for (const channelId of server.infoChannels) {
			if (!channels.has(channelId)) {
				server.infoChannels.delete(channelId)
				continue
			}
			const channel = channels.get(channelId)
			if (!channel || !channel.isTextBased()) {
				server.infoChannels.delete(channelId)
				continue
			}
			if (!channel.permissionsFor(guild.members.me!).has("SendMessages")) continue
			await channel.sendTyping()
			sendTo.add(channel)
		}
		await Bun.sleep(5000)
		for (const channel of sendTo) {
			await channel.send({
				embeds: [embed],
			})
			await Bun.sleep(500)
		}
	}
}

export default sendFood