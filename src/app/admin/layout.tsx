import type { Metadata } from "next";

// The dashboard is private: keep it out of Google entirely.
export const metadata: Metadata = {
  title: "Admin | Digital Solutions WC",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
