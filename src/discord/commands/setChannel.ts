import {
	ChannelType,
	InteractionContextType,
	MessageFlags,
	PermissionFlagsBits,
	SlashCommandBuilder,
	SlashCommandChannelOption,
} from "discord.js"
import type { SlashCommandOptions, SlashCommandSubcommands } from "./types"
import getLocale from "../utility/locale"
import ServerStore from "../../data/Server"
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
			!(subcommand === "add" || subcommand === "clear" || subcommand === "view")
		) {
			return interaction.editReply({
				content: getLocale("commandError", lang === "fi"),
			})
		}
		const server = await ServerStore.getServer(serverId)
		if (!server) {
			return interaction.editReply({
				content: getLocale("commandError", lang === "fi"),
			})
		}
		const guild = interaction.guild
		if (!guild) {
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
				})
			}
			return interaction.editReply({
				content: getLocale("channelViewList", lang === "fi").replace(
					"{channels}",
					channelMentions.join("\n")
				),
			})
		}
		if (subcommand === "clear") {
			const channel = interaction.options.getChannel("channel", true)
			if (server.infoChannels.has(channel.id)) {
				server.infoChannels.delete(channel.id)
				await ServerStore.saveServer(server)
				return interaction.editReply({
					content: getLocale("channelRemoved", lang === "fi").replaceAll(
						"{channel}",
						channel.toString()
					),
				})
			}
			return interaction.editReply({
				content: getLocale("channelNotSet", lang === "fi").replaceAll(
					"{channel}",
					channel.toString()
				),
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
				})
			}
			if (server.infoChannels.has(channel.id)) {
				return interaction.editReply({
					content: getLocale("channelAlreadySet", lang === "fi").replaceAll(
						"{channel}",
						channel.toString()
					),
				})
			}
			server.infoChannels.add(channel.id)
			await ServerStore.saveServer(server)
			return interaction.editReply({
				content: getLocale("channelAdded", lang === "fi").replaceAll(
					"{channel}",
					channel.toString()
				),
			})
		}
		subcommand satisfies never
	},
} satisfies SlashCommandSubcommands
