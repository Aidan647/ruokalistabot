import type { ElementHandle, JSHandle, Page } from "puppeteer"
type allergyens = "G" | "L" | "M" | "VL"
const allergyens = ["G", "L", "M", "VL"] as const

type FoodType = "lounas" | "kasvis" | "lisä" | "jälki"
const FoodTypes = ["lounas", "kasvis", "lisä", "jälki"] as const
type Food = {
	type: FoodType
	name: string
	allergyens: Set<allergyens>
}
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
export class FoodStore {
	foods: Food[] = []

	private constructor() {}

	private static instance: FoodStore

	public static getInstance(): FoodStore {
		if (!FoodStore.instance) {
			FoodStore.instance = new FoodStore()
		}
		return FoodStore.instance
	}
	getFoods() {
		return this.foods
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
	async scanFoods(page: Page, type: FoodType) {
		// await Bun.sleep(5000)
		// search Lounas text from page then go one up search all .menu-item and loop
		const tt = (FoodEnum[type])
		console.log(tt)
		const lunchElements = await page.waitForSelector()
		// if (!lunchElements) return console.log("no lunch elements")
		// // console.log(lunchElements)
		// const s = await lunchElements?.screenshot()
		// console.log(await lunchElements.jsonValue())
		// await Bun.write(`./${type}.png`, s)
		// const lounas = await lunchElements?.evaluateHandle((node) => node.parentElement)
		// if (!isElementHandle(lounas)) return console.log("no lounas element")

		// const menuItems = await lounas.$$(".multiline-button-content-text > .menu-item")
		// console.log(menuItems.length)
		// for (const item of menuItems) {
		// 	const [ruoka, dietics] = await Promise.all([
		// 		item
		// 			.$(".item-name")
		// 			.then((n) => n?.evaluate((node) => node.textContent?.trim() || "") ?? null),
		// 		item
		// 			.$(".menuitem-diets")
		// 			.then(
		// 				(n) =>
		// 					n?.evaluate(
		// 						(node) => node.textContent.split(", ").map((s) => s.trim()) || []
		// 					) ?? null
		// 			),
		// 	])
		// 	if (!ruoka) continue
		// 	const food: Food = {
		// 		type,
		// 		name: ruoka,
		// 		allergyens: this.getAllergyens(dietics ?? []),
		// 	}
		// 	this.foods.push(food)
		// }
	}
}

export default FoodStore
