import type z from "zod"
import { Day } from "../types"
import path from "path"
import { Cron } from "croner"
import type dayjs from "dayjs"



export class DataCache {
	private foodCache: Map<string, z.infer<typeof Day>>
	private readonly cacheTimeOutStamps = new Map<string, number>()
	private readonly cacheTimeout = 1000 * 60 * 60 * 24 // 1 day
	private readonly notfoundCache = new Set<string>()
	private cron: Cron
	private static instance: DataCache

	private constructor() {
		this.foodCache = new Map()
		this.cron = new Cron("0 0 * * * *", () => {
			const removed = this.checkCacheExpiry()
			console.log(`Cache cleanup done, removed ${removed} entries`)
		})
	}
	static getInctance() {
		if (!DataCache.instance) {
			DataCache.instance = new DataCache()
		}
		return DataCache.instance
	}
	checkCacheExpiry(): number {
		const now = Date.now()
		let removed = 0
		this.notfoundCache.clear()
		for (const [day, timestamp] of this.cacheTimeOutStamps) {
			if (timestamp < now) {
				this.foodCache.delete(day)
				this.cacheTimeOutStamps.delete(day)
				removed++
			}
		}
		for (const [day] of this.foodCache) {
			if (!this.cacheTimeOutStamps.has(day)) {
				this.foodCache.delete(day)
				console.log("Removed orphaned cache entry for day", day);
			}
		}
		return removed
	}
	static getStringDate(day: dayjs.Dayjs): string {
		return path.join(
			day.year().toString(),
			(day.month() + 1).toString().padStart(2, "0"),
			`${day.date().toString().padStart(2, "0")}`
		)
	}
	async getFoodForDay(day: string): Promise<z.infer<typeof Day> | null> {
		if (this.foodCache.has(day)) return this.foodCache.get(day) ?? null

		if (this.notfoundCache.has(day)) return null

		return await this.getFromDisk(day)
	}
	async getFromDisk(day: string): Promise<z.infer<typeof Day> | null> {
		const file = Bun.file(path.join("data", day+".json"))
		if (!(await file.exists())) {
			console.error(`File for day ${day} does not exist`);
			this.notfoundCache.add(day)
			return null
		}
		const text = await file.text()
		const parsed = Day.safeParse(JSON.parse(text))
		if (!parsed.success) {
			console.error(`Failed to parse file for day ${day}:`, parsed.error)
			this.notfoundCache.add(day)
			return null
		}
		this.cacheTimeOutStamps.set(day, Date.now() + this.cacheTimeout)
		this.foodCache.set(day, parsed.data)
		return parsed.data
	}
}
export default DataCache
