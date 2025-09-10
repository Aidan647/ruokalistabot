## Purpose
Short, actionable instructions for an AI coding agent to be productive in this repo.

## Quick facts
- Runtime: Bun (project created with `bun init`). Entry point: `src/index.ts`.
- Install / run:
  ```bash
  bun install
  bun run index.ts
  ```
- Required env: `BOT_TOKEN` (checked in `src/discord/index.ts`; process exits if missing).

## Big-picture architecture
- Boot (in `src/index.ts`) calls `deployCommands()` (registers Discord slash commands) then `startBot()` (Discord client).
- Discord layer: `src/discord/index.ts` (client, interaction handlers) + `src/discord/commands/*` (commands). Commands are collected into `rawCommands` in `src/discord/commands/index.ts`.
- Data layer: `src/data/DataCache.ts` is a singleton cache that reads JSON files from `data/YYYY/MM/DD.json` using `Bun.file(...)`. Use `DataCache.getStringDate(dayjs)` to form paths.
- Scraping/orchestration: `src/data/Navigator` and `puppeteer` are used to fetch and build JSON under `data/` (see `src/index.ts` for the puppeteer example).

## Project-specific patterns & conventions
- All source code lives under `src/` and uses ES module imports with bundler resolution (see `tsconfig.json`).
- Commands: create a file under `src/discord/commands/` and export the default object that matches the existing pattern (has `data: new SlashCommandBuilder()` and `async execute(interaction)`). Then add an import + `addCommand(...)` call in `src/discord/commands/index.ts` (commands are not auto-discovered).
- Data path format: `DataCache.getStringDate(dayjs)` -> `path.join(year, zeroPad(month), zeroPad(day))` so files live at `data/2025/09/10.json`.
- Caching: `DataCache` keeps in-memory map + `notfoundCache` and a Cron job for expiry (`croner`); reading uses `Bun.file(...).text()` and zod parsing (`Day` schema in `src/types.ts`).
- Localization: `getLocale(key, fi)` is used throughout (see usages in `src/discord/*`); prefer keys present in existing code rather than inventing new ones.

## Integration points & hardcoded values to watch
- Discord: `deployCommands()` uses hard-coded application/guild IDs. If you deploy to another guild/account, update these IDs in `src/discord/commands/index.ts`.
- Environment: `BOT_TOKEN` must be set. The code expects a production-style token in `process.env.BOT_TOKEN`.
- Puppeteer is included for scraping (`puppeteer` dependency). The repo includes a sample `Page` URL in `src/index.ts`.

## How to add a new slash command (concrete steps)
1. Create `src/discord/commands/myCmd.ts` exporting default like existing commands (`getFood.ts`/`getDate.ts`).
2. Add `import myCmd from "./myCmd"` and `addCommand(myCmd)` in `src/discord/commands/index.ts`.
3. Run `bun run index.ts` or call `deployCommands()` to update guild commands (remember `BOT_TOKEN`).

## Files to inspect first (high signal)
- `src/index.ts` – boot sequence and puppeteer example.
- `src/discord/index.ts` – client lifecycle, interaction handlers, reply/error pattern.
- `src/discord/commands/index.ts` – command registration and deploy flow.
- `src/discord/commands/getFood.ts` & `getDate.ts` – canonical command shape and use of `DataCache` + embeds.
- `src/data/DataCache.ts` – singleton caching + disk read logic and `DataCache.getStringDate`.
- `data/` – sample JSON menu data (example: `data/2025/09/10.json`).

## Minimal examples (what to follow)
- Command shape: follow `getFood.ts` — `data: SlashCommandBuilder`, validate inputs with `zod`, reply with embeds (use `getLocale` for text).
- Data read: call `DataCache.getInctance().getFoodForDay(path)` where `path` is produced by `DataCache.getStringDate(dayjs)`.

## Known gaps & safe assumptions
- There are no automated tests or lint tasks in `package.json` — assume development uses console logging and manual runs.
- `tsconfig.json` is strict and set to `noEmit`; prefer running code directly with Bun rather than building artifacts.

If anything here is unclear or you want this file expanded with examples (e.g., a command template or `deployCommands` checklist), tell me which section to expand.
