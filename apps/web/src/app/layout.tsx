import type { Metadata, Viewport } from "next";
import "@fontsource/vazirmatn/400.css";
import "@fontsource/vazirmatn/500.css";
import "@fontsource/vazirmatn/700.css";
import "@fontsource/nunito/400.css";
import "@fontsource/nunito/700.css";
import "@fontsource/lalezar/400.css";
import "./globals.css";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";

export const metadata: Metadata = {
  title: { default: "langstudio Lab", template: "%s · langstudio Lab" },
  description: "آموزش و تمرین ارزیابی پاسخ‌های مدل‌های زبانی (langstudio) با سناریوهای دوزبانه",
};

export const viewport: Viewport = {
  themeColor: "#e0559c",
};

// Applies the saved theme before the page paints so the colors do not flash.
// Aurora is the default and needs no attribute.
const themeScript = `(function(){try{var t=localStorage.getItem("theme");if(t==="aurora"||t==="nebula"||t==="light"){document.documentElement.dataset.theme=t}}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
