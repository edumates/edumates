import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PlaceholderBadge } from "@/components/site/SiteLayout";
import { WorkCard } from "@/components/site/WorkCard";
import { works, PLACEHOLDER_DATA } from "@/lib/site-config";

export const Route = createFileRoute("/portfolio")({
  head: () => ({
    meta: [
      { title: "معرض الأعمال | نماذج سير ذاتية وعروض تقديمية وتصاميم — ابتكار" },
      {
        name: "description",
        content:
          "معرض أعمال ابتكار: نماذج سير ذاتية، عروض تقديمية، كتب ومستندات، تصاميم وكليشات، وجداول وتقارير — مع وصف المشكلة والحل في كل عمل.",
      },
      { property: "og:title", content: "معرض الأعمال | ابتكار" },
      {
        property: "og:description",
        content: "نماذج مصوّرة من مشاريع سلّمناها لعملاء في مختلف المجالات.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Portfolio,
});

function Portfolio() {
  return (
    <SiteLayout>
      <section className="mx-auto max-w-6xl px-5 pt-12">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl md:text-4xl">معرض الأعمال</h1>
          {PLACEHOLDER_DATA && <PlaceholderBadge />}
        </div>
        <p className="mt-3 max-w-xl text-foreground/70">
          كل عمل يوضح أداة الذكاء الاصطناعي المستخدمة، وأدوات المراجعة البشرية التي أتقنته.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {works.map((w) => (
            <WorkCard key={w.title} work={w} />
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
