import type z from "zod"
import type { Day } from "../../types"
import { EmbedBuilder } from "discord.js"


function embedBuilder(dayData: z.infer<typeof Day>) {
	const embed = new EmbedBuilder()
		.setColor(0x0099ff) // #0099ff
		.setTitle(dayData.day)
		.setTimestamp()
}