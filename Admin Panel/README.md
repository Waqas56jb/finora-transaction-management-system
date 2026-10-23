# Finora Admin Panel

Administration and monitoring screens for the Finora Transaction Console. This app manages local demo server profiles, protocol metadata, currency display, and simulated connection logs.

## Folder structure

- `src/pages` — dashboard, server profiles, protocols, currencies, logs, settings, transaction details, receipt preview
- `src/components` — navigation, tables, dialogs, badges, receipts
- `src/services` — demo store adapter (`api.js`) and shared operations (`storeCore.js`)
- `src/data` — initial demo dataset
- `src/layouts`, `src/routes`, `src/hooks`, `src/utils`

## Prerequisites

- Node.js 20 or newer
- npm

## Install and run

```bash
npm install
npm run dev
```

The app serves http://localhost:5173.

```bash
npm run build
npm run preview
```

No API keys or environment variables are required.

## Mock data

Demo records, profiles, protocols, currencies, and connection logs live in a local JSON file at `../.finora/demo-store.json` while `npm run dev` or `npm run preview` is running. The same file is shared with the Loading Panel (port 5174) and the History Panel (port 5175).

If the dev server is not available, the app falls back to `localStorage` in this browser only. That copy is not shared with the other panels.

Delete `../.finora/demo-store.json` to restore the seeded dataset. The file is not a system of record and is not a secure database.

UI preferences (theme, page size, display name) stay in this browser’s `localStorage`. Secrets are not stored.

## Milestone 1 limitations

- Connections are simulated. Test Demo Connection never calls the endpoint URL.
- Protocol identifiers 101.x and 201.x are project labels, not public standards.
- ISO 8583 and ISO 20022 are listed as messaging standards that still need a backend and institution-specific specifications.
- Receipts, QR codes, and slips are demo previews, not financial instruments.
- The Transfer/Download Panel is not implemented.
- There is no authentication and no live payment integration.
