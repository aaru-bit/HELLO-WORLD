# BookBack — Hackathon Prototype

A private book-lending and personal library manager.

## Run it

This is a self-contained front-end prototype.

Option 1:
- Open `index.html` directly in a browser.

Option 2 (recommended):
```bash
python -m http.server 8000
```
Then open http://localhost:8000

## Included flows

- Home dashboard and live statistics
- My Books library
- Add book with duplicate-title protection
- Lend book
- 15 / 30 / custom 1–60 day borrowing
- Due-soon / overdue status
- Books Outside table
- Mark Returned with confirmation
- Automatic outside count/value updates
- Friend search and profiles
- Pre-booking queue capped at 5 per book
- Notifications
- Book Buddy rule-based library assistant
- History
- Settings for overdue/reminder rules
- First-run onboarding
- Responsive desktop/mobile navigation

## Important prototype limitation

Data is stored in browser `localStorage`. The "friends-only" access, authentication, real cross-device notifications, and true multi-user backend are represented in the UI but are not a production security/auth system.

For the hackathon's production version, connect the same UI to a backend such as Flask + SQLite/PostgreSQL, Supabase, Firebase, or Node/Express and add real authentication/authorization.

## Demo reset

To reset demo data, open browser DevTools → Application/Storage → Local Storage → delete the `bookback_v1` key, then reload.
