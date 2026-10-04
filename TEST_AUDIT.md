# Test and Feature Audit

## Automated coverage

Backend: `backend/npm test`

- Registration cannot elevate a public account to admin.
- Login succeeds and invalid credentials fail.
- Customer ticket ownership is enforced.
- Agents are limited to their team tickets.
- Internal messages are hidden from customers.
- Customers cannot change ticket status.
- Assignment requires an active agent in the ticket team.
- Report summary calculations return numeric breakdowns.
- User responses exclude `passwordHash`.

Frontend: `frontend/npm test -- --run`

- Login submits credentials through the auth context.
- Session restoration uses `/auth/me`.
- Protected routes redirect unauthenticated users.
- Role routes redirect customers away from staff pages.
- Customer navigation hides staff links.
- Ticket creation sends the selected category.
- Ticket filters call the API with filter parameters.
- Reply submission is locked against duplicate clicks.

The frontend production build also passes with `npm run build`.

## Remaining gaps found

### Team Queue is still local-only

Team Queue now loads real team-scoped tickets and persists status transitions through the ticket status API.

Possible update: load `/api/tickets` for the current team and call `PATCH /api/tickets/:id/status` for transitions, then refresh the board after success.

### Header search is not connected

The header search input is rendered, but it does not navigate or query tickets, users, or articles.

Possible update: add debounced search suggestions backed by the existing ticket/article/user APIs.

### Ticket contact email is not persisted

The create-ticket form collects `contactEmail`, but the ticket request does not send it and the ticket model does not store it. The system currently relies on the authenticated user's email.

Possible update: either remove the redundant field or add a validated `contactEmail` field to tickets for requests submitted on behalf of another address.

### Reports visual charts need richer data

The report counts and tables are API-backed, but the dashboard visualizations are simple progress/bar representations rather than time-series charts.

Possible update: add a date-bucket aggregation endpoint and render daily/weekly volume with a chart component.

### Attachment integration depends on external services

Attachment upload requires valid Cloudinary credentials and MongoDB network access. The automated suite intentionally does not upload to Cloudinary; the attachment path should be smoke-tested in an environment with Cloudinary configured.
