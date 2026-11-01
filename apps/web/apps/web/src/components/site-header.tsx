import Link from "next/link";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import ThemeSwitcher from "@/components/theme-switcher";

function Soon({ children }: { children: React.ReactNode }) {
  return (
    <span
      title="به‌زودی"
      className="inline-flex cursor-default items-center gap-1 px-3 py-1.5 text-sm text-muted-foreground/70"
    >
      {children}
      <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[10px] text-secondary-foreground">به‌زودی</span>
    </span>
  );
}

export default async function SiteHeader() {
  const session = await auth();

  return (
    <header dir="rtl" className="sticky top-0 z-40 px-3 pt-3">
      <div className="sticker-card mx-auto flex max-w-6xl items-center justify-between gap-3 rounded-full bg-card/85 px-4 py-2 backdrop-blur">
        <Link href="/" aria-label="صفحه‌ی اصلی langstudio Lab">
          <Logo size={32} />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Link href="/practice" className="rounded-full px-3 py-1.5 text-sm font-medium hover:bg-secondary">
            تمرین
          </Link>
          <Soon>پلتفرم‌ها</Soon>
          <Soon>آموزش</Soon>
        </nav>

        <div className="flex items-center gap-3">
          <ThemeSwitcher />
          {session?.user ? (
            <Button asChild size="sm">
              <Link href="/dashboard">داشبورد</Link>
            </Button>
          ) : (
            <Button asChild size="sm">
              <Link href="/login">ورود</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
