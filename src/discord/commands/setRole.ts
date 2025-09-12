import { InteractionContextType, PermissionFlagsBits, SlashCommandBuilder } from "discord.js"
import type { SlashCommandOptions } from "./types"
import z from "zod"
import getLocale from "../utility/locale"
import ServerStore from "../../data/Server"
// setRole command, sets a role to be pinged when food is posted
// only admins can use this command
// if no role is given, displays the current role

const serverStore = ServerStore.getInstance()
export default {
	data: new SlashCommandBuilder()
		.setName("setRole")
		.setNameLocalization("fi", "asetaRooli")
		.setDescription("Sets a role to be pinged when food is posted")
		.setDescriptionLocalization("fi", "Asettaa roolin, joka pingataan kun ruoka julkaistaan")
		.addRoleOption((option) =>
			option
				.setName("role")
				.setNameLocalization("fi", "rooli")
				.setDescription("Role to be pinged")
				.setDescriptionLocalization("fi", "Rooli, joka pingataan")
				.setRequired(false)
		)
		.setDefaultMemberPermissions(
			PermissionFlagsBits.Administrator |
				PermissionFlagsBits.ManageRoles |
				PermissionFlagsBits.ManageRoles
		)
		.setContexts(InteractionContextType.Guild),
	async execute(interaction) {
		const lang = interaction.locale
		const role = interaction.options.getRole("role")
		const serverId = interaction.guildId
		if (!serverId) {
			await interaction.reply({
				content: getLocale("commandError", lang === "fi"),
				ephemeral: true,
			})
			return
		}
		const server = await serverStore.getServer(serverId)
		if (role === null) {
			if (server.roleId === null) {
				await interaction.reply({
					content: getLocale("noRoleSet", lang === "fi"),
					ephemeral: true,
				})
				return
			}
			await interaction.guild?.roles.fetch(server.roleId).then(async (fetchedRole) => {
				if (!fetchedRole) {
					await interaction.reply({
						content: getLocale("noRoleSet", lang === "fi"),
						ephemeral: true,
					})
					return
				}
				await interaction.reply({
					content: getLocale("currentRole", lang === "fi").replaceAll(
						"{roleId}",
						fetchedRole.id
					),
					ephemeral: true,
				})
			})
			return
		}
	},
} satisfies SlashCommandOptions
