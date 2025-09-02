import puppeteer from "puppeteer"
import fs from "fs/promises"
import path from "path"
import { parse } from "node-html-parser"
import Navigator from "./data"
import dayjs from "dayjs"
import customParseFormat from "dayjs/plugin/customParseFormat"
import { heapStats, memoryUsage } from "bun:jsc"

dayjs.extend(customParseFormat)
// Or import puppeteer from 'puppeteer-core';


// Launch the browser and open a new blank page

// Navigate the page to a URL.
const Page = "https://fi.jamix.cloud/apps/menu/?anro=96743&k=1&mt=1"
// Set screen size.
await Navigator.openAndScan(Page)

console.log("done")
await Bun.sleep(1000)


await Bun.sleep(100)
process.exit(0)
