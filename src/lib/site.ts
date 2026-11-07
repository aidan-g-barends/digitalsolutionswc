/**
 * SITE CONFIG
 * Everything you're likely to change (name, contact details, socials, services,
 * projects, tech) lives here, so you never have to dig through components.
 * Leave a value as an empty string ("") and the site hides it automatically.
 */

export const site: {
  name: string; shortName: string; location: string; description: string;
  email: string; phone: string; whatsapp: string;
  socials: { label: string; href: string }[];
} = {
  name: "Digital Solutions WC",
  // Short label used in the logo mark and small spaces.
  shortName: "DSWC",
  location: "Western Cape, South Africa",
  description:
    "We design and develop high-performance websites, web applications and digital solutions that help South African businesses stand out, connect with customers and grow online.",

  // Public contact details. Phone and WhatsApp stay hidden while empty.
  email: "digital.solutions.wc@gmail.com",
  phone: "", // e.g. "071 234 5678"
  whatsapp: "", // international format without "+", e.g. "27712345678"

  // Social links. Any link left as "" is not shown on the site.
  socials: [
    { label: "Instagram", href: "" },
    { label: "Facebook", href: "" },
    { label: "LinkedIn", href: "" },
    { label: "GitHub", href: "" },
  ],
};

export const navLinks = [
  { label: "Services", href: "#services" },
  { label: "Work", href: "#work" },
  { label: "Process", href: "#process" },
  { label: "Stack", href: "#stack" },
  { label: "Contact", href: "#contact" },
];

export type Glyph = "web" | "shop" | "app" | "mobile" | "uiux" | "redesign";

export const services: {
  title: string;
  short: string;
  description: string;
  tags: string[];
  glyph: Glyph;
}[] = [
  {
    title: "Website Development",
    short: "Websites",
    description:
      "Professional, responsive and high-performance websites designed to establish credibility, attract customers and grow your business.",
    tags: ["Responsive", "SEO-ready", "Fast loading"],
    glyph: "web",
  },
  {
    title: "E-commerce Development",
    short: "Online stores",
    description:
      "Online stores that provide seamless shopping experiences, showcase products beautifully and help your business sell online.",
    tags: ["Product pages", "Secure checkout", "Mobile-first"],
    glyph: "shop",
  },
  {
    title: "Web Application Development",
    short: "Web apps",
    description:
      "Custom web applications designed around your specific business requirements, workflows and operational needs.",
    tags: ["Custom logic", "Dashboards", "Databases"],
    glyph: "app",
  },
  {
    title: "Mobile & Application Development",
    short: "Applications",
    description:
      "Tailored application experiences and software solutions that solve real-world problems for your business and your customers.",
    tags: ["Tailored", "Cross-device", "Practical"],
    glyph: "mobile",
  },
  {
    title: "UI/UX Design",
    short: "UI/UX",
    description:
      "Modern, intuitive and user-focused interfaces that make digital products easier and more enjoyable to use.",
    tags: ["User flows", "Interfaces", "Prototypes"],
    glyph: "uiux",
  },
  {
    title: "Website Redesign & Optimisation",
    short: "Redesigns",
    description:
      "Transform an outdated website into a modern, responsive and professionally designed digital experience.",
    tags: ["Modernise", "Speed up", "Convert better"],
    glyph: "redesign",
  },
];

export type Project = {
  title: string;
  client: string;
  category: string;
  url: string;
  domain: string;
  description: string;
  highlights: string[];
  // Your own screenshot in /public/projects (best quality). While this is "",
  // the site shows a live screenshot of the real website instead.
  screenshot: string;
  // Accent colour used for this project's glow and details.
  accent: string;
};

export const projects: Project[] = [
  {
    title: "Ivy & Hold",
    client: "Ivy & Hold",
    category: "E-commerce Development",
    url: "https://www.ivyhold.co.za/",
    domain: "ivyhold.co.za",
    description:
      "A custom online store for Ivy & Hold, a South African brand selling stylish handbags and accessories. Built as a fast, mobile-first shopping experience, connected to Shopify for products, stock and secure checkout.",
    highlights: ["Custom storefront", "Shopify integration", "Mobile-first"],
    screenshot: "",
    accent: "#d6a77a",
  },
  {
    title: "JJS Bussol",
    client: "JJS Business Solutions",
    category: "Business Website",
    url: "https://jjsbussol.co.za/",
    domain: "jjsbussol.co.za",
    description:
      "A business website for JJS Business Solutions, built to give the company a professional online presence and clearly communicate its services to potential customers.",
    highlights: ["Corporate presence", "Clear service pages", "Custom domain"],
    screenshot: "",
    accent: "#5fd0c0",
  },
];

export const reasons = [
  {
    title: "Custom-built experiences",
    body: "Every project is designed around your business and your objectives. No recycled templates.",
  },
  {
    title: "Modern technologies",
    body: "Solutions built with modern development tools, so your site is fast, secure and easy to grow.",
  },
  {
    title: "Responsive by design",
    body: "Websites that work beautifully on mobile, tablet and desktop, because that's where your customers are.",
  },
  {
    title: "Performance-focused",
    body: "Clean, efficient and optimised code. Fast pages keep visitors around and help you rank.",
  },
  {
    title: "Direct communication",
    body: "You work directly with the person building your project, from the first call to launch day.",
  },
  {
    title: "Business-focused thinking",
    body: "We don't just build websites. We build digital tools that support how your business grows.",
  },
];

export const steps = [
  {
    title: "Discover",
    body: "We learn about your business, your objectives, your customers and what you want to achieve.",
  },
  {
    title: "Design",
    body: "We create the visual direction and user experience for your digital product.",
  },
  {
    title: "Develop",
    body: "We bring the design to life through professional development, testing and optimisation.",
  },
  {
    title: "Launch",
    body: "We deploy your website or application and make sure everything is ready to go live.",
  },
];

// Only tools used on real projects. Add more here as you use them.
export const stack = [
  { group: "Frontend", items: ["React", "Next.js", "TypeScript", "JavaScript", "HTML5", "CSS3", "Tailwind CSS"] },
  { group: "Backend", items: ["Java", "Spring Boot"] },
  { group: "Data", items: ["Supabase", "MySQL"] },
  { group: "Commerce", items: ["Shopify"] },
  { group: "Workflow", items: ["Git & GitHub", "Vercel"] },
];

export const serviceOptions = [
  "Website Development",
  "E-commerce Development",
  "Web Application Development",
  "Mobile Application Development",
  "UI/UX Design",
  "Website Redesign",
  "Other",
];

export const budgetOptions = [
  "Not sure yet",
  "Under R5,000",
  "R5,000 to R15,000",
  "R15,000 to R30,000",
  "R30,000+",
];

// The public URL of the site, used for SEO tags. Set NEXT_PUBLIC_SITE_URL on
// Vercel once you have a domain; until then the Vercel URL is used.
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");
