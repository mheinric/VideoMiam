# VideoMiam

## Stack

- **Node.js** (ESM: `"type": "module"` in package.json), **Express 5**, **SQLite** (better-sqlite3)
- Plain HTML/CSS/JS frontend served statically — no view engine, no build step, no framework
- **Vitest** + **Supertest** for integration tests

## Commands

| Command | Action |
|---|---|
| `npm test` | Run vitest (single test file: `app.test.js`) |
| `node main.js` | Start production server |
| `node main.js udpateYt` | Run YouTube data sync once |
| `node main.js updateMAL` | Run MyAnimeList data sync once |
| `node main.js --test-sms` | Test SMS notification |

No lint, typecheck, or dev-server scripts exist.

## Config

- `config-template.yaml` → copy to `config.yaml`, then edit. **`config.yaml` is gitignored** and contains real API keys. Never commit it or expose its values.
- Port and base URL prefix are both set in `config.yaml`.

## Architecture

- `app.js` — Express setup (session, middleware, routes, static files). Exports `app` and `baseUrl`.
- `main.js` — Entry point. Starts server or runs CLI tasks.
- `routes/` — Route handlers (animes, subscriptions, videos, users).
- `services/` — Business logic: `db.js` (SQLite), `yt.js` (YouTube API), `mal.js` (MyAnimeList API), `notifications.js` (SMS).
- `jobs.js` — Cron jobs that call YouTube/MAL APIs daily.
- `middlewares.js` — Auth, validation, error handling.

All routes mount under `baseUrl` (e.g., `/videomiam`). API endpoints are POST-only except logout (GET `{baseUrl}/users/logout.html`).

## Testing

- `app.test.js` is a single 573-line integration test using Supertest.
- Tests make real API calls to YouTube/MAL (uses real channel IDs). No mocks.
- Database is cleared between test groups via `clearDB()`.
- Use `request.agent(app)` with session cookies for authenticated test flows.
- Run focused tests with `npx vitest --run app.test.js` (Vitest defaults to watch mode without `--run`).

## Notable

- No CI/CD, no linter, no formatter, no TypeScript.
- Cron jobs auto-start with the server (no `--dev` flag to suppress them — check `jobs.js`).
- Database file pattern: `data*.db` (gitignored). Schema in `databaseSchema.sql`.