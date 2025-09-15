import {
	ChatInputCommandInteraction,
	GuildMemberRoleManager,
	InteractionContextType,
	MessageFlags,
	PermissionFlagsBits,
	SlashCommandBuilder,
} from "discord.js"
import type { SlashCommandOptions } from "./types"
import z from "zod"
import getLocale from "../utility/locale"
import ServerStore, { type Server } from "../../data/Server"
// getRole command, sets a role to a user when role is set on server

async function getAction(
	interaction: ChatInputCommandInteraction,
	server: Server,
	lang: string
): Promise<"add" | "remove" | "exists" | "empty" | null> {
	if (!server.roleId) {
		await interaction.reply({
			content: getLocale("noRoleSet", lang === "fi"),
			flags: MessageFlags.Ephemeral,
		})
		return null
	}
	const roles = interaction.member?.roles
	if (!(roles instanceof GuildMemberRoleManager)) {
		await interaction.reply({
			content: getLocale("commandError", lang === "fi"),
			flags: MessageFlags.Ephemeral,
		})
		return null
	}
	const userHasRole = roles.cache.has(server.roleId)
	const actionOption = interaction.options.getNumber("action") as 1 | 0 | null
	if (actionOption === null)
		if (userHasRole) return "remove"
		else return "add"
	if (actionOption === 1)
		if (userHasRole) return "exists"
		else return "add"
	if (actionOption === 0)
		if (userHasRole) return "remove"
		else return "empty"
	return null
}

const serverStore = ServerStore.getInstance()
export default {
	data: new SlashCommandBuilder()
		.setName("getrole")
		.setNameLocalization("fi", "rooli")
		.setDescription("Get the role that is set to be pinged when food is posted")
		.setDescriptionLocalization("fi", "Hae rooli, joka pingataan kun ruoka julkaistaan")
		.addNumberOption((option) =>
			option
				.setName("action")
				.setNameLocalization("fi", "toiminto")
				.setDescription("Add or remove the role from yourself")
				.setDescriptionLocalization("fi", "Lisää tai poista rooli itseltäsi")
				.addChoices(
					{ name: "Add", value: 1, name_localizations: { fi: "Lisää" } },
					{
						name: "Remove",
						value: 0,
						name_localizations: { fi: "Poista" },
					}
				)
				.setRequired(false)
		)
		.setContexts(InteractionContextType.Guild),
	async execute(interaction) {
		const lang = interaction.locale
		const serverId = interaction.guildId
		if (!serverId) {
			await interaction.reply({
				content: getLocale("commandError", lang === "fi"),
				flags: MessageFlags.Ephemeral,
			})
			return
		}
		const server = await serverStore.getServer(serverId)
		if (!server.roleId) {
			await interaction.reply({
				content: getLocale("noRoleSet", lang === "fi"),
				flags: MessageFlags.Ephemeral,
			})
			return
		}
		const role = (await interaction.guild?.roles.fetch(server.roleId)) ?? false
		if (role === false) {
			await interaction.reply({
				content: getLocale("noRoleSet", lang === "fi"),
				flags: MessageFlags.Ephemeral,
			})
			return
		}
		const action = await getAction(interaction, server, lang)
		if (action === null) return
		const roles = interaction.member?.roles
		if (!(roles instanceof GuildMemberRoleManager)) {
			await interaction.reply({
				content: getLocale("commandError", lang === "fi"),
				flags: MessageFlags.Ephemeral,
			})
			return
		}
		if (interaction.guild?.roles.everyone.id === server.roleId)
			return await interaction.reply({
				content: getLocale("roleEveryone", lang === "fi"),
				flags: MessageFlags.Ephemeral,
			})
		switch (action) {
			case "add":
				return await roles.add(role).then(async () => {
					await interaction.reply({
						content: getLocale("roleAdded", lang === "fi").replaceAll(
							"{mention}",
							role.toString()
						),
						flags: MessageFlags.Ephemeral,
					})
				})
			case "remove":
				return await roles.remove(role).then(async () => {
					await interaction.reply({
						content: getLocale("roleRemoved", lang === "fi").replaceAll(
							"{mention}",
							role.toString()
						),
						flags: MessageFlags.Ephemeral,
					})
				})
			case "exists":
				return await interaction.reply({
					content: getLocale("roleAlreadyHas", lang === "fi").replaceAll(
						"{mention}",
						role.toString()
					),
					flags: MessageFlags.Ephemeral,
				})
			case "empty":
				return await interaction.reply({
					content: getLocale("roleDoesntHave", lang === "fi").replaceAll(
						"{mention}",
						role.toString()
					),
					flags: MessageFlags.Ephemeral,
				})
		}
	},
} satisfies SlashCommandOptions
