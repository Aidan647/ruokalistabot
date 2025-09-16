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
			throw new Error("Invalid subcommand")
		console.log(command);
		const serverId = interaction.guildId
		if (!serverId) {
			await interaction.editReply({
				content: getLocale("commandError", lang === "fi")
			})
			return
		}
		const server = await ServerStore.getServer(serverId)
		if (command === "clear") {
			server.roleId = null
			await ServerStore.saveServer(server)
			await interaction.editReply({
				content: getLocale("noRoleSet", lang === "fi")
			})
			return
		}
		if (command === "view") {
			if (server.roleId === null) {
				await interaction.editReply({
					content: getLocale("noRoleSet", lang === "fi")
				})
				return
			}
			const role = (await interaction.guild?.roles.fetch(server.roleId)) ?? false
			if (role === false) {
				await interaction.editReply({
					content: getLocale("noRoleSet", lang === "fi")
				})
				return
			}
			return await interaction.editReply({
				content: getLocale("currentRole", lang === "fi")
					.replaceAll("{mention}", role.toString())
					.replaceAll("{roleId}", role.id)
			})
		}
		if (command === "set") {
			const role = interaction.options.getRole("role", true)

			server.roleId = role.id
			await ServerStore.saveServer(server)
			await interaction.editReply({
				content: getLocale("roleSet", lang === "fi")
					.replaceAll("{mention}", role.toString())
					.replaceAll("{roleId}", role.id)
			})
			return
		}
		command satisfies never
	},
} satisfies SlashCommandSubcommands
