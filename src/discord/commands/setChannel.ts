import {
	ChannelType,
	InteractionContextType,
	PermissionFlagsBits,
	SlashCommandBuilder,
	SlashCommandChannelOption,
} from "discord.js"
import type { SlashCommandSubcommands } from "./types"
import getLocale from "../utility/locale"
import ServerStore from "../../data/Server"
import logger from "../../logger"
// channel command, adds a channel to be used for food posts
// only admins can use this command
// if no channel is given, displays the current channels

const channelOption = new SlashCommandChannelOption()
	.setName("channel")
	.setNameLocalization("fi", "kanava")
	.setDescription("Channel to be used for food posts")
	.setDescriptionLocalization("fi", "Kanava, jota käytetään ruokailmoituksille")
	.setRequired(true)
	.addChannelTypes(
		ChannelType.GuildText,
		ChannelType.GuildAnnouncement,
		ChannelType.GuildForum,
		ChannelType.GuildVoice
	)
export default {
	data: new SlashCommandBuilder()
		.setName("channel")
		.setNameLocalization("fi", "kanava")
		.setDescription("Sets a channel to be used for food posts")
		.setDescriptionLocalization("fi", "Asettaa kanavan, jota käytetään ruokailmoituksille")
		.addSubcommand((subcommand) =>
			subcommand
				.setName("add")
				.setNameLocalization("fi", "aseta")
				.setDescription("Add channel to be used for food posts")
				.setDescriptionLocalization("fi", "Lisää kanava, jota käytetään ruokailmoituksille")
				.addChannelOption(channelOption)
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("remove")
				.setNameLocalization("fi", "poista")
				.setDescription("Remove channel so channel is no longer used for food posts")
				.setDescriptionLocalization(
					"fi",
					"Poista kanava, jotta kanavaa ei enää käytetä ruokailmoituksille"
				)
				.addChannelOption(channelOption)
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("view")
				.setNameLocalization("fi", "nayta")
				.setDescription("View the currently configured food post channels")
				.setDescriptionLocalization(
					"fi",
					"Näytä tällä hetkellä määritetty ruokailmoituskanavat"
				)
		)
		.setDefaultMemberPermissions(
			PermissionFlagsBits.Administrator |
				PermissionFlagsBits.ManageGuild |
				PermissionFlagsBits.ManageChannels
		)
		.setContexts(InteractionContextType.Guild),
	async execute(interaction) {
		const lang = interaction.locale
		const subcommand = interaction.options.getSubcommand(true)
		const serverId = interaction.guildId
		if (
			!serverId ||
			!(subcommand === "add" || subcommand === "remove" || subcommand === "view")
		) {
			logger.error("Invalid state in setChannel command: no guild or invalid subcommand:", {
				serverId,
				subcommand,
			})
			return interaction.editReply({
				content: getLocale("commandError", lang === "fi"),
			})
		}
		const server = await ServerStore.getServer(serverId)
		const guild = interaction.guild ?? await interaction.client.guilds.fetch(serverId)
		if (!guild) {
			logger.error("Failed to fetch guild in setChannel command, this should not happen", {
				guildId: serverId,
			})
			return interaction.editReply({
				content: getLocale("commandError", lang === "fi"),
			})
		}
		const channels = await guild.channels.fetch()
		let removed = 0
		for (const channelId of server.infoChannels) {
			if (!channels.has(channelId)) {
				server.infoChannels.delete(channelId)
				removed++
			}
		}
		if (removed > 0) await ServerStore.saveServer(server)

		if (subcommand === "view") {
			if (server.infoChannels.size === 0) {
				return interaction.editReply({
					content: getLocale("noChannelsSet", lang === "fi"),
				}).catch((err) => {
					logger.warn(
						"Failed to send reply in setChannel view command: no channels set",
						err
					)
				})
			}
			const channelMentions = [...server.infoChannels]

				.map((id) => {
					const channel = channels.get(id)
					if (!channel || !channel.isTextBased()) return null
					return channel.toString()
				})
				.filter((mention) => mention !== null)
			if (channelMentions.length === 0) {
				return interaction.editReply({
					content: getLocale("noChannelsSet", lang === "fi"),
				}).catch((err) => {
					logger.warn(
						"Failed to send reply in setChannel view command: no valid channels",
						err
					)
				})
			}
			return interaction.editReply({
				content: getLocale("channelViewList", lang === "fi").replace(
					"{channels}",
					channelMentions.join("\n")
				),
			}).catch((err) => {
				logger.warn("Failed to send reply in setChannel view command: valid channels", err)
			})
		}
		if (subcommand === "remove") {
			const channel = interaction.options.getChannel("channel", true)
			if (server.infoChannels.has(channel.id)) {
				server.infoChannels.delete(channel.id)
				const saved = await ServerStore.saveServer(server)
				if (!saved) {
					return interaction.editReply({
						content: getLocale("commandError", lang === "fi"),
					}).catch((err) => {
						logger.warn(
							"Failed to send reply in setChannel remove command: save failed",
							err
						)
					})
				}
				return interaction.editReply({
					content: getLocale("channelRemoved", lang === "fi").replaceAll(
						"{channel}",
						channel.toString()
					),
				}).catch((err) => {
					logger.warn("Failed to send reply in setChannel remove command: removed", err)
				})
			}
			return interaction.editReply({
				content: getLocale("channelNotSet", lang === "fi").replaceAll(
					"{channel}",
					channel.toString()
				),
			}).catch((err) => {
				logger.warn("Failed to send reply in setChannel remove command: not set", err)
			})
		}
		if (subcommand === "add") {
			const channel = interaction.options.getChannel("channel", true, [
				ChannelType.GuildText,
				ChannelType.GuildAnnouncement,
				ChannelType.GuildForum,
				ChannelType.GuildVoice,
			])
			if (!channel.isTextBased()) {
				return interaction.editReply({
					content: getLocale("channelNotText", lang === "fi").replaceAll(
						"{channel}",
						channel.toString()
					),
				}).catch((err) => {
					logger.warn("Failed to send reply in setChannel add command: not text based", err)
				})
			}
			if (server.infoChannels.has(channel.id)) {
				return interaction.editReply({
					content: getLocale("channelAlreadySet", lang === "fi").replaceAll(
						"{channel}",
						channel.toString()
					),
				}).catch((err) => {
					logger.warn("Failed to send reply in setChannel add command: already set", err)
				})
			}
			if (!channel.permissionsFor(guild.members.me!).has("SendMessages")) {
				return interaction.editReply({
					content: getLocale("noPermissionChannel", lang === "fi").replaceAll(
						"{channel}",
						channel.toString()
					),
				}).catch((err) => {
					logger.warn(
						"Failed to send reply in setChannel add command: no permission",
						err
					)
				})
			}
			server.infoChannels.add(channel.id)
			const saved = await ServerStore.saveServer(server)
			if (!saved) {
				return interaction.editReply({
					content: getLocale("commandError", lang === "fi"),
				}).catch((err) => {
					logger.warn("Failed to send reply in setChannel add command: save failed", err)
				})
			}
			return interaction.editReply({
				content: getLocale("channelAdded", lang === "fi").replaceAll(
					"{channel}",
					channel.toString()
				),
			}).catch((err) => {
				logger.warn("Failed to send reply in setChannel add command: added", err)
			})
		}
		subcommand satisfies never
	},
} satisfies SlashCommandSubcommands
