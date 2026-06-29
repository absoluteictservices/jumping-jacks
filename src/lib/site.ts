// Central business info used across the site, SEO, and schema.org markup.
export const SITE = {
  name: "Jumping Jacks Leeds",
  shortName: "Jumping Jacks",
  tagline: "Fun Bouncy Castle Hire in Leeds",
  description:
    "Friendly, affordable and reliable bouncy castle hire across Leeds and surrounding areas. Clean, safe, well-presented inflatables delivered and set up for you. Book online in minutes.",
  phone: "07769781666",
  phoneDisplay: "07769 781666",
  email: "info@jumpingjacksleeds.co.uk",
  areaServed: "Leeds and surrounding areas",
  yearsExperience: 13,
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://jumpingjacksleeds.co.uk",
};

// Preferred delivery-time options shown at checkout. Hire is full-day; this is
// just the customer's preference for when we deliver and set up.
export const DELIVERY_TIME_OPTIONS = [
  "No preference / flexible",
  "Early morning (8–10am)",
  "Late morning (10am–12pm)",
  "Early afternoon (12–2pm)",
  "Mid afternoon (2–4pm)",
];

export const NAV_LINKS = [
  { href: "/castles", label: "Bouncy Castles" },
  { href: "/gallery", label: "Gallery" },
  { href: "/faqs", label: "FAQs" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];
