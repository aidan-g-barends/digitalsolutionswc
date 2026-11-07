"use client";

// The current year for the copyright line, worked out in the browser so it never goes stale.
export default function Year() {
  return <span suppressHydrationWarning>{new Date().getFullYear()}</span>;
}
