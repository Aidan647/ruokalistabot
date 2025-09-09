export const locales = {
	lounas: { fi: "Lounas", en: "Lunch" },
	kasvis: { fi: "Kasvis", en: "Vegetarian" },
	lisä: { fi: "Lisä", en: "Side" },
	jälki: { fi: "Jälki", en: "Dessert" },
} as const

export function getLocale(type: keyof typeof locales, fi: boolean): string
export function getLocale(type: keyof typeof locales, lang: "fi" | "en"): string
export function getLocale(type: keyof typeof locales, lang: "fi" | "en" | boolean = "en"): string {
	if (typeof lang === "boolean") lang = lang ? "fi" : "en"
	return locales[type][lang]
}

export default getLocale