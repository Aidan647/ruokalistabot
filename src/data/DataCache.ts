import type z from "zod"
import { Day } from "../types"
import path from 'path';
import { Cron } from "croner"


export class DataCache {
	private foodCache: Map<string, z.infer<typeof Day>>
	private readonly cacheTimestamps = new Map<string, number>()
	private readonly cacheTimeout = 1000 * 60 * 60 * 24 // 1 day
	private readonly notfoundCache = new Set<string>()
	private cron

	constructor() {
		this.foodCache = new Map()
		this.cron = new Cron("0 0 * * * *", () => {
			console.log("This will run every fifth second")
		})
	}
	async getFoodForDay(day: string): Promise<z.infer<typeof Day> | null> {
		return this.foodCache.get(day) || null
	}
	async getFromDisk(day: string): Promise<z.infer<typeof Day> | null> {
		const file = Bun.file(path.join("data", `${day}.json`))
		if (!(await file.exists())) return null
		const text = await file.text()
		const parsed = Day.safeParse(JSON.parse(text))
		if (!parsed.success) return null
		this.foodCache.set(day, parsed.data)
		return parsed.data
	}
}