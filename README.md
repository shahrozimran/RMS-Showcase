# RMS Showcase

A standalone sales and demonstration website. This folder is separate from the restaurant management application. It has no connection to its Supabase database, authentication or live orders.

## Run locally

Use Node.js 24 (the tests use native TypeScript support).

```powershell
npm install
npm run dev
```

Open http://127.0.0.1:3002. To run a production build, use `npm run build`, then `npm start`.

## Sales journey

1. The introduction explains the value and shows POS, tables and owner previews.
2. Five simple steps explain how one restaurant order moves through the system.
3. Visitors can adjust an example order, confirm it, read its kitchen ticket, record a sample payment and see the owner summary.
4. Features and FAQs explain the menu, staff roles, floor, billing and reporting.
5. A personal walkthrough request captures the visitor’s interests and emails the RMS team.

All previews are labelled examples. The sample checkout does not process money. No prices, customer endorsements or performance claims are invented.

## Custom direct Gmail delivery

The browser posts to `/api/interest`. Our server validates the enquiry and sends a formatted HTML/plain-text email directly through Gmail SMTP to **aifunk63@gmail.com**. The visitor’s address is set as Reply-To, so responding in Gmail reaches the visitor. No form relay or additional paid service is used.

### One-time setup

1. Enable 2-Step Verification for the sending Google account.
2. Create an App Password named **RMS Showcase** at https://myaccount.google.com/apppasswords. Google may require you to sign in. If this option is unavailable, see https://support.google.com/accounts/answer/185833.
3. Create `.env.local` in this folder using `.env.example`. Set `GMAIL_APP_PASSWORD` to the generated App Password. Do not use your normal Gmail password. Spaces in the generated App Password are normalized on the server.
4. Run `npm run mail:verify` to verify authentication without sending a message. Then run `npm run mail:test` for one labelled delivery test to the configured inbox. The test prints send timing, not credentials or message contents.

Mail credentials stay on the server. `.env.local` is ignored by Git. Never add a `NEXT_PUBLIC_` prefix to them. The website has no access to the Gmail mailbox; the backend uses the credential only to submit outgoing SMTP messages. An App Password grants Google account access, so keep it private and revoke it in Google Account settings if compromised.

Persistent TLS connections are reused while a server instance stays warm. That reduces repeated connection and authentication overhead. We only show success after Gmail accepts the recipient and message. There is no fake immediate success and no untracked background send. Cold starts, authentication, network conditions, Gmail filtering and daily account limits can affect timing; sub-second submission and inbox arrival cannot be guaranteed. The UI gives progress feedback if sending takes longer. Messages are not automatically retried, because an interrupted SMTP exchange may already have delivered the email.

The showcase keeps no enquiry database. Google processes and stores the mail. The privacy page explains this, and visitors must consent to contact. Hosting infrastructure may retain normal request metadata.

## Deploy separately on Vercel

Import **this folder** as a new Vercel project with the Next.js preset. Do not change the original RMS project’s root directory.

Environment variables (server-side only):

| Variable | Value / purpose |
| --- | --- |
| `GMAIL_SMTP_USER` | Sending Google account. Defaults to `aifunk63@gmail.com`. |
| `GMAIL_APP_PASSWORD` | Required. The sending account’s Google App Password. Store as a sensitive environment variable. |
| `LEAD_EMAIL_TO` | Notification inbox. Defaults to `aifunk63@gmail.com`. |
| `SITE_URL` | Exact public origin, e.g. `https://your-showcase.vercel.app`, without a path. Used for share metadata and origin validation. |

Redeploy after changing variables. `SITE_URL`, when set, restricts forms to that origin. Use the canonical URL for testing, or give preview deployments a matching value. Do not add RMS or Supabase credentials. The Node.js email route allows up to 30 seconds, with bounded SMTP connection and socket timeouts. The host must permit outbound TLS to `smtp.gmail.com:465`.

## Validation and abuse controls

```powershell
npm run typecheck
npm test
npm run build
npm audit --omit=dev
# With the local server running; sends no emails:
node scripts/check-http.mjs
```

The email route enforces same-origin requests, a 16 KB body limit, strict field limits, allowed selections, contact consent, a honeypot and a minimum completion time. It limits submissions to five per ten minutes per client on each server instance. The bounded in-memory limiter is best effort and resets on restarts/cold starts; use a shared limiter or Vercel firewall rules if public traffic requires stronger abuse protection. The provider also applies its own filtering and availability limits.

Automated tests cover validation, fixed delivery destinations, provider failures, rate limiting and demo calculations. Integration checks can reject malformed requests and honeypot submissions without sending emails. Real delivery tests should be clearly labelled and sent sparingly to the configured inbox.

The development lint toolchain currently has transitive moderate advisories. Production dependencies are checked separately with `npm audit --omit=dev`; do not apply an automatic breaking ESLint downgrade as a remedy.
