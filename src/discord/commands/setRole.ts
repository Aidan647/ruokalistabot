import {
	InteractionContextType,
	MessageFlags,
	PermissionFlagsBits,
	SlashCommandBuilder,
	type SlashCommandSubcommandsOnlyBuilder,
} from "discord.js"
import type { SlashCommandOptions, SlashCommandSubcommands } from "./types"
import z from "zod"
import getLocale from "../utility/locale"
import ServerStore from "../../data/Server"
import logger from "../../logger"
// setRole command, sets a role to be pinged when food is posted
// only admins can use this command
// if no role is given, displays the current role

export default {
	data: new SlashCommandBuilder()
		.setName("setrole")
		.setNameLocalization("fi", "asetarooli")
		.setDescription("Sets a role to be pinged when food is posted")
		.setDescriptionLocalization("fi", "Asettaa roolin, joka pingataan kun ruoka julkaistaan")
		// description must be set on parent command when using subcommands
		.addSubcommand((subcommand) =>
			subcommand
				.setName("set")
				.setNameLocalization("fi", "aseta")
				.setDescription("Set the role to be pinged")
				.setDescriptionLocalization("fi", "Aseta rooli, joka pingataan kun ruoka julkaistaan")
				.addRoleOption((option) =>
					option
						.setName("role")
						.setNameLocalization("fi", "rooli")
						.setDescription("Role to be pinged")
						.setDescriptionLocalization("fi", "Rooli, joka pingataan")
						.setRequired(true)
				)
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("clear")
				.setNameLocalization("fi", "poista")
				.setDescription("Clear the configured ping role so no role is pinged")
				.setDescriptionLocalization("fi", "Poista määritetty ping-rooli, jolloin mitään roolia ei pingata")
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("view")
				.setNameLocalization("fi", "nayta")
				.setDescription("View the currently configured ping role")
				.setDescriptionLocalization("fi", "Näytä tällä hetkellä määritetty ping-rooli")
		)
		.setDefaultMemberPermissions(
			PermissionFlagsBits.Administrator |
				PermissionFlagsBits.ManageRoles |
				PermissionFlagsBits.ModerateMembers
		)
		.setContexts(InteractionContextType.Guild),
	async execute(interaction) {
		const lang = interaction.locale
		const command = interaction.options.getSubcommand()
		if (command !== "clear" && command !== "set" && command !== "view")
			throw new Error("Invalid subcommand: " + command)
		const serverId = interaction.guildId
		if (!serverId) {
			await interaction.editReply({
				content: getLocale("commandError", lang === "fi")
			}).catch(() => {
				logger.warn("Failed to send reply in setRole command: no guild")
			})
			return
		}
		const server = await ServerStore.getServer(serverId)
		if (command === "clear") {
			server.roleId = null
			const saved = await ServerStore.saveServer(server)
			if (!saved) {
				await interaction.editReply({
					content: getLocale("commandError", lang === "fi")
				}).catch(() => {
					logger.warn("Failed to send reply in setRole command: clear save failed")
				})
				return
			}
			await interaction.editReply({
				content: getLocale("noRoleSet", lang === "fi")
			}).catch(() => {
				logger.warn("Failed to send reply in setRole command: clear")
			})
			return
		}
		if (command === "view") {
			if (server.roleId === null) {
				await interaction.editReply({
					content: getLocale("noRoleSet", lang === "fi")
				}).catch(() => {
					logger.warn("Failed to send reply in setRole command: view no role")
				})
				return
			}
			const role = (await interaction.guild?.roles.fetch(server.roleId)) ?? false
			if (role === false) {
				await interaction.editReply({
					content: getLocale("noRoleSet", lang === "fi")
				}).catch(() => {
					logger.warn("Failed to send reply in setRole command: view invalid role")
				})
				return
			}
			return await interaction.editReply({
				content: getLocale("currentRole", lang === "fi")
					.replaceAll("{mention}", role.toString())
					.replaceAll("{roleId}", role.id)
			}).catch(() => {
				logger.warn("Failed to send reply in setRole command: view valid role")
			})
		}
		if (command === "set") {
			const role = interaction.options.getRole("role", true)

			server.roleId = role.id
			const saved = await ServerStore.saveServer(server)
			if (!saved) {
				await interaction.editReply({
					content: getLocale("commandError", lang === "fi")
				}).catch(() => {
					logger.warn("Failed to send reply in setRole command: save failed")
				})
				return
			}
			await interaction.editReply({
				content: getLocale("roleSet", lang === "fi")
					.replaceAll("{mention}", role.toString())
					.replaceAll("{roleId}", role.id)
			}).catch(() => {
				logger.warn("Failed to send reply in setRole command: set")
			})
			return
		}
		command satisfies never
	},
} satisfies SlashCommandSubcommands
