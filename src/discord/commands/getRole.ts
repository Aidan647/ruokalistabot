import {
	ChatInputCommandInteraction,
	GuildMemberRoleManager,
	InteractionContextType,
	MessageFlags,
	PermissionFlagsBits,
	SlashCommandBuilder,
} from "discord.js"
import type { SlashCommandOptions, SlashCommandSubcommands } from "./types"
import z from "zod"
import getLocale from "../utility/locale"
import ServerStore, { type Server } from "../../data/Server"
// getRole command, sets a role to a user when role is set on server

export default {
	data: new SlashCommandBuilder()
		.setName("role")
		.setNameLocalization("fi", "rooli")
		.setDescription("Get the role that is set to be pinged when food is posted")
		.setDescriptionLocalization("fi", "Hae rooli, joka pingataan kun ruoka julkaistaan")
		.addSubcommand((subcommand) =>
			subcommand
				.setName("add")
				.setNameLocalization("fi", "lisää")
				.setDescription("Add the server's food notification role to your account.")
				.setDescriptionLocalization("fi", "Lisää palvelimen ruokarooli profiiliisi.")
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("remove")
				.setNameLocalization("fi", "poista")
				.setDescription("Remove the server's food notification role from your account.")
				.setDescriptionLocalization("fi", "Poista palvelimen ruokarooli profiilistasi.")
		)
		.setContexts(InteractionContextType.Guild),
	async execute(interaction) {
		const lang = interaction.locale
		const serverId = interaction.guildId
		const subcommand = interaction.options.getSubcommand(true)
		if (!serverId || !(subcommand === "add" || subcommand === "remove")) {
			await interaction.editReply({
				content: getLocale("commandError", lang === "fi"),
			})
			return
		}
		const server = await ServerStore.getServer(serverId)
		if (!server.roleId) {
			await interaction.editReply({
				content: getLocale("noRoleSet", lang === "fi"),
			})
			return
		}
		const role = (await interaction.guild?.roles.fetch(server.roleId)) ?? null
		if (role === null) {
			await interaction.editReply({
				content: getLocale("noRoleSet", lang === "fi"),
			})
			return
		}
		const roles = interaction.member?.roles
		if (!(roles instanceof GuildMemberRoleManager)) {
			await interaction.editReply({
				content: getLocale("commandError", lang === "fi"),
			})
			return
		}
		if (interaction.guild?.roles.everyone.id === server.roleId)
			return await interaction.editReply({
				content: getLocale("roleEveryone", lang === "fi"),
			})
		const userHasRole = roles.cache.has(server.roleId)
		if (subcommand === "add") {
			if (userHasRole)
				return await interaction.editReply({
					content: getLocale("roleAlreadyHas", lang === "fi").replaceAll(
						"{mention}",
						role.toString()
					),
				})
			return await roles.add(role).then(async () => {
				await interaction.editReply({
					content: getLocale("roleAdded", lang === "fi").replaceAll(
						"{mention}",
						role.toString()
					),
				})
			})
		}
		if (subcommand === "remove") {
			if (!userHasRole)
				return await interaction.editReply({
					content: getLocale("roleDoesntHave", lang === "fi").replaceAll(
						"{mention}",
						role.toString()
					),
				})
			return await roles.remove(role).then(async () => {
				await interaction.editReply({
					content: getLocale("roleRemoved", lang === "fi").replaceAll(
						"{mention}",
						role.toString()
					),
				})
			})
		}
		await interaction.editReply({
			content: getLocale("commandError", lang === "fi"),
		})
	},
} satisfies SlashCommandSubcommands
