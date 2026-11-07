import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

// The sitemap you submit to Google Search Console (yoursite/sitemap.xml).
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: siteUrl, changeFrequency: "monthly", priority: 1 }];
}
