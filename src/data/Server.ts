import z from "zod"
import path from "path"
import fs from "fs/promises"
// A class for server configuration and data
const ServerData = z.object({
	infoChannels: z.array(z.string()).default([]),
	roleId: z.string().nullable().default(null),
	serverId: z.string(),
})
export type ServerData = z.infer<typeof ServerData>
const serverDataPath = "./data/servers/"
class Server {
	infoChannels: string[] = []
	roleId: string | null = null
	serverId: string
	serverInctance: any | null = null
	constructor(data: ServerData) {
		this.infoChannels = data.infoChannels
		this.roleId = data.roleId
		this.serverId = data.serverId
	}
	toJSON(): ServerData {
		return {
			infoChannels: this.infoChannels,
			roleId: this.roleId,
			serverId: this.serverId,
		}
	}
	static async load(id: string) {
		// load server data from file or database
		const filePath = path.join(serverDataPath, `${id}.json`)
		const file = Bun.file(filePath)
		if (await file.exists()) {
			const text = await file.json()
			const parsed = ServerData.safeParse(text)
			if (parsed.success) {
				return new Server(parsed.data)
			} else {
				console.error(`Failed to parse server data for server ${id}:`, parsed.error)
			}
		}
		// return new server with default values
		return new Server({ serverId: id, infoChannels: [], roleId: null })
	}
	async getServerInstance() {
		if (!this.serverInctance) {
			// lazy load server instance
			
		}
	}
}

export default class ServerStore {
	private servers: Map<string, Server> = new Map()
	private static instance: ServerStore
	private constructor() {
		// private constructor to prevent direct instantiation
	}
	static getInstance() {
		if (!ServerStore.instance) {
			ServerStore.instance = new ServerStore()
		}
		return ServerStore.instance
	}
	async getServer(id: string): Promise<Server> {
		if (this.servers.has(id)) {
			return this.servers.get(id)!
		}
		const server = await Server.load(id)
		this.servers.set(id, server)
		return server
	}
	async saveServer(server: Server | string): Promise<void> {
		const srv = typeof server === "string" ? await this.getServer(server) : server
		const filePath = path.join(serverDataPath, `${srv.serverId}.json`)
		await fs.mkdir(serverDataPath, { recursive: true })
		await fs.writeFile(filePath, JSON.stringify(srv.toJSON(), null, 2))
	}
	async saveAll(): Promise<void> {
		for (const server of this.servers.values()) {
			await this.saveServer(server)
		}
	}
	async deleteServer(id: string): Promise<void> {
		this.servers.delete(id)
		const filePath = path.join(serverDataPath, `${id}.json`)
		const file = Bun.file(filePath)
		if (await file.exists()) {
			await fs.unlink(filePath)
		}
	}
}
