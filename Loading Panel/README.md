# Finora Loading Panel

Transaction preparation screens for the Finora Transaction Console. Use this app to complete the multi-step demo form, create a simulated load or unload record, and preview receipts and colored slips.

Creating a record does not load a card, change a balance, or settle a payment.

## Folder structure

- `src/pages` — loading dashboard, new request, transaction details, receipt preview, settings
- `src/components` — wizard steps, receipt and slip templates, shared chrome
- `src/services` — demo store adapter and shared operations
- `src/utils/transactionForm.js` — form payload and validation mapping
- `src/data` — initial demo dataset used by the shared store

## Prerequisites

- Node.js 20 or newer
- npm

## Install and run

```bash
npm install
npm run dev
```

The app serves http://localhost:5174.

```bash
npm run build
npm run preview
```

No API keys or environment variables are required.

## Mock data

Records created here are written to `../.finora/demo-store.json` when this Vite server is running. The Admin Panel (http://localhost:5173) and the History Panel (http://localhost:5175) read the same file.

Only masked demo identifiers are stored. Full sample account numbers are discarded after the last four digits are kept. Card fields accept four digits only.

Delete `../.finora/demo-store.json` to restore the seed data. This file is not a secure database.

## Milestone 1 limitations

- “Create Demo Transaction” stores a local record. It does not load or unload funds.
- A generated demo reference is not a banking approval code, and this screen cannot reset a real authorization.
- Receipt QR codes contain only `finora-demo:lookup:` plus the demo reference.
- Refreshing a receipt changes the preview timestamp, not the original creation time.
- Identifiers that require a backend are saved as Pending (Demo). No message is sent.
- The Transfer/Download Panel is planned for later milestones.
