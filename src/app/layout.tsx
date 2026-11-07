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
  themeColor: "#f1eee7",
};

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
    <html lang="en-ZA">
      <body className="min-h-full overflow-x-clip">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
