import puppeteer from "puppeteer"
import fs from "fs/promises"
import path from "path"
import { parse } from "node-html-parser"
import {Navigator} from "./data/Navigator"
import dayjs from "dayjs"
import customParseFormat from "dayjs/plugin/customParseFormat"
import "dayjs/locale/fi"
import { heapStats, memoryUsage } from "bun:jsc"
import { startBot } from "./discord"
import { deployCommands } from "./discord/commands"
import { Cron } from "croner"
import logger from "./logger"
import "./env"
dayjs.extend(customParseFormat)

await fs.mkdir(path.join(Bun.env.DATA_LOCATION, "servers"), { recursive: true })
await fs.mkdir(Bun.env.LOG_LOCATION, { recursive: true })

// Navigate the page to a URL.
const Page = "https://fi.jamix.cloud/apps/menu/?anro=96743&k=1&mt=1"
// Set screen size.
const nav = Navigator.openAndScan(Page).catch(async () => {
	// retry once after 120 seconds
	logger.warn("Retrying initial scan after 120 seconds")
	return Bun.sleep(120*1000).then(() => Navigator.openAndScan(Page))
}).catch(err => {
	logger.error("Error during initial scan:", err)
})
await startBot().then(async ([client, cron]) => {
	logger.info("Bot started successfully")
	await deployCommands(client.application.id)
}).catch(error => {
	logger.error("Error starting bot:", error)
	process.exit(1)
})
await nav
const dataCheck = new Cron("0 0 2 * * *", async () => {
	// runs every day at midnight
	logger.info("Running daily data check")
	await Navigator.openAndScan(Page).catch(err => {
		logger.warn("Error during daily data check:", err)
	})
	logger.info("Daily data check complete")
}, {timezone: Bun.env.TIMEZONE || "Europe/Helsinki"})

