import z from "zod"

export type allergyens = "G" | "L" | "M" | "VL"
export const allergyens = ["G", "L", "M", "VL"] as const

export type FoodType = "lounas" | "kasvis" | "lisä" | "jälki"
export const FoodTypes = ["lounas", "kasvis", "lisä", "jälki"] as const
export type Food = {
	type: FoodType
	name: string
	allergyens: Set<allergyens>
}
export const Day = z.object({
	day: z.string(),
	foods: z.array(
		z.object({
			type: z.enum(FoodTypes),
			name: z.string(),
			allergyens: z.preprocess((val: any[]) => new Set(val), z.set(z.enum(allergyens))),
		})
	),
})
export enum FoodEnum {
	Lounas = "lounas",
	lounas = "Lounas",
	Kasvisruoat = "kasvis",
	kasvis = "Kasvisruoat",
	Jälkiruoka = "jälki",
	jälki = "Jälkiruoka",
	Lisäkkeet = "lisä",
	lisä = "Lisäkkeet",
	Gluton = "G",
	G = "Gluton",
	Lakton = "L",
	L = "Lakton",
	Maidoton = "M",
	M = "Maidoton",
	VL = "VL",
}
export function isAllergyen(s: string): s is allergyens {
	return allergyens.includes(s as allergyens)
}
