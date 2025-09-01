import type { ElementHandle, JSHandle, Page } from "puppeteer"
import { parse, type HTMLElement } from "node-html-parser"
import dayjs from "dayjs"
import z from "zod"
import path from "path"
import fs from "fs/promises"

type allergyens = "G" | "L" | "M" | "VL"
const allergyens = ["G", "L", "M", "VL"] as const

type FoodType = "lounas" | "kasvis" | "lisä" | "jälki"
const FoodTypes = ["lounas", "kasvis", "lisä", "jälki"] as const
type Food = {
	type: FoodType
	name: string
	allergyens: Set<allergyens>
}
const Day = z.object({
	day: z.string(),
	foods: z.array(
		z.object({
			type: z.enum(FoodTypes),
			name: z.string(),
			allergyens: z.set(z.enum(allergyens)),
		})
	),
})
enum FoodEnum {
	Lounas = "lounas",
	lounas = "Lounas",
	Kasvisruoat = "kasvis",
	kasvis = "Kasvisruoat",
	Jälkiruoat = "jälki",
	jälki = "Jälkiruoat",
	Lisäkkeet = "lisä",
	lisä = "Lisäkkeet",
	Gluton = "G",
	G = "Gluton",
	Lakton = "L",
	L = "Lakton",
	Maidoton = "M",
	M = "Maidoton",
	VL = "VL",
}
function isElementHandle<T extends Node>(
	h: JSHandle<any> | ElementHandle<T>
): h is ElementHandle<T> {
	return typeof (h as any).asElement === "function" && (h as any).asElement() !== null
}
function isAllergyen(s: string): s is allergyens {
	return allergyens.includes(s as allergyens)
}
// singleton
export class Navigator {
	private constructor() {}

	private static instance: Navigator

	public static getInstance(): Navigator {
		if (!Navigator.instance) {
			Navigator.instance = new Navigator()
		}
		return Navigator.instance
	}
	getAllergyens(data: string[]): Set<allergyens> {
		const allergyens = new Set<allergyens>()
		for (const d of data) {
			if (isAllergyen(d)) {
				allergyens.add(d)
				continue
			}
			const b = FoodEnum[d as keyof typeof FoodEnum]
			if (isAllergyen(b)) {
				allergyens.add(b)
				continue
			}
			console.log("unknown dietic", d)
		}
		return allergyens
	}
	scanFoods(dom: HTMLElement) {
		const lunchElements = dom
			.querySelectorAll(".v-slot > .v-button > .v-button-wrap > .v-button-caption")
			.filter((el) => {
				for (const type of FoodTypes)
					if (el.textContent.trim().includes(FoodEnum[type])) return true

				return false
			})
		const foods: Food[] = []
		for (const lunchElement of lunchElements) {
			// .multiline-button-caption-text
			const header = lunchElement.querySelector(".multiline-button-caption-text")?.textContent
			const type = FoodTypes.find((type) => {
				if (header?.includes(FoodEnum[type])) return true
				return false
			})
			if (!type) continue
			lunchElement
				.querySelectorAll(".multiline-button-content-text > .menu-item")
				.forEach((item) => {
					const ruoka = item.querySelector(".item-name")?.textContent.trim() || null
					const dietics = this.getAllergyens(
						item.querySelector(".menuitem-diets")?.textContent.split(", ") ?? []
					)
					if (!ruoka) return
					foods.push({
						type: type,
						name: ruoka,
						allergyens: dietics,
					})
				})
		}
		return foods
	}
	async scanFuture(page: Page) {
		const format = "D.M.YYYY"
		let first = true
		while (true) {
			console.log("next day")
			if (first) first = false
			else await this.goRight(page)
			const dom = parse(await page.content())
			const nowDate = dom
				.querySelector(
					".main-container > .caption-container > .sub-caption-container > .label-sub-caption > .v-label-sub-title"
				)
				?.textContent.replace(/^\w+/, "")
				.trim()
			if (!nowDate) {
				throw new Error("no date found")
			}
			const dateNow = dayjs(nowDate, format)
			const year = dateNow.year()
			const month = dateNow.month()
			const day = dateNow.date()
			const weekday = dateNow.day()
			if (weekday >= 5) continue
			const filePath = path.join(
				"data",
				year.toString(),
				(month + 1).toString().padStart(2, "0"),
				`${day}.json`
			)
			const file = Bun.file(filePath)
			await fs.mkdir(path.dirname(filePath), { recursive: true })
			console.log(filePath)
			const foods = this.scanFoods(dom)
			if (foods.length === 0) {
				console.log("no foods found, stopping")
				break
			}
			const dayData: z.infer<typeof Day> = {
				day: dateNow.format("YYYY-MM-DD"),
				foods: foods,
			}
			await file.write(JSON.stringify(dayData))
		}
		await Bun.sleep(500)
	}
	async goRight(page: Page) {
		// location="nextdate"
		await Bun.sleep(100)
		await Promise.all([
			page
				.locator('.button-date-selection[location="nextdate"] > .v-button')
				.click()
				.catch((e) => {
					console.log("error clicking next date", e)
				}),
			page.waitForNetworkIdle(),
		])
		await Bun.sleep(400)
	}
}

export default Navigator
