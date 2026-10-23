# server

This folder is reserved for the future Node.js backend of Finora Transaction Console.

Milestone 1 does not implement Express, API routes, databases, authentication, or payment integrations. The three React panels talk to a local demo store that can later be replaced by authorized APIs.

## Planned responsibilities

- Authenticated API matching the functions in each panel’s `src/services/api.js`
- Secure storage of provider credentials outside the browser
- Institution-specific protocol support, including any real use of ISO 8583 or ISO 20022
- Authorization, settlement, and audit logging under the operator’s own provider agreements

Do not treat the frontend demo references, receipts, or connection logs as evidence of a live financial network.
