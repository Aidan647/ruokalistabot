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

dayjs.extend(customParseFormat)
// Or import puppeteer from 'puppeteer-core';


// Launch the browser and open a new blank page

// Navigate the page to a URL.
const Page = "https://fi.jamix.cloud/apps/menu/?anro=96743&k=1&mt=1"
// Set screen size.
const nav = Navigator.openAndScan(Page)
await deployCommands()
await startBot().then(([client, cron]) => {
	logger.info("Bot started successfully")
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
})

