import type { MetadataRoute } from "next";

// Web app manifest — lets the site be added to the iOS/Android home screen and
// open full-screen like an app, with the Jumping Jacks logo and brand colours.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Jumping Jacks Leeds",
    short_name: "Jumping Jacks",
    description: "Fun bouncy castle hire in Leeds — book online in minutes.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#6C4AB6",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
