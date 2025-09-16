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
		en: "Current role is {mention} ({roleId})",
		fi: "Nykyinen rooli on {mention} ({roleId})",
	},
	roleSet: {
		en: "Role to be pinged when food is posted set to {mention} ({roleId})",
		fi: "Rooli, joka pingataan kun ruoka julkaistaan, asetettu rooliin {mention} ({roleId})",
	},
	roleAdded: {
		en: "Role {mention} added to you.",
		fi: "Rooli {mention} lisätty sinulle.",
	},
	roleRemoved: {
		en: "Role {mention} removed from you.",
		fi: "Rooli {mention} poistettu sinulta.",
	},
	roleAlreadyHas: {
		en: "You already have the role {mention}.",
		fi: "Sinulla on jo rooli {mention}.",
	},
	roleDoesntHave: {
		en: "You don't have the role {mention}.",
		fi: "Sinulla ei ole roolia {mention}.",
	},
	roleEveryone: {
		en: "The role set is the @everyone role, which cannot be added or removed.",
		fi: "Asetettu rooli on @everyone-rooli, jota ei voi lisätä tai poistaa.",
	},
	channelAdded: {
		en: "Channel {channel} is added to be used for food posts.",
		fi: "Kanava {channel} on asetettu käytettäväksi ruokailmoituksille.",
	},
	channelRemoved: {
		en: "The channel {channel} is removed, it will no longer be used for food posts.",
		fi: "Kanava {channel} on poistettu, sitä ei enää käytetä ruokailmoituksille.",
	},
	channelAlreadySet: {
		en: "The channel {channel} is already set to be used for food posts.",
		fi: "Kanava {channel} on jo asetettu käytettäväksi ruokailmoituksille.",
	},
	channelNotText: {
		en: "The channel {channel} is not a text channel.",
		fi: "Kanava {channel} ei ole tekstikanava.",
	},
	channelNotSet: {
		en: "The channel {channel} is not set to be used for food posts.",
		fi: "Kanavaa {channel} ei ole asetettu käytettäväksi ruokailmoituksille.",
	},

	channelViewList: {
		en: "Current channels used for food posts is:\n{channels}",
		fi: "Tällä hetkellä ruokailmoituksille käytettävät kanavat ovat:\n{channels}",
	},
	noChannelsSet: {
		en: "No channels are set to be used for food posts.",
		fi: "Ruokailmoituksille ei ole asetettu kanavia.",
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
