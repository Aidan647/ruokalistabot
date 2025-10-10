import { EmbedBuilder, type Client, type NewsChannel, type StageChannel, type TextChannel, type VoiceChannel } from "discord.js"
import { ServerStore } from "../data/Server"
import type z from "zod"
import type { Day } from "../types"
import getLocale from "./utility/locale"
import dayjs from "dayjs"
import DataCache from '../data/DataCache';
import logger from "../logger"
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
const DataCacheInstance = DataCache.getInstance()
export async function sendFood(client: Client) {
	const daydata = DataCache.getStringDate(dayjs())
	const todayData = await DataCacheInstance.getFoodForDay(daydata)
	if (!todayData) {
		logger.info("No food data for today, not sending")
		return
	}
	const embed = getTodayEmbed(todayData)
	for (const server of ServerStore.getInstance()) {
		const guild = await client.guilds.fetch(server.serverId).catch(() => null)
		if (!guild) continue
		const channels = await guild.channels.fetch().catch(() => {
			logger.warn(`Failed to fetch channels for guild ${guild.id}, skipping`)
			return null
		})
		if (!channels) continue
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
			if (!channel.permissionsFor(guild.members.me!).has("SendMessages")) {
				logger.debug(`No permission to send messages in channel ${channel.id} in server ${guild.id}, skipping`)
				continue
			}
			await channel.sendTyping().catch(() => {
				logger.debug(`Failed to send typing indicator in channel ${channel.id} in server ${guild.id}`)
			})
			sendTo.add(channel)
		}
		if (sendTo.size === 0) continue
		// get role to be pinged
		if (server.roleId) {
			const role = await guild.roles.fetch(server.roleId).catch(() => null)
			if (role && role.editable && role.mentionable) {
				role.toString()
			}
		}
		await Bun.sleep(5000)
		const role = server.roleId ? await guild.roles.fetch(server.roleId).catch(() => null) : null
		for (const channel of sendTo) {
			await channel.send({
				content: role ? role.toString() : undefined,
				embeds: [embed],
			}).catch(err => {
				logger.warn(`Failed to send message to channel ${channel.id} in server ${guild.id}:`, err)
			})
			await Bun.sleep(500)
		}
	}
}

export default sendFood