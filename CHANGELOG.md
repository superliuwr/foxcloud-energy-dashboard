# Changelog

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

### Notes

- `Rebuild cache` is intentionally manual because it can make many FoxCloud API calls.
- The rebuild operation is capped to a recent range to reduce API-limit risk.
- Private `.env`, SQLite database files, household energy history, and inverter serial numbers remain excluded from Git.
