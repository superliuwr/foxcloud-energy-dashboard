# Changelog

## 2026-04-29

### Added

- Added an experimental read-only local Modbus TCP provider with `DATA_PROVIDER=modbus`.
- Added Modbus environment variables for inverter LAN host, port, unit ID, timeout, local device label, and read-only mode.
- Added SQLite live sample storage for Modbus-powered last-hour and last-24-hour dashboard charts.
- Added a Modbus background sampler that stores live samples every minute while the server is running.
- Added automatic SQLite backups with Docker/NAS-friendly `./backups` storage.
- Added README setup notes for users who want to run without FoxCloud API keys.

### Fixed

- Added safe signed 32-bit Modbus register decoding so battery charge/discharge power does not show impossible values.
- Aligned the dashboard battery temperature card with FoxCloud's minimum battery temperature by reading the Modbus low cell temperature register.
- Added separate minimum battery, maximum battery, and battery pack temperature values for Modbus dashboards.

### Notes

- The first Modbus register map targets FoxESS H3 Smart style holding registers and must be verified by users with other inverter models.
- Modbus setting writes are intentionally not enabled.

## 2026-04-28

### Added

- Added a dashboard `Rebuild cache` action that recalculates the selected date range from FoxCloud 5-minute history data.
- Added a `This week` table/range option.
- Added direct browser PDF export without opening the print dialog.
- Added multilingual UI text for the new controls in English, Chinese, and Thai.

### Changed

- Today's `PV produced` now follows the FoxCloud Analysis day-view logic: self-consumption plus export from the 5-minute power curve.
- Historical rows can now be recalculated so `PV produced`, self-consumption, return to grid, home usage, grid consumption, and battery charge/discharge use the same 5-minute history approach where data is available.
- Regular dashboard refreshes now preserve rebuilt historical rows and only refresh today's live row, avoiding accidental overwrite by monthly report data.

### Fixed

- Fixed overnight `PV produced` over-counting by only calculating solar production during intervals where FoxCloud history shows real PV/export activity.
- Fixed current-month refreshes overwriting rebuilt historical rows with older monthly report values.

### Notes

- `Rebuild cache` is intentionally manual because it can make many FoxCloud API calls.
- The rebuild operation is capped to a recent range to reduce API-limit risk.
- Private `.env`, SQLite database files, household energy history, and inverter serial numbers remain excluded from Git.
