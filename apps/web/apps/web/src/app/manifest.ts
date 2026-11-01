import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "langstudio Lab",
    short_name: "langstudio Lab",
    description: "آموزش و تمرین ارزیابی پاسخ‌های مدل‌های زبانی",
    start_url: "/",
    display: "standalone",
    lang: "fa",
    dir: "rtl",
    background_color: "#fdeef8",
    theme_color: "#e0559c",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
