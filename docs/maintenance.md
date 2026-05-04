# FoxCloud Dashboard Maintenance

This is a maintenance stream for the existing project: **Build FoxCloud Dashboard**.

The goal is to update, improve, debug, and maintain the current FoxCloud Dashboard without rebuilding it from scratch.

## Scope

- Preserve existing FoxCloud, Modbus, SQLite, Docker, multilingual UI, export, and dashboard features.
- Prioritise bug fixes, stability, API reliability, clear error messages, and safe handling of credentials.
- Keep secrets out of source code and browser code.
- Use environment variables for API keys, tokens, passwords, and local inverter settings.
- Update README or setup documentation whenever setup steps change.
- Add or update tests where practical.

## Current Structure

- `src/server.ts`: Express server, routes, Basic Auth, static frontend hosting.
- `src/config/env.ts`: environment variable parsing and validation.
- `src/lib/foxcloudClient.ts`: FoxCloud OpenAPI client and request signing.
- `src/services/dashboardService.ts`: FoxCloud dashboard aggregation, report/history handling, cache rebuild.
- `src/services/modbusDashboardService.ts`: read-only local Modbus provider and daily/live data aggregation.
- `src/services/modbusSampler.ts`: Modbus background sampler.
- `src/services/sqliteStore.ts`: SQLite daily energy and live sample storage.
- `src/services/sqliteBackup.ts`: SQLite backup scheduler.
- `public/index.html`: dashboard markup.
- `public/app.js`: frontend state, i18n, rendering, charts, CSV/PDF export.
- `public/styles.css`: responsive dashboard styling.
- `README.md` and `README_FIRST.md`: user setup documentation.

## Current Verification Baseline

Run these before and after maintenance changes:

```bash
npm run check
npm run build
npm audit --audit-level=moderate
```

Current baseline at stream creation:

- `npm run check`: passing
- `npm run build`: passing
- `npm audit --audit-level=moderate`: 0 vulnerabilities

## Known Fragile Areas

- Frontend uses `innerHTML` in a few render paths. Replace with DOM APIs and `textContent` to reduce XSS risk.
- FoxCloud and Modbus have similar 5-minute energy calculation logic. Extract shared helpers to avoid drift.
- Modbus support currently targets FoxESS H3 Smart style registers and needs clearer model profiles.
- `rebuild-cache` can make many FoxCloud API calls and needs better progress, rate-limit handling, and user feedback.
- `range`, `year`, and `month` request parameters need stricter validation and clearer errors.
- PDF export is intentionally simple and does not include rendered charts.
- There are no real unit tests yet; TypeScript build/check is the only automated verification.

## FoxCloud API Integration Notes

Current FoxCloud endpoints are called server-side only:

- `/op/v0/device/list`
- `/op/v0/device/real/query`
- `/op/v0/device/report/query`
- `/op/v0/device/history/query`
- `/op/v0/device/generation`
- `/op/v0/plant/detail`

The browser must never call FoxCloud directly. The backend signs FoxCloud requests using `FOXCLOUD_API_KEY`.

## Security Notes

- `.env`, `.env.local`, `data/*`, and `backups/` are ignored by Git.
- Keep `DASHBOARD_USERNAME`, `DASHBOARD_PASSWORD`, and `DASHBOARD_USERS` configured before exposing the app outside a private LAN.
- Use HTTPS when exposing the dashboard through Synology reverse proxy or similar.
- Do not paste real API keys, passwords, tokens, serial numbers, or database files into GitHub issues.
- Review `/api/health` output before public deployments; it should not expose secrets.

## Prioritised Roadmap

1. Remove unsafe frontend `innerHTML` rendering.
2. Add strict API parameter validation for `range`, `year`, and `month`.
3. Add unit tests for date ranges, PV production calculations, Modbus register decoding, and CSV/PDF helpers.
4. Add FoxCloud retry/backoff handling for timeouts, 429s, and transient network failures.
5. Extract shared energy calculation helpers used by FoxCloud and Modbus.
6. Make Modbus register maps profile-based for easier inverter support.
7. Improve `rebuild-cache` with progress reporting, clearer limits, and better UI feedback.
8. Improve troubleshooting docs for Modbus connectivity, Synology deployment, SQLite backup/restore, and PV mismatch.

## Suggested Follow-Up Tasks

- `maintenance/security-sanitize-frontend-rendering`
- `maintenance/api-parameter-validation`
- `maintenance/add-energy-calculation-tests`
- `maintenance/foxcloud-retry-backoff`
- `maintenance/extract-energy-calculation-module`
- `maintenance/modbus-register-profiles`
- `maintenance/rebuild-cache-progress`
- `maintenance/troubleshooting-docs`

## Maintenance Incident Notes

- 2026-05-04: A first attempt to add `helmet` security headers broke the Synology LAN
  HTTP deployment. The page loaded as unstyled HTML because browser resource loading was
  affected by the default security header behavior, most likely
  `upgrade-insecure-requests` on `http://192.168.0.19:3080`.
- Do not reintroduce `helmet` or a Content Security Policy as a broad change until it has
  been tested on both local HTTP/LAN access and HTTPS reverse-proxy access.
- Safer first steps are backend parameter validation, API 404 handling, CSV export
  hardening, and frontend rendering cleanup without changing response security headers.

## Completed Maintenance Notes

- Added backend validation for dashboard `year`, `month`, and `range` parameters.
- Returned JSON 404 responses for unknown `/api/*` routes instead of serving the SPA HTML.
- Added CSV formula-injection protection for exports.
