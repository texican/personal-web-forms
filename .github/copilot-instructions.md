# Copilot Instructions — personal-web-forms

Short, focused guidance to help AI coding agents be productive in this repo.

1) Big picture
- This is a collection of Google Apps Script web-form projects (subfolders like `behavior-log/` and `chess-tracker/`). Each project is typically a two-file GAS app: `code.gs` (server) + `index.html` (client). Deployments are small, single-file web apps targeted at Google Apps Script.

2) Key files to inspect first
- `*/code.gs` — server logic, validation, logging helpers (`logEvent`), and spreadsheet/Drive integrations.
- `*/index.html` — single-file client with inline CSS/JS; uses `google.script.run` calls.
- `*/appsscript.json` and `deploy.sh` — GAS config and repository deployment helper.

3) Important patterns & constraints (do not change without tests)
- Server-side helpers: `logEvent(event, data)` is used everywhere. Follow its structured logging pattern when adding instrumentation.
- Config & rate limiting: `PropertiesService` stores `SPREADSHEET_ID` and `lastSubmission` (1-second cooldown). Use the same keys when reading/writing properties.
- Spreadsheet fallback: `getOrCreateSpreadsheet()` first looks for `SPREADSHEET_ID`, then searches Drive by name, and finally creates a new spreadsheet. The code may store a placeholder constant `DEFAULT_SPREADSHEET_ID` — do not assume it is valid unless replaced.
- Sheet naming and headers: some modules create a sheet (e.g., `Sheet5`) and append a header row when `sheet.getLastRow() === 0`. Preserve header order and formatting (header background `#4a90e2`, white text) when adding columns.
- Picture uploads: code expects base64 data URIs (`data:image/...;base64,`) and creates Drive files with `DriveApp.createFile(blob)` and `file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW)`. If changing upload behavior, maintain graceful failure path (log error, continue without picture).
- Error handling: pattern is `logEvent('<context>_error', { error: error.toString(), stack: error.stack })` followed by throwing an Error. Mirror this pattern for consistent observability.

4) Developer workflows
- Quick deploy: many projects include `deploy.sh`. Example: `cd chess-tracker && ./deploy.sh` (check file for repo-specific steps).
- Manual GAS workflow: edit `code.gs` / `index.html` and paste into Apps Script editor, or use `clasp` (`clasp push` / `clasp deploy`) — CLAUDE.md contains example commands.
- Debugging: use `Logger.log()` and the Apps Script execution logs / Stackdriver; `logEvent()` produces JSON-friendly logs.

5) Project-specific conventions to follow in changes
- Prefer simple, compatible JavaScript (avoid modern ES modules / advanced JS features). The codebase intentionally targets GAS sandbox behavior.
- Use `var`/vanilla JS and inline HTML structure similar to existing `index.html` files.
- Maintain server-side validation for critical fields (example: chess-tracker enforces different white/black names, winner must be `White|Black|Draw`, and time limit required when `Game Ending` === `Time Out`). Copy validation style rather than redesigning it.

6) Integration & external touchpoints
- Google services used: `SpreadsheetApp`, `DriveApp`, `PropertiesService`, `Session`, `HtmlService`. Any change that touches these should consider permission scopes in `appsscript.json`.
- Files may be made publicly viewable by `setSharing(...)` — ensure this is acceptable for the new behavior.

7) Tests & verification
- There are no automated unit tests. Verify changes by deploying to a test GAS project and exercising the form. Check Apps Script logs and the target Google Sheet for results.

8) Example quick tasks an agent can perform safely
- Add a new validated field: update `index.html` form, add server-side sanitize/validate in `addRow()`, and append the new column to header creation logic in `code.gs`.
- Add structured audit logs: call `logEvent('feature_x_called', { details })` following existing pattern.

9) When to ask the human
- If you need to change data retention, public sharing, or create new Drive-sharing behavior — confirm privacy expectations.
- If a change requires adding new OAuth scopes in `appsscript.json`, ask before committing.

If something here is unclear or you want more/less detail, tell me which area to expand (deploy steps, `appsscript.json` scopes, or sheet header specifics).
