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
  { label: "Work", href: "#work" },
  { label: "Services", href: "#services" },
  { label: "About", href: "#about" },
  { label: "Process", href: "#process" },
]

export const services: {
  title: string;
  short: string;
  description: string;
  goodFor: string;
}[] = [
  {
    title: "Website Development",
    short: "Websites",
    description:
      "Professional, responsive and high-performance websites designed to establish credibility, attract customers and grow your business.",
    goodFor: "Service businesses, professionals and new brands",
  },
  {
    title: "E-commerce Development",
    short: "Online stores",
    description:
      "Online stores that provide seamless shopping experiences, showcase products beautifully and help your business sell online.",
    goodFor: "Brands that want to sell products online",
  },
  {
    title: "Web Application Development",
    short: "Web apps",
    description:
      "Custom web applications designed around your specific business requirements, workflows and operational needs.",
    goodFor: "Bookings, dashboards and internal tools",
  },
  {
    title: "Mobile & Application Development",
    short: "Applications",
    description:
      "Tailored application experiences and software solutions that solve real-world problems for your business and your customers.",
    goodFor: "Customer portals and tools people use daily",
  },
  {
    title: "UI/UX Design",
    short: "UI/UX",
    description:
      "Modern, intuitive and user-focused interfaces that make digital products easier and more enjoyable to use.",
    goodFor: "Products that need to be easier to use",
  },
  {
    title: "Website Redesign & Optimisation",
    short: "Redesigns",
    description:
      "Transform an outdated website into a modern, responsive and professionally designed digital experience.",
    goodFor: "Sites that look dated or don't bring in enquiries",
  },
];

export type Project = {
  title: string;
  category: string;
  url: string;
  domain: string;
  about: string;
  built: string;
  scope: string[];
  stack?: string;
  // Optional short label shown next to the category, e.g. "Pre-launch".
  status?: string;
  // Real screenshots of the live site, taken on a phone (in /public/work).
  screens: { src: string; alt: string }[];
  // The client's own brand colours, so each case study looks like their brand.
  colors: { bg: string; ink: string; accent: string };
};

export const projects: Project[] = [
  {
    title: "Ivy & Hold",
    category: "E-commerce",
    url: "https://www.ivyhold.co.za/",
    domain: "ivyhold.co.za",
    about: "Ivy & Hold is a South African brand selling vegan leather handbags.",
    built:
      "We designed and built a custom storefront that feels premium on a phone, connected to Shopify for products and stock, with Yoco payments at checkout.",
    scope: ["Storefront design & build", "Shopify integration", "Yoco checkout", "Customer reviews with photos", "SEO & Meta Pixel setup"],
    stack: "React · Shopify · Supabase · Vercel",
    screens: [
      { src: "/work/ivy-home.webp", alt: "Ivy & Hold home page on a phone" },
      { src: "/work/ivy-product.webp", alt: "Ivy & Hold product page with add to bag button" },
      { src: "/work/ivy-picks.webp", alt: "Ivy & Hold product picks section" },
    ],
    colors: { bg: "#efe7dc", ink: "#2c2a25", accent: "#5b6b4a" },
  },
  {
    title: "JJS Business Solutions",
    category: "Business website",
    url: "https://jjsbussol.co.za/",
    domain: "jjsbussol.co.za",
    about:
      "JJS Business Solutions is an accredited skills development provider delivering training, consulting and projects across South Africa.",
    built:
      "We built a site that presents their three service areas and credentials clearly, and makes it easy for organisations to enquire.",
    scope: ["Website design & build", "Service & credential pages", "Enquiry & WhatsApp contact", "SEO setup", "Launch on the client's domain"],
    screens: [
      { src: "/work/jjs-home.webp", alt: "JJS Business Solutions home page on a phone" },
      { src: "/work/jjs-about.webp", alt: "JJS Business Solutions credentials section" },
      { src: "/work/jjs-trusted.webp", alt: "JJS Business Solutions trusted-by section" },
    ],
    colors: { bg: "#e3eadc", ink: "#1f2a1c", accent: "#46703e" },
  },
  {
    title: "KNOWNMERCH",
    category: "E-commerce",
    status: "Pre-launch",
    // No custom domain yet: this is its Vercel address. Swap both when the domain is live.
    url: "https://knownmerch.vercel.app/",
    domain: "knownmerch.vercel.app",
    about: "KNOWNMERCH is a South African online store for bar, braai and kuier gear.",
    built:
      "We designed and built the whole store from scratch, without Shopify: the product catalogue and stock run on Supabase, payments go through Yoco, and the owner manages orders and reviews from their own admin dashboard.",
    scope: ["Brand & storefront design", "Custom catalogue & stock", "Yoco checkout & webhooks", "Admin dashboard", "Order emails & reviews", "SEO & Meta Pixel setup"],
    stack: "React · TanStack Start · Supabase · Yoco · Vercel",
    screens: [
      { src: "/work/km-home.webp", alt: "KNOWNMERCH home page on a phone: Gear that earns its place" },
      { src: "/work/km-range.webp", alt: "KNOWNMERCH product range: four tools, no filler" },
      { src: "/work/km-product.webp", alt: "KNOWNMERCH DopMate Smart Dispenser product page" },
    ],
    // The store's own wine red, with its cream paper colour for text.
    colors: { bg: "#7a1e2c", ink: "#f4f1ea", accent: "#121010" },
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

// Shown beside the enquiry form so people know what happens after they press send.
// Edit these to match how you actually work.
export const nextSteps = [
  "We read your enquiry and reply to you personally.",
  "A short call to talk through your business and what you need.",
  "A clear proposal with scope, timeline and price. No obligation.",
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
