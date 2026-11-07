import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

// Tells search engines they may crawl everything except the API.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
