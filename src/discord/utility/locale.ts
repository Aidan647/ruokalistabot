export const locales = {
	lounas: { en: "Lunch", fi: "Lounas" },
	kasvis: { en: "Vegetarian", fi: "Kasvis" },
	lisä: { en: "Side", fi: "Lisä" },
	jälki: { en: "Dessert", fi: "Jälki" },
	foodNotFound: { en: "No food found!", fi: "Ruokaa ei löytynyt!" },
	invalidDay: { en: "Invalid day!", fi: "Virheellinen päivä!" },
	noFoodForDay: { en: "No food for this day: {day}!", fi: "Ei ruokaa tälle päivälle: {day}!" },
	commandError: {
		en: "An error occurred while executing the command!",
		fi: "Komennon suorittamisessa tapahtui virhe!",
	},
	invalidCommand: { en: "Invalid command!", fi: "Virheellinen komento!" },
	invalidDate: { en: "Invalid date!", fi: "Virheellinen päivämäärä!" },
	warnigBothDayAndDate: {
		en: "Note! Both day and date were provided, using day.",
		fi: "Huom! Annoit sekä viikonpäivä että päivämäärä, käytetään viikonpäivä.",
	},
	noRoleSet: {
		en: "No role is set to be pinged when food is posted.",
		fi: "Ei roolia asetettu pingattavaksi, kun ruoka julkaistaan.",
	},
	currentRole: {
		en: "Current role is <@{roleId}> ({roleId})",
		fi: "Nykyinen rooli on <@{roleId}> ({roleId})",
	},
	roleSet: {
		en: "Role to be pinged when food is posted set to <@{roleId}> ({roleId})",
		fi: "Rooli, joka pingataan kun ruoka julkaistaan, asetettu rooliin <@{roleId}> ({roleId})",
	},
} as const

export function getLocale<T extends keyof typeof locales, K extends "fi" | "en">(
	type: T,
	lang: K
): (typeof locales)[T][K]
export function getLocale<T extends keyof typeof locales>(
	type: T,
	fi: boolean
): (typeof locales)[T]["fi" | "en"]
export function getLocale(type: keyof typeof locales, lang: "fi" | "en" | boolean = "en") {
	if (typeof lang === "boolean") lang = lang ? "fi" : "en"
	return locales[type][lang as "fi" | "en"]
}

export default getLocale
