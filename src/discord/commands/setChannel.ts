import {
	InteractionContextType,
	MessageFlags,
	PermissionFlagsBits,
	SlashCommandBuilder,
} from "discord.js"
import type { SlashCommandOptions } from "./types"
import getLocale from "../utility/locale"
import ServerStore from "../../data/Server"
// setChannel command, adds a channel to be used for food posts
// only admins can use this command
// if no channel is given, displays the current channels

const serverStore = ServerStore.getInstance()
export default {
	data: new SlashCommandBuilder()
		.setName("setrole")
		.setNameLocalization("fi", "asetarooli")
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
		.addBooleanOption((option) =>
			option
				.setName("clear")
				.setNameLocalization("fi", "poista")
				.setDescription("Clear the current role")
				.setDescriptionLocalization("fi", "Poista nykyinen rooli")
				.setRequired(false)
		)
		.setDefaultMemberPermissions(
			PermissionFlagsBits.Administrator |
				PermissionFlagsBits.ManageGuild |
				PermissionFlagsBits.ManageChannels
		)
		.setContexts(InteractionContextType.Guild),
	async execute(interaction) {
		const lang = interaction.locale
		const role = interaction.options.getRole("role")
		const clear = interaction.options.getBoolean("clear") ?? false
		const serverId = interaction.guildId
		if (!serverId) {
			await interaction.reply({
				content: getLocale("commandError", lang === "fi"),
				flags: MessageFlags.Ephemeral,
			})
			return
		}
		const server = await serverStore.getServer(serverId)
		if (clear) {
			server.roleId = null
			await serverStore.saveServer(server)
			await interaction.reply({
				content: getLocale("noRoleSet", lang === "fi"),
				flags: MessageFlags.Ephemeral,
			})
			return
		}
		if (role === null) {
			if (server.roleId === null) {
				await interaction.reply({
					content: getLocale("noRoleSet", lang === "fi"),
					flags: MessageFlags.Ephemeral,
				})
				return
			}
			return await interaction.guild!.roles.fetch(server.roleId).then(async (fetchedRole) => {
				if (!fetchedRole)
					return await interaction.reply({
						content: getLocale("noRoleSet", lang === "fi"),
						flags: MessageFlags.Ephemeral,
					})
				else
					return await interaction.reply({
						content: getLocale("currentRole", lang === "fi")
							.replaceAll("{mention}", fetchedRole.toString())
							.replaceAll("{roleId}", fetchedRole.id),
						flags: MessageFlags.Ephemeral,
					})
			})
		}
		server.roleId = role.id
		await serverStore.saveServer(server)
		await interaction.reply({
			content: getLocale("roleSet", lang === "fi")
				.replaceAll("{mention}", role.toString())
				.replaceAll("{roleId}", role.id),
			flags: MessageFlags.Ephemeral,
		})
		return
	},
} satisfies SlashCommandOptions
