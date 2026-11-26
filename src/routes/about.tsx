import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { brand, steps } from "@/lib/site-config";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "من نحن | ابتكار — استوديو الملفات الاحترافية في الطائف" },
      {
        name: "description",
        content:
          "قصة ابتكار وقيمنا وطريقة عملنا: سبع سنوات في كتابة وتصميم السير الذاتية والعروض التقديمية والمستندات الرسمية، خدمة أونلاين لكل المملكة وحضورياً في الطائف.",
      },
      { property: "og:title", content: "من نحن | ابتكار" },
      {
        property: "og:description",
        content: "استوديو مكتبي متخصص بخبرة سبع سنوات في صناعة الملفات الاحترافية.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: About,
});

function About() {
  return (
    <SiteLayout>
      <section className="mx-auto max-w-3xl px-5 pt-12">
        <h1 className="text-3xl md:text-4xl">عن {brand.name}</h1>
        <p className="mt-4 text-foreground/80">
          نجمع سرعة الذكاء الاصطناعي ودقة الإنسان. تنجز الأداة المناسبة المسودة الأولى في دقائق، ثم يراجعها خبير مسمّى ويصحح ما يلزم قبل التسليم.
        </p>
        <ul className="mt-8 space-y-4">
          {steps.map((s) => (
            <li key={s.n} className="rounded-[20px] border border-border bg-card p-5">
              <b className="font-display text-lg">{s.title}</b>
              <p className="mt-1 text-sm text-foreground/70">{s.text}</p>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-sm text-foreground/60">
          الاسم والأرقام والتقييمات الحالية تجريبية وسيتم استبدالها ببيانات حقيقية.
        </p>
      </section>
    </SiteLayout>
  );
}
