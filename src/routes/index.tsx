import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout, PlaceholderBadge } from "@/components/site/SiteLayout";
import { RequestForm } from "@/components/site/RequestForm";
import { WorkCard } from "@/components/site/WorkCard";
import { brand, steps, stats, reviews, works, PLACEHOLDER_DATA } from "@/lib/site-config";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: "ابتكار | تصميم سير ذاتية وعروض تقديمية ومستندات احترافية أونلاين",
      },
      {
        name: "description",
        content:
          "استوديو ابتكار: خبرة سبع سنوات في كتابة وتصميم السير الذاتية، العروض التقديمية، ملفات الأوفيس، الترجمة والكتب الإلكترونية. خدمة أونلاين لكل مناطق المملكة وحضورياً في الطائف.",
      },
      {
        property: "og:title",
        content: "ابتكار | ملفات احترافية تفتح لك الأبواب",
      },
      {
        property: "og:description",
        content:
          "سير ذاتية، عروض تقديمية، مستندات وتصاميم بجودة استوديو متخصص وسرعة تسليم موثوقة.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <SiteLayout>
      <section className="mx-auto max-w-6xl px-5 pt-8">
        <div className="surface-ink grid items-center gap-8 rounded-[28px] p-8 md:grid-cols-2 md:p-14">
          <div>
            <p className="text-xs font-bold tracking-widest text-white/60">
              بالذكاء الاصطناعي · بإتقان بشري
            </p>
            <h1 className="mt-4 text-4xl leading-tight md:text-5xl">
              عمل بسرعة الآلة،
              <br />
              <span className="text-accent italic">يُتقنه إنسان.</span>
            </h1>
            <p className="mt-5 max-w-md text-white/75">
              خدمات عالمية ينجز فيها الذكاء الاصطناعي الجهد الأكبر، ثم يراجع خبير بشري كل نتيجة قبل أن تصلك.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href="#request" className="btn-signal">ابدأ مشروعك</a>
              <a href="#how" className="btn-outline-light">كيف نعمل</a>
            </div>
          </div>
          <div className="flex justify-center" aria-hidden="true">
            <svg width="260" height="240" viewBox="0 0 260 240">
              <rect x="20" y="10" width="140" height="120" rx="6" fill="#3B4BFF" />
              <rect x="40" y="40" width="60" height="5" fill="#fff" opacity=".7" />
              <rect x="40" y="62" width="100" height="5" fill="#fff" opacity=".7" />
              <rect x="40" y="84" width="40" height="5" fill="#fff" opacity=".7" />
              <circle cx="165" cy="150" r="75" fill="#F2A65A" opacity=".95" />
              <path d="M130 150 l24 24 l42 -48" stroke="#0E1B2C" strokeWidth="12" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </section>

      <section id="how" className="mx-auto mt-6 grid max-w-6xl gap-4 px-5 md:grid-cols-3">
        {steps.map((s, i) => (
          <div key={s.n} className="rounded-[20px] bg-card p-6 border border-border">
            <div
              className={`font-display text-3xl ${i === 0 ? "text-primary" : i === 1 ? "text-accent" : "text-verified-ink"}`}
            >
              {s.n}
            </div>
            <h3 className="mt-1 text-lg">{s.title}</h3>
            <p className="mt-1 text-sm text-foreground/70">{s.text}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto mt-16 max-w-6xl px-5">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl md:text-3xl">أرقامنا</h2>
          {PLACEHOLDER_DATA && <PlaceholderBadge />}
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-[20px] border border-border bg-card p-5">
              <div className="font-display text-3xl text-primary">{s.value}</div>
              <div className="mt-1 text-sm text-foreground/70">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-6xl px-5">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl md:text-3xl">آراء العملاء</h2>
          {PLACEHOLDER_DATA && <PlaceholderBadge />}
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {reviews.map((r) => (
            <figure key={r.name} className="rounded-[20px] border border-border bg-card p-5">
              <div className="text-accent" aria-label={`${r.rating} من 5`}>
                {"★".repeat(r.rating)}
                <span className="text-border">{"★".repeat(5 - r.rating)}</span>
              </div>
              <blockquote className="mt-2 text-sm">{r.text}</blockquote>
              <figcaption className="mt-3 text-xs text-foreground/60">
                {r.name} · {r.role}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-6xl px-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-2xl md:text-3xl">من أعمالنا</h2>
          <Link to="/portfolio" className="text-sm font-semibold text-primary">كل الأعمال</Link>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {works.slice(0, 3).map((w) => (
            <WorkCard key={w.title} work={w} />
          ))}
        </div>
      </section>

      <section className="mt-16 px-5">
        <RequestForm />
        <p className="mt-4 text-center text-xs text-foreground/50">{brand.name}</p>
      </section>
    </SiteLayout>
  );
}
