export const locales = {
	lounas: { fi: "Lounas", en: "Lunch" },
	kasvis: { fi: "Kasvis", en: "Vegetarian" },
	lisä: { fi: "Lisä", en: "Side" },
	jälki: { fi: "Jälki", en: "Dessert" },
	foodNotFound: { fi: "Ruokaa ei löytynyt!", en: "No food found!" },
	invalidDay: { fi: "Virheellinen päivä!", en: "Invalid day!" },
	noFoodToday: { fi: "Tänään ei ole ruokaa!", en: "No food today!" },
	commandError: { fi: "Komennon suorittamisessa tapahtui virhe!", en: "An error occurred while executing the command!" },
	invalidCommand: { fi: "Virheellinen komento!", en: "Invalid command!" },
} as const

export function getLocale<T extends keyof typeof locales, K extends "fi" | "en">(type: T, lang: K): (typeof locales)[T][K]
export function getLocale<T extends keyof typeof locales>(type: T, fi: boolean): (typeof locales)[T]["fi" | "en"]
export function getLocale(type: keyof typeof locales, lang: "fi" | "en" | boolean = "en") {
	if (typeof lang === "boolean") lang = lang ? "fi" : "en"
	return locales[type][lang as "fi" | "en"]
}

export default getLocale