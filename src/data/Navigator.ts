import type { Browser, Page } from "puppeteer"
import { parse, type HTMLElement } from "node-html-parser"
import dayjs from "dayjs"
import z from "zod"
import path from "path"
import fs from "fs/promises"
import puppeteer from "puppeteer"
import { Day, FoodEnum, FoodTypes, isAllergyen, type Food, type allergyens } from "../types"


// singleton
export class Navigator {
	private Browser?: Browser
	private Page?: Page
	private constructor() {}

	private static instance: Navigator

	public static getInstance(): Navigator {
		if (!Navigator.instance) {
			Navigator.instance = new Navigator()
		}
		return Navigator.instance
	}
	public static async openAndScan(url: string) {
		const Nav = Navigator.getInstance()
		await Nav.startBrowser()
		await Nav.gotoPage(url)
		await Nav.scanFuture()
		await Bun.sleep(1000)
		await Nav.disconnect()
	}
	async disconnect() {
		if (!this.Browser) return
		await this.Browser.close()
		delete this.Browser
		delete this.Page
		return
	}
	async startBrowser(headless = true) {
		this.Browser = await puppeteer.launch({ headless })
		this.Browser.on("disconnected", () => {
			this.disconnect()
		})
		return this.Browser
	}
	async gotoPage(url: string) {
		if (!this.Browser) throw new Error("no browser")
		this.Page = await this.Browser!.newPage()
		await this.Page.setViewport({ width: 1080, height: 720 })
		await Promise.all([
			this.Page.goto(url),
			this.Page.waitForNavigation({ waitUntil: "networkidle0" }),
		])
		await Bun.sleep(500)
		return this.Page
	}
	static getAllergyens(data: string[]): Set<allergyens> {
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
	static scanFoods(dom: HTMLElement) {
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
					const dietics = Navigator.getAllergyens(
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
	async scanFuture() {
		const format = "D.M.YYYY"
		let first = true
		while (true) {
			if (!this.Page) throw new Error("no page")
			if (first) first = false
			else await this.goRight()
			const dom = parse(await this.Page.content())
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
			if (weekday === 0 || weekday === 6) continue
			const filePath = path.join(
				"data",
				year.toString(),
				(month + 1).toString().padStart(2, "0"),
				`${day.toString().padStart(2, "0")}.json`
			)
			const file = Bun.file(filePath)
			await fs.mkdir(path.dirname(filePath), { recursive: true })
			const foods = Navigator.scanFoods(dom)
			if (foods.length === 0) {
				console.log(`${nowDate}: no foods found, stopping`)
				break
			}
			const dayData: z.infer<typeof Day> = {
				day: dateNow.format("YYYY-MM-DD"),
				foods: foods,
			}
			await file.write(
				JSON.stringify(dayData, (_key, value) => {
					return value instanceof Set ? [...value] : value
				})
			)
		}
		await Bun.sleep(500)
	}
	async goRight() {
		if (!this.Page) throw new Error("no page")
		// location="nextdate"
		await Bun.sleep(100)
		await this.Page.locator('.button-date-selection[location="nextdate"] > .v-button')
			.click()
			.catch((e) => {
				console.log("error clicking next date", e)
			})
		await this.Page.waitForNetworkIdle()
		await Bun.sleep(400)
	}
}

export default Navigator
