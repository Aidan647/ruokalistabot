import puppeteer from "puppeteer"
import fs from "fs/promises"
import path from "path"
import { parse } from "node-html-parser"
import {Navigator} from "./data/Navigator"
import dayjs from "dayjs"
import customParseFormat from "dayjs/plugin/customParseFormat"
import { heapStats, memoryUsage } from "bun:jsc"
import { startBot } from "./discord"
import { deployCommands } from "./discord/commands"

dayjs.extend(customParseFormat)
// Or import puppeteer from 'puppeteer-core';


// Launch the browser and open a new blank page

// Navigate the page to a URL.
const Page = "https://fi.jamix.cloud/apps/menu/?anro=96743&k=1&mt=1"
// Set screen size.
// await Navigator.openAndScan(Page)
await deployCommands()
await startBot().then(client => {
	console.log("Bot started successfully")
}).catch(error => {
	console.error("Error starting bot:", error)
})

console.log("done")
await Bun.sleep(1000)

await Bun.sleep(10000)
// process.exit(0)
