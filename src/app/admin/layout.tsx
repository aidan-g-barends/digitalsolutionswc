import type { Metadata } from "next";

// The dashboard is private: keep it out of Google entirely.
export const metadata: Metadata = {
  title: "Admin | Kite & Code",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
