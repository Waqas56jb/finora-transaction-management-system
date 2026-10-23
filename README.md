# Finora Transaction Console — Milestone 1

Three separate React applications share one local demo dataset. Nothing in this milestone contacts a bank, card network, or payment gateway.

| Application | Folder | Dev URL |
| --- | --- | --- |
| Admin Panel | `Admin Panel` | http://localhost:5173 |
| Loading Panel | `Loading Panel` | http://localhost:5174 |
| Transaction History & Tracking | `Transaction History & Tracking Panel` | http://localhost:5175 |

`Transfer/Download Panel` is a placeholder for Milestones 2–3. `server` is reserved for the future Node.js backend.

Each application has its own README with install and run commands. Start all three with `npm install` and `npm run dev` in each folder. Demo records are shared through `.finora/demo-store.json` while the Vite dev servers are running.
