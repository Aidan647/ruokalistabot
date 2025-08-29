import puppeteer from "puppeteer"
import fs from "fs/promises"
import path from "path"
import { parse } from "node-html-parser"
import FoodStore from "./data"
// Or import puppeteer from 'puppeteer-core';


// Launch the browser and open a new blank page
const browser = await puppeteer.launch({ headless: false })
const page = await browser.newPage()
page.setCacheEnabled(true)




await page.setViewport({ width: 1080, height: 720 })
// Navigate the page to a URL.
page.goto("https://fi.jamix.cloud/apps/menu/?anro=96743&k=1&mt=1")
console.log("page open");
// Set screen size.
const Store = FoodStore.getInstance()
await page.waitForNavigation({ waitUntil: "networkidle0" })
console.log("page loaded");
await Bun.sleep(500)
const content = parse(await page.content())
// Type into search box using accessible input name.
// await page.locator("aria/Search").fill("automate beyond recorder")
await Store.scanFoods(content)
// await Store.scanFoods(page, "kasvis")
// await Store.scanFoods(page, "lisä")
// await Store.scanFoods(page, "jälki")
console.log(Store.foods);
// const print = page.locator("text/Tulosta").setWaitForStableBoundingBox(true)

// await Bun.sleep(200)
// await print.click()

console.log("done")
await Bun.sleep(1000)


await browser.close()
process.exit(0)
