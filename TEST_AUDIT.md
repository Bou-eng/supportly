# Test and Feature Audit

## Automated coverage

Backend: `cd backend && npm test`

- Public registration always creates a customer.
- Login, cookie authentication, and customer ticket ownership.
- Team-scoped ticket reads, messages, activity, assignment, and reporting.
- Generic ticket updates cannot bypass status, priority, or assignee validation.
- Teamless intake tickets remain visible until they inherit an assignee's team.
- Internal notes stay hidden and do not notify customers.
- Notification preferences suppress disabled ticket notifications.
- Unpublished knowledge articles are not public and agent-created articles start as drafts.
- Invitations return an explicit not-implemented response.
- Managers promote only agents into their own team.
- Only admins create teams; referenced teams cannot be deleted.
- Attachment-only message records and Cloudinary upload metadata.
- Report breakdowns and password-hash exclusion.

Frontend: `cd frontend && npm test -- --run`

- Login and session restoration.
- Protected and role-based navigation.
- Ticket creation, filtering, and duplicate-reply locking.
- Invite button displays the coming-soon modal without an invitation form.
- Admin team creation calls the correct API.

Production build: `cd frontend && npm run build`

## External smoke tests still required

- A real Cloudinary account is required to verify upload, signed download, expiry, and cleanup behavior end to end.
- Production cookie behavior must be verified using the actual HTTPS frontend and backend origins.
- Responsive visual QA should be repeated in the deployment browser at desktop and mobile widths.
