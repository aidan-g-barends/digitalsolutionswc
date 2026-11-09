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

Project screenshots live in public/work (real phone screenshots of each live site).
For the best look, add full-page screenshots:

1. Open the site in Chrome, press `F12`, then `Ctrl+Shift+P` and run **Capture full size screenshot**.
2. Save them as `public/projects/ivy-hold.png` and `public/projects/jjs-bussol.png`.
3. In `src/lib/site.ts`, set `screenshot: "/projects/ivy-hold.png"` (and the same for JJS).

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
