import Link from "next/link";
import { auth } from "@/auth";
import { db } from "@langstudio/db";
import { sql } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { HeroArt } from "@/components/hero-art";
import { CategoryIcon, Icon } from "@/components/icons";
import type { IconName } from "@/lib/icon-data";

type CatRow = {
  number: number;
  name_en: string;
  track: string;
  name_translation: string | null;
  scenarios: number;
};

// Live numbers for the home page. If the database is unreachable the numbers are simply hidden.
async function loadStats() {
  try {
    const rows = await db.execute<CatRow>(sql`
      select c.number, c.name_en, c.track, ct.name_translation, count(s.id)::int as scenarios
      from categories c
      left join scenarios s on s.category_id = c.id and s.status = 'published'
      left join category_translations ct on ct.category_id = c.id and ct.lang = 'fa'
      group by c.number, c.name_en, c.track, ct.name_translation
      order by c.number
    `);
    const cats = Array.from(rows);
    return { cats, total: cats.reduce((s, c) => s + c.scenarios, 0) };
  } catch {
    return null;
  }
}

const fa = (n: number) => n.toLocaleString("fa-IR");

const STEPS: { icon: IconName; title: string; text: string }[] = [
  {
    icon: "book",
    title: "یاد بگیر",
    text: "هر سناریو یک پرسش و دو پاسخ دارد. بعد از جواب دادن، تحلیل و نمونه‌ی توجیه را می‌خوانی.",
  },
  {
    icon: "target",
    title: "تمرین کن",
    text: "پاسخ بهتر و میزان برتری را انتخاب کن و همان لحظه نمره بگیر.",
  },
  {
    icon: "heartstep",
    title: "پیشرفت کن",
    text: "با کامل کردن هر سطح، سطح بعدیِ همان دسته باز می‌شود؛ از آسان تا پیشرفته.",
  },
];

const TRACKS = [
  { id: "skills", title: "مهارت‌های ارزیابی" },
  { id: "topics", title: "موضوعات تخصصی" },
];

export default async function Home() {
  const [session, stats] = await Promise.all([auth(), loadStats()]);
  const loggedIn = !!session?.user;

  return (
    <main dir="rtl" className="mx-auto max-w-6xl space-y-16 px-4 pt-10">
      {/* hero */}
      <section className="grid items-center gap-8 md:grid-cols-2">
        <div className="space-y-5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-sm text-secondary-foreground">
            <Icon name="sparkle" size={18} /> آموزش و تمرین langstudio
          </span>
          <h1 className="text-4xl leading-tight md:text-6xl">
            هوش مصنوعی بهتر،
            <br />
            با قضاوت انسانی
          </h1>
          <p className="max-w-xl text-lg leading-8 text-muted-foreground">
            با سناریوهای تمرینی دوزبانه یاد بگیر چطور پاسخ‌های مدل‌های زبانی را مقایسه کنی، خطاها را پیدا کنی و حکمت را
            توجیه کنی؛ قدم‌به‌قدم، از سطح آسان تا پیشرفته.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/practice">{loggedIn ? "ادامه‌ی تمرین" : "شروع تمرین"}</Link>
            </Button>
            {!loggedIn && (
              <Button asChild size="lg" variant="outline">
                <Link href="/login">ورود</Link>
              </Button>
            )}
          </div>
        </div>
        <HeroArt className="mx-auto w-full max-w-md" />
      </section>

      {/* numbers */}
      {stats && stats.total > 0 && (
        <section className="grid grid-cols-3 gap-3 text-center">
          {[
            { n: stats.total, label: "سناریوی تمرینی" },
            { n: stats.cats.length, label: "دسته‌ی موضوعی" },
            { n: 3, label: "سطح دشواری" },
          ].map((s) => (
            <div key={s.label} className="sticker-card rounded-3xl bg-card p-4">
              <div className="font-display text-3xl text-primary md:text-4xl">{fa(s.n)}</div>
              <div className="text-sm text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </section>
      )}

      {/* steps */}
      <section className="space-y-6">
        <h2 className="text-center text-3xl">چطور کار می‌کند؟</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <div key={s.title} className="sticker-card space-y-3 rounded-3xl bg-card p-6 text-center">
              <div className="mx-auto grid size-16 place-items-center rounded-3xl bg-secondary">
                <Icon name={s.icon} size={40} />
              </div>
              <h3 className="font-display text-2xl">
                {fa(i + 1)}. {s.title}
              </h3>
              <p className="text-sm leading-7 text-muted-foreground">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* categories */}
      {stats && stats.cats.length > 0 && (
        <section className="space-y-8">
          <h2 className="text-center text-3xl">با چه چیزهایی تمرین می‌کنی؟</h2>
          {TRACKS.map((t) => {
            const list = stats.cats.filter((c) => c.track === t.id);
            if (!list.length) return null;
            return (
              <div key={t.id} className="space-y-3">
                <h3 className="text-xl text-muted-foreground">{t.title}</h3>
                <div className="flex flex-wrap gap-3">
                  {list.map((c) => (
                    <Link
                      key={c.number}
                      href={`/practice/${c.number}`}
                      className="sticker-card flex items-center gap-2 rounded-full bg-card py-2 pe-4 ps-2 text-sm transition-transform hover:-translate-y-0.5"
                    >
                      <span className="grid size-10 place-items-center rounded-full bg-secondary">
                        <CategoryIcon number={c.number} size={26} />
                      </span>
                      {c.name_translation ?? c.name_en}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </section>
      )}

      {/* closing call to action */}
      <section className="sticker-card space-y-4 rounded-3xl bg-card p-8 text-center">
        <Icon name="sparkle" size={40} className="mx-auto" />
        <h2 className="text-3xl">آماده‌ای؟</h2>
        <p className="text-muted-foreground">اولین سناریو فقط چند دقیقه طول می‌کشد.</p>
        <Button asChild size="lg">
          <Link href="/practice">{loggedIn ? "برو سراغ تمرین" : "شروع تمرین"}</Link>
        </Button>
      </section>
    </main>
  );
}
