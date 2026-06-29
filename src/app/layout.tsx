import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SITE } from "@/lib/site";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} | ${SITE.tagline}`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  keywords: [
    "bouncy castle hire Leeds",
    "bouncy castle Leeds",
    "inflatable hire Leeds",
    "kids party Leeds",
    "soft play hire Leeds",
    "Jumping Jacks Leeds",
  ],
  openGraph: {
    type: "website",
    locale: "en_GB",
    siteName: SITE.name,
    title: `${SITE.name} | ${SITE.tagline}`,
    description: SITE.description,
    url: SITE.url,
  },
  alternates: { canonical: SITE.url },
  robots: { index: true, follow: true },
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Jumping Jacks", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#6C4AB6",
};

// iOS "Add to Home Screen" launch (splash) images per common iPhone size.
const APPLE_SPLASH = [
  { px: "1290x2796", w: 430, h: 932, r: 3 },
  { px: "1179x2556", w: 393, h: 852, r: 3 },
  { px: "1284x2778", w: 428, h: 926, r: 3 },
  { px: "1170x2532", w: 390, h: 844, r: 3 },
  { px: "1125x2436", w: 375, h: 812, r: 3 },
  { px: "828x1792", w: 414, h: 896, r: 2 },
  { px: "750x1334", w: 375, h: 667, r: 2 },
];

// schema.org LocalBusiness markup for local SEO.
const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: SITE.name,
  description: SITE.description,
  telephone: SITE.phone,
  email: SITE.email,
  url: SITE.url,
  areaServed: { "@type": "City", name: "Leeds" },
  address: { "@type": "PostalAddress", addressLocality: "Leeds", addressRegion: "West Yorkshire", addressCountry: "GB" },
  priceRange: "££",
  slogan: SITE.tagline,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;700;800&family=Nunito:wght@400;600;700;800&display=swap"
          rel="stylesheet"
        />
        {APPLE_SPLASH.map((s) => (
          <link
            key={s.px}
            rel="apple-touch-startup-image"
            href={`/apple-splash-${s.px}.png`}
            media={`(device-width: ${s.w}px) and (device-height: ${s.h}px) and (-webkit-device-pixel-ratio: ${s.r}) and (orientation: portrait)`}
          />
        ))}
      </head>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
        />
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
