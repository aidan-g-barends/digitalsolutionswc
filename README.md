# Digital Solutions WC

Agency website for Digital Solutions WC. Built with Next.js, TypeScript, Tailwind CSS v4 and Framer Motion.

## Run it locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Change content

Almost everything lives in `src/lib/site.ts`: business name, email, phone, WhatsApp, socials,
services, projects, reasons, process steps, the "what happens next" steps beside the form and the
tech stack. Empty values (`""`) are hidden.

### Project screenshots

Project screenshots live in `public/work` (real phone screenshots of each live site) and are listed
in each project's `screens` in `src/lib/site.ts`.

Every screen listed in a project's `screens` also appears in the hero's "Now showing" reel.

## Design system ("Signal & Grid")

- **Colour:** near-black `paper`, off-white `ink`, one electric blue `signal`. Blue only marks what is
  active, selected or important (like a text cursor or selection). Tokens are in `src/app/globals.css`.
- **Type:** Bricolage Grotesque set condensed (`.display`) for headlines, Hanken Grotesk for body,
  JetBrains Mono (`.annot`) for labels and indexes.
- **Shape:** 4-6px corners on controls, 14px on media cards. No pills.
- **Motion:** one easing curve (`--ease-out-expo`). Shared pieces live in `src/components/ui.tsx`
  (`Button`, `SplitHeading`, `Reveal`, `Label`). Scroll-linked effects switch off when the visitor
  has "reduce motion" turned on (`useStill`).

## Enquiry form

The form posts to `src/app/api/contact/route.ts`, which validates it and emails it to you via [Resend](https://resend.com).
Set these on Vercel (Project > Settings > Environment Variables), see `.env.example`:

| Variable | Needed | What it is |
| --- | --- | --- |
| `RESEND_API_KEY` | Yes | Resend API key |
| `CONTACT_TO_EMAIL` | No | Where enquiries go (defaults to the email in `site.ts`) |
| `CONTACT_FROM_EMAIL` | No | Sender. Empty uses `onboarding@resend.dev`, which only delivers to your Resend account's email |
| `NEXT_PUBLIC_SITE_URL` | No | Your live URL once you have a custom domain |

Without `RESEND_API_KEY` the form shows an error with your email address instead of pretending it worked.

## AI assistant, bookings and admin: setup

Everything below runs on free tiers. Add each variable in **Vercel > Project > Settings >
Environment Variables**, then **Redeploy**. Full list: `.env.example`.

### 1. AI assistant (Google Gemini, free)

1. Go to https://aistudio.google.com/apikey, sign in with your Google account, click **Create API key**.
2. Add `GEMINI_API_KEY` on Vercel.

The chat and voice assistant now work. Without the key, the assistant tells visitors it's
offline and points them to your email. The key never reaches the browser: all AI calls go
through `src/app/api/chat/route.ts`. The free tier has a daily limit; if you hit it, set
`GEMINI_MODEL=gemini-2.5-flash-lite` (more free messages per day).

### 2. Database for leads, bookings and the dashboard (Supabase, free)

1. Create a project at https://supabase.com.
2. **SQL Editor > New query**: paste all of `supabase/setup.sql`, click **Run**.
3. **Project Settings > API**: copy the **Project URL** into `SUPABASE_URL` and the
   **service_role / secret** key into `SUPABASE_SERVICE_ROLE_KEY`.

Row Level Security is on with no public access, so visitors can never read leads or bookings.
Online booking switches on automatically once the database is connected.

### 3. Admin dashboard

Add `ADMIN_PASSWORD` (long and unique), redeploy, then open **/admin** on your site. You can:

- see leads from the AI chat, voice and contact form, change their status
  (New, Interested, Qualified, Meeting requested, Meeting confirmed, Converted, Not interested),
  read the AI's conversation summary, add notes, and delete a lead if someone asks;
- see and cancel meetings (cancelling frees the time slot);
- edit **Approved pricing**, business info and FAQs. **While pricing is empty, the AI never quotes
  prices**; it offers a free consultation instead;
- set the days, hours, meeting length and notice period clients can book;
- see 30-day stats and which integrations are set up.

### 4. Emails

- `RESEND_API_KEY` (see "Enquiry form" above) also emails you new leads, qualified leads and
  every booking.
- **Confirmation emails to clients** need your own sending domain: verify a domain in Resend, then
  set `CONTACT_FROM_EMAIL`, e.g. `Digital Solutions WC <hello@yourdomain.co.za>`. Until then the
  AI tells clients the team will email them to confirm (it never claims an email was sent).

### 5. Google Calendar (optional)

Makes bookings respect your real calendar and adds each booking to it.

1. https://console.cloud.google.com: create a project, enable the **Google Calendar API**.
2. **IAM & Admin > Service accounts > Create**. Open it, **Keys > Add key > JSON**, download the file.
3. In Google Calendar: your calendar's **Settings and sharing > Share with specific people**, add the
   service account's email with **Make changes to events**. Copy the **Calendar ID** from the same page.
4. On Vercel: `GOOGLE_SERVICE_ACCOUNT_EMAIL` (client_email from the JSON), `GOOGLE_PRIVATE_KEY`
   (private_key from the JSON, including the BEGIN/END lines) and `GOOGLE_CALENDAR_ID`.

### How the pieces fit

| Feature | Where |
| --- | --- |
| Chat window, voice controls | `src/components/assistant/` |
| AI instructions (sales flow, rules, knowledge) | `src/lib/server/prompt.ts` |
| Gemini call with tools | `src/lib/server/gemini.ts`, tools in `src/lib/server/tools.ts` |
| Leads + notifications | `src/lib/server/leads.ts` |
| Availability + booking | `src/lib/server/booking.ts`, `src/lib/server/google.ts` |
| Admin login | `src/lib/server/auth.ts`, dashboard in `src/app/admin/page.tsx` |
| Dark/light theme | `src/components/ThemeToggle.tsx`, light tokens in `globals.css` |
| 3D tilt and cubes | `src/components/Depth.tsx` |

Voice uses the browser's own speech recognition and speech (free). It works in Chrome, Edge and
Safari; in Firefox the assistant stays text-only.
