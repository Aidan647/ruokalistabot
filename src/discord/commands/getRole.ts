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
import logger from "../../logger"
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
			logger.error("Invalid state in role command: no guild or invalid subcommand:", {
				serverId,
				subcommand,
			})
			await interaction.editReply({
				content: getLocale("commandError", lang === "fi"),
			}).catch((err) => {
				logger.warn("Failed to send reply in role command: invalid state", err)
			})
			return
		}
		const server = await ServerStore.getServer(serverId)
		if (!server.roleId) {
			await interaction.editReply({
				content: getLocale("noRoleSet", lang === "fi"),
			}).catch((err) => {
				logger.warn("Failed to send reply in role command: no role set", err)
			})
			return
		}
		const role = (await interaction.guild?.roles.fetch(server.roleId)) ?? null
		if (role === null) {
			await interaction.editReply({
				content: getLocale("noRoleSet", lang === "fi"),
			}).catch((err) => {
				logger.warn("Failed to send reply in role command: role not found", err)
			})
			return
		}
		const roles = interaction.member?.roles
		if (!(roles instanceof GuildMemberRoleManager)) {
			logger.error("Invalid state in role command: roles is not a GuildMemberRoleManager", {
				roles,
			})
			// this should never happen
			await interaction.editReply({
				content: getLocale("commandError", lang === "fi"),
			}).catch((err) => {
				logger.warn("Failed to send reply in role command: roles not found", err)
			})
			return
		}
		if (interaction.guild?.roles.everyone.id === server.roleId)
			return await interaction.editReply({
				content: getLocale("roleEveryone", lang === "fi"),
			}).catch((err) => {
				logger.warn("Failed to send reply in role command: role is everyone", err)
			})
		if (!interaction.guild?.members.me?.permissions.has(PermissionFlagsBits.ManageRoles)) {
			return await interaction.editReply({
				content: getLocale("roleMissingPermission", lang === "fi"),
			}).catch((err) => {
				logger.warn("Failed to send reply in role command: missing manage roles permission", err)
			})
		}
		const userHasRole = roles.cache.has(server.roleId)
		if (subcommand === "add") {
			if (userHasRole)
				return await interaction.editReply({
					content: getLocale("roleAlreadyHas", lang === "fi").replaceAll(
						"{mention}",
						role.toString()
					),
				}).catch((err) => {
					logger.warn("Failed to send reply in role command: already has role", err)
				})
			return await roles.add(role).then(async () => {
				await interaction.editReply({
					content: getLocale("roleAdded", lang === "fi").replaceAll(
						"{mention}",
						role.toString()
					),
				}).catch((err) => {
					logger.warn("Failed to send reply in role command: added role", err)
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
				}).catch((err) => {
					logger.warn("Failed to send reply in role command: doesn't have role", err)
				})
			return await roles.remove(role).then(async () => {
				await interaction.editReply({
					content: getLocale("roleRemoved", lang === "fi").replaceAll(
						"{mention}",
						role.toString()
					),
				}).catch((err) => {
					logger.warn("Failed to send reply in role command: removed role", err)
				})
			})
		}
		subcommand satisfies never
	},
} satisfies SlashCommandSubcommands
