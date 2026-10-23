# Finora Transaction History & Tracking Panel

Search, filter, inspect, cancel, and export demo transaction records for the Finora Transaction Console.

Search runs against the local demo dataset only. It does not query a bank, SWIFT, a card network, or a blockchain.

## Folder structure

- `src/pages` — tracking dashboard, history, transaction details, receipt preview, settings
- `src/components` — search, filters, table, timeline, drawers, receipt templates
- `src/services` — demo store adapter and shared operations
- `src/data` — initial demo dataset used by the shared store

## Prerequisites

- Node.js 20 or newer
- npm

## Install and run

```bash
npm install
npm run dev
```

The app serves http://localhost:5175.

```bash
npm run build
npm run preview
```

No API keys or environment variables are required.

## Mock data

History reads and updates `../.finora/demo-store.json` while the Vite server is running. Records created in the Loading Panel on port 5174 appear here. Cancelling a record updates that same file and adds a simulated timeline event.

CSV export includes the filtered demo fields only, with masked identifiers. It does not include secrets.

Delete `../.finora/demo-store.json` to restore the seed data.

## Milestone 1 limitations

- Cancel demo record updates the local dataset. It does not reverse a payment.
- Receipt regeneration keeps the original reference and creation timestamp.
- Empty, unmatched, invalid-reference, and failed-export states are handled in the interface.
- The Transfer/Download Panel is not part of this milestone.
- There is no live transaction search and no authentication.
