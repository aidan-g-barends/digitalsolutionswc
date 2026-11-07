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
services, projects, reasons, process steps and the tech stack. Empty values (`""`) are hidden.

### Project screenshots

Project screenshots live in public/work (real phone screenshots of each live site).
For the best look, add full-page screenshots:

1. Open the site in Chrome, press `F12`, then `Ctrl+Shift+P` and run **Capture full size screenshot**.
2. Save them as `public/projects/ivy-hold.png` and `public/projects/jjs-bussol.png`.
3. In `src/lib/site.ts`, set `screenshot: "/projects/ivy-hold.png"` (and the same for JJS).

Hovering a project slowly scrolls the screenshot, so tall full-page shots look best.

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
