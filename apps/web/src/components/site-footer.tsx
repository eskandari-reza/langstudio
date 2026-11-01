import { Logo } from "@/components/logo";

export default function SiteFooter() {
  return (
    <footer dir="rtl" className="mt-16 px-3 pb-8">
      <div className="sticker-card mx-auto flex max-w-6xl flex-col gap-4 rounded-3xl bg-card/85 p-6 backdrop-blur md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <Logo size={28} />
          <p className="max-w-xl text-sm text-muted-foreground">
            langstudio Lab یک سایت آموزشی مستقل است و وابسته به هیچ‌یک از پلتفرم‌های نام‌برده شده و تأییدشده توسط آن‌ها نیست.
            سناریوها برای تمرین ساخته شده‌اند و سؤال واقعی هیچ آزمونی نیستند.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
          {["قوانین سایت", "حریم خصوصی", "گزارش تخلف"].map((t) => (
            <span key={t} title="به‌زودی" className="cursor-default rounded-full bg-secondary px-3 py-1 text-secondary-foreground">
              {t} · به‌زودی
            </span>
          ))}
        </div>
      </div>
      <p dir="ltr" className="mt-4 text-center text-xs text-muted-foreground">© {new Date().getFullYear()} langstudio Lab</p>
    </footer>
  );
}
