import type { Metadata, Viewport } from "next";
// Self-hosted fonts (no Google request at runtime, so they load fast and never flash).
import "@fontsource-variable/bricolage-grotesque/standard.css";
import "@fontsource-variable/hanken-grotesk";
import "@fontsource-variable/jetbrains-mono";
import "./globals.css";
import { site, siteUrl } from "@/lib/site";
import Providers from "@/components/Providers";

const title = `${site.name} | Websites, Web Apps & Digital Solutions`;

// SEO: title, description and social share previews.
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description: site.description,
  keywords: [
    "web design South Africa",
    "website development Western Cape",
    "e-commerce website South Africa",
    "web application development",
    "Shopify developer South Africa",
    "website redesign",
  ],
  openGraph: {
    type: "website",
    locale: "en_ZA",
    url: "/",
    siteName: site.name,
    title,
    description: site.description,
  },
  twitter: { card: "summary_large_image", title, description: site.description },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#07080a" },
    { media: "(prefers-color-scheme: light)", color: "#f4f3ef" },
  ],
};

// Runs before the page paints: picks the saved theme, or the device's theme on a first visit.
// Without this, light-mode visitors would see a dark flash on every page load.
const themeScript = `(function(){try{var t=localStorage.getItem("theme");if(t!=="light"&&t!=="dark"){t=matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"}document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme="dark"}})()`;

// Structured data so Google understands this is a web design business.
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: site.name,
  description: site.description,
  url: siteUrl,
  email: site.email || undefined,
  telephone: site.phone || undefined,
  areaServed: "ZA",
  address: { "@type": "PostalAddress", addressRegion: "Western Cape", addressCountry: "ZA" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: the theme script changes data-theme before React loads, on purpose.
    <html lang="en-ZA" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full overflow-x-clip">
        <script
          type="application/ld+json"
          // Escape "<" so no value can ever close the script tag early (per the Next.js JSON-LD guide).
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
