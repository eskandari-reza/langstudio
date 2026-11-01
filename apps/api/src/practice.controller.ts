import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { db, schema } from "@langstudio/db";
import { and, eq, sql } from "drizzle-orm";
import { AuthGuard } from "./auth.guard";
import {
  LEVELS,
  RATING_POINTS,
  REVIEW_AFTER_DAYS,
  VOTE_POINTS,
  computeLevels,
  scoreAttempt,
} from "./practice-logic";
import type { Choice, LevelCounts, LevelKey, LevelStat, Rating } from "./practice-logic";

type Req_ = { user: { id: string } };

type StatRow = {
  number: number;
  name_en: string;
  track: string;
  name_translation: string | null;
  level: string;
  total: number;
  done: number;
  score_sum: number;
};

type CategoryOverview = {
  number: number;
  nameEn: string;
  nameTranslation: string | null;
  track: string;
  levels: Record<LevelKey, LevelStat>;
};

type NextRow = {
  id: string;
  code: string;
  level: string;
  prompt_en: string;
  response_a_en: string;
  response_b_en: string;
  title_translation: string | null;
  prompt_translation: string | null;
  response_a_translation: string | null;
  response_b_translation: string | null;
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const CHOICES = ["A", "B", "SAME"];
const PICKABLE_RATINGS = ["much_better", "better", "slightly_better"];

function pickLang(raw?: string): string {
  return raw && /^[a-z]{2,3}(-[A-Za-z]{2,4})?$/.test(raw) ? raw : "fa";
}

function asLevel(raw?: string): LevelKey {
  if (!raw || !(LEVELS as string[]).includes(raw)) throw new BadRequestException("invalid level");
  return raw as LevelKey;
}

function asInt(raw: string | undefined, name: string): number {
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 1) throw new BadRequestException(`invalid ${name}`);
  return n;
}

function errorCode(e: unknown): string | undefined {
  const x = e as { code?: string; cause?: { code?: string } };
  return x?.code ?? x?.cause?.code;
}

// Per-category, per-level totals and this user's first-attempt results.
async function categoryOverviews(uid: string, lang: string, onlyNumber?: number): Promise<CategoryOverview[]> {
  const where = onlyNumber === undefined ? sql`` : sql`where c.number = ${onlyNumber}`;
  const rows = await db.execute<StatRow>(sql`
    select c.number, c.name_en, c.track, ct.name_translation, s.level,
           count(*)::int as total,
           count(a.id)::int as done,
           coalesce(sum(a.score), 0)::int as score_sum
    from categories c
    join scenarios s on s.category_id = c.id and s.status = 'published'
    left join attempts a on a.scenario_id = s.id and a.user_id = ${uid} and a.attempt_no = 1
    left join category_translations ct on ct.category_id = c.id and ct.lang = ${lang}
    ${where}
    group by c.number, c.name_en, c.track, ct.name_translation, s.level
    order by c.number
  `);

  const empty = (): LevelCounts => ({ total: 0, done: 0, scoreSum: 0 });
  const grouped = new Map<number, { head: Omit<CategoryOverview, "levels">; counts: Record<LevelKey, LevelCounts> }>();
  for (const r of rows) {
    let g = grouped.get(r.number);
    if (!g) {
      g = {
        head: { number: r.number, nameEn: r.name_en, nameTranslation: r.name_translation, track: r.track },
        counts: { easy: empty(), medium: empty(), advanced: empty() },
      };
      grouped.set(r.number, g);
    }
    if ((LEVELS as string[]).includes(r.level)) {
      g.counts[r.level as LevelKey] = { total: r.total, done: r.done, scoreSum: r.score_sum };
    }
  }
  return [...grouped.values()].map((g) => ({ ...g.head, levels: computeLevels(g.counts) }));
}

@Controller("practice")
@UseGuards(AuthGuard)
export class PracticeController {
  // All categories with this user's progress and lock state.
  @Get("categories")
  async categories(@Req() req: Req_, @Query("lang") langRaw?: string) {
    return categoryOverviews(req.user.id, pickLang(langRaw));
  }

  // One category.
  @Get("categories/:number")
  async category(@Req() req: Req_, @Param("number") numberRaw: string, @Query("lang") langRaw?: string) {
    const n = asInt(numberRaw, "category");
    const [one] = await categoryOverviews(req.user.id, pickLang(langRaw), n);
    if (!one) throw new NotFoundException("category not found");
    return one;
  }

  // The next scenario in this category and level that the user has not attempted yet.
  // The correct answer is never sent here.
  @Get("next")
  async next(
    @Req() req: Req_,
    @Query("category") categoryRaw?: string,
    @Query("level") levelRaw?: string,
    @Query("lang") langRaw?: string,
  ) {
    const uid = req.user.id;
    const lang = pickLang(langRaw);
    const cat = asInt(categoryRaw, "category");
    const level = asLevel(levelRaw);

    const [overview] = await categoryOverviews(uid, lang, cat);
    if (!overview) throw new NotFoundException("category not found");
    if (!overview.levels[level].unlocked) throw new ForbiddenException("level is locked");

    const rows = await db.execute<NextRow>(sql`
      select s.id, s.code, s.level, s.prompt_en, s.response_a_en, s.response_b_en,
             t.title_translation, t.prompt_translation, t.response_a_translation, t.response_b_translation
      from scenarios s
      join categories c on c.id = s.category_id
      join domains dm on dm.id = s.domain_id
      left join scenario_translations t on t.scenario_id = s.id and t.lang = ${lang}
      where c.number = ${cat} and s.level = ${level} and s.status = 'published'
        and not exists (
          select 1 from attempts a
          where a.scenario_id = s.id and a.user_id = ${uid} and a.attempt_no = 1
        )
      order by dm.position, s.position
      limit 1
    `);

    const stat = overview.levels[level];
    const progress = { done: stat.done, total: stat.total };
    const r = rows[0];
    if (!r) return { done: true, progress };

    const hasTranslation = !!(r.prompt_translation || r.response_a_translation || r.response_b_translation);
    return {
      done: false,
      progress,
      scenario: {
        id: r.id,
        code: r.code,
        level: r.level,
        promptEn: r.prompt_en,
        responseAEn: r.response_a_en,
        responseBEn: r.response_b_en,
        translation: hasTranslation
          ? {
              lang,
              title: r.title_translation,
              prompt: r.prompt_translation,
              responseA: r.response_a_translation,
              responseB: r.response_b_translation,
            }
          : null,
      },
    };
  }

  // Submit an answer; the reference answer and explanation come back in the response.
  @Post("attempts")
  async attempt(
    @Req() req: Req_,
    @Body() body: { scenarioId?: string; choice?: string; rating?: string; lang?: string },
  ) {
    const uid = req.user.id;
    const lang = pickLang(body?.lang);

    if (!body?.scenarioId || !UUID_RE.test(body.scenarioId)) throw new BadRequestException("invalid scenarioId");
    if (!body.choice || !CHOICES.includes(body.choice)) throw new BadRequestException("choice must be A, B or SAME");
    const choice = body.choice as Choice;
    let rating: Rating | null = null;
    if (choice !== "SAME") {
      if (!body.rating || !PICKABLE_RATINGS.includes(body.rating)) {
        throw new BadRequestException("rating must be much_better, better or slightly_better");
      }
      rating = body.rating as Rating;
    }

    const [row] = await db
      .select({ s: schema.scenarios, categoryNumber: schema.categories.number })
      .from(schema.scenarios)
      .innerJoin(schema.categories, eq(schema.categories.id, schema.scenarios.categoryId))
      .where(and(eq(schema.scenarios.id, body.scenarioId), eq(schema.scenarios.status, "published")))
      .limit(1);
    if (!row) throw new NotFoundException("scenario not found");
    const s = row.s;

    const [overview] = await categoryOverviews(uid, lang, row.categoryNumber);
    if (!overview || !overview.levels[s.level as LevelKey]?.unlocked) {
      throw new ForbiddenException("level is locked");
    }

    const result = scoreAttempt(
      { correct: s.correct as Choice, rating: s.rating as Rating },
      { choice, rating },
    );

    try {
      await db.insert(schema.attempts).values({
        userId: uid,
        scenarioId: s.id,
        attemptNo: 1,
        choice,
        rating,
        voteCorrect: result.voteCorrect,
        ratingCorrect: result.ratingCorrect,
        score: result.score,
        reviewDueAt: result.voteCorrect ? null : new Date(Date.now() + REVIEW_AFTER_DAYS * 24 * 3600 * 1000),
      });
    } catch (e) {
      if (errorCode(e) === "23505") throw new BadRequestException("already attempted");
      throw e;
    }

    const [t] = await db
      .select()
      .from(schema.scenarioTranslations)
      .where(and(eq(schema.scenarioTranslations.scenarioId, s.id), eq(schema.scenarioTranslations.lang, lang)))
      .limit(1);

    return {
      voteCorrect: result.voteCorrect,
      ratingCorrect: result.ratingCorrect,
      score: result.score,
      breakdown: {
        vote: { earned: result.votePoints, max: VOTE_POINTS },
        rating: { earned: result.ratingPoints, max: RATING_POINTS },
      },
      reference: { correct: s.correct, rating: s.rating },
      analysis: {
        en: s.analysisEn,
        translation: t?.analysisTranslation ?? null,
        lang,
      },
      justification: {
        en: s.justificationEn,
        translation: t?.justificationTranslation ?? null,
      },
      verification: {
        en: s.verificationEn,
        translation: t?.verificationTranslation ?? null,
      },
    };
  }
}
