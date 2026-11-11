import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

// Tells search engines they may crawl everything except the API and the admin dashboard.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/admin"] },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
