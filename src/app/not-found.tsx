import Link from "next/link";
import { site } from "@/lib/site";

// Shown for any URL that doesn't exist, so a mistyped link is never a dead end.
export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-svh max-w-7xl flex-col justify-between px-5 py-8 sm:px-8">
      <Link href="/" className="display text-[1.35rem] leading-none">
        {site.name}
      </Link>
      <div>
        <p className="annot text-mute">
          <span className="text-signal">404</span> · Page not found
        </p>
        <h1 className="display mt-6 max-w-[12ch] text-[clamp(3rem,9vw,8rem)]">
          This page doesn&apos;t exist<span className="ml-[0.06em] inline-block h-[0.78em] w-[0.07em] translate-y-[0.06em] animate-caret bg-signal" />
        </h1>
        <p className="mt-8 max-w-md text-lg leading-relaxed text-soft">
          The link may be old or mistyped. Everything we do is on the home page.
        </p>
        <Link
          href="/"
          className="mt-10 inline-flex h-14 items-center rounded-[5px] bg-signal px-6 font-medium text-white transition-colors hover:bg-signal-hi"
        >
          Back to the home page
        </Link>
      </div>
      <p className="annot text-mute">{site.location}</p>
    </main>
  );
}
