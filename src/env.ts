import logger from "./logger"

if (!Bun.env.BOT_TOKEN) {
	logger.error("No BOT_TOKEN found in environment variables, exiting")
	process.exit(1)
}
if (!Bun.env.FOOD_API_URL) {
	logger.error("No FOOD_API_URL found in environment variables, exiting")
	process.exit(1)
}
if (!Bun.env.DATA_LOCATION) {
	logger.warn("No DATA_LOCATION found in environment variables, using default ./data/")
	// @ts-ignore
	Bun.env.DATA_LOCATION = "./data/"
}
if (!Bun.env.LOG_LOCATION) {
	logger.warn("No LOG_LOCATION found in environment variables, using default ./logs/")
	// @ts-ignore
	Bun.env.LOG_LOCATION = "./logs/"
}
if (!Bun.env.CACHE_TIMEOUT_HOURS) {
	logger.warn("No CACHE_TIMEOUT_HOURS found in environment variables, using default 48 hours")
	// @ts-ignore
	Bun.env.CACHE_TIMEOUT_HOURS = 48
} else {
	// @ts-ignore
	Bun.env.CACHE_TIMEOUT_HOURS = Number(Bun.env.CACHE_TIMEOUT_HOURS)
	// @ts-ignore
	if (isNaN(Bun.env.CACHE_TIMEOUT_HOURS) || Bun.env.CACHE_TIMEOUT_HOURS <= 0) {
		logger.warn(
			"Invalid CACHE_TIMEOUT_HOURS found in environment variables, using default 48 hours"
		)
		// @ts-ignore
		Bun.env.CACHE_TIMEOUT_HOURS = 48
	}
}
if (!Bun.env.CACHE_CLEAN_CRON) {
	logger.warn(
		"No CACHE_CLEAN_CRON found in environment variables, using default 0 0 2 * * * (every day at 2am)"
	)
	// @ts-ignore
	Bun.env.CACHE_CLEAN_CRON = "0 0 2 * * *"
}
if (!Bun.env.FOOD_SEND_CRON) {
	logger.warn(
		"No FOOD_SEND_CRON found in environment variables, using default 0 0 9 * * 1-5 (every weekday at 9am)"
	)
	// @ts-ignore
	Bun.env.FOOD_SEND_CRON = "0 0 9 * * 1-5"
}
if (!Bun.env.TIMEZONE) {
	logger.warn("No TIMEZONE found in environment variables, using default Europe/Helsinki")
	// @ts-ignore
	Bun.env.TIMEZONE = "Europe/Helsinki"
}

// # Optional
// CUSTOM_BROWSER_PRODUCT=
// #CUSTOM_BROWSER_PRODUCT="chrome" or "firefox"
// CUSTOM_BROWSER_PATH=
// #CUSTOM_BROWSER_PATH="/usr/bin/chromium"
if (Bun.env.CUSTOM_BROWSER_PRODUCT) {
	if (
		Bun.env.CUSTOM_BROWSER_PRODUCT !== "chrome" &&
		Bun.env.CUSTOM_BROWSER_PRODUCT !== "firefox"
	) {
		logger.warn("Invalid CUSTOM_BROWSER_PRODUCT, must be 'chrome' or 'firefox', ignoring")
		// @ts-ignore
		Bun.env.CUSTOM_BROWSER_PRODUCT = undefined
	}
}
if (Bun.env.CUSTOM_BROWSER_PRODUCT && Bun.env.CUSTOM_BROWSER_PATH) {
	logger.info(`Using custom browser product ${Bun.env.CUSTOM_BROWSER_PRODUCT} at path ${Bun.env.CUSTOM_BROWSER_PATH}`)
} else if (Bun.env.CUSTOM_BROWSER_PRODUCT || Bun.env.CUSTOM_BROWSER_PATH) {
	logger.warn("Only one of CUSTOM_BROWSER_PRODUCT or CUSTOM_BROWSER_PATH is set, ignoring both")
}
declare global {
	namespace NodeJS {
		interface ProcessEnv {
			readonly BOT_TOKEN: string
			readonly CACHE_CLEAN_CRON: string
			readonly CACHE_TIMEOUT_HOURS: number
			readonly DATA_LOCATION: string
			readonly LOG_LOCATION: string
			readonly FOOD_API_URL: string
			readonly FOOD_SEND_CRON: string
			readonly TIMEZONE: string
			readonly CUSTOM_BROWSER_PRODUCT?: "chrome" | "firefox"
			readonly CUSTOM_BROWSER_PATH?: string
		}
	}
}
