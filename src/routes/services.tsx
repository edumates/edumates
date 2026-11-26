import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { RequestForm } from "@/components/site/RequestForm";
import { services, steps } from "@/lib/site-config";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "خدماتنا | تصميم سير ذاتية وعروض تقديمية وترجمة ومستندات — ابتكار" },
      {
        name: "description",
        content:
          "خدمات ابتكار بالتفصيل: كتابة وتصميم السير الذاتية، العروض التقديمية، ترجمة وتحويل الملفات، تصاميم وكليشات، كتابة الكتب والعقود، والخدمات الأكاديمية.",
      },
      { property: "og:title", content: "خدماتنا | ابتكار" },
      {
        property: "og:description",
        content: "ست خدمات مكتبية متخصصة بجودة مراجعة مزدوجة والتزام بموعد التسليم.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Services,
});

function Services() {
  return (
    <SiteLayout>
      <section className="mx-auto max-w-6xl px-5 pt-12">
        <h1 className="text-3xl md:text-4xl">خدماتنا</h1>
        <p className="mt-3 max-w-xl text-foreground/70">
          لكل خدمة نختار أنسب أداة ذكاء اصطناعي، ثم يراجعها إنسان. يمكنك أيضاً طلب العمل بشرياً بالكامل.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {services.map((s) => (
            <div key={s.title} className="rounded-[20px] border border-border bg-card p-6">
              <span className="inline-block size-3 bg-primary" aria-hidden="true" />
              <h3 className="mt-3 text-lg">{s.title}</h3>
              <p className="mt-1 text-sm text-foreground/70">{s.text}</p>
            </div>
          ))}
        </div>
        <ol className="mt-12 grid gap-4 md:grid-cols-3">
          {steps.map((s) => (
            <li key={s.n} className="rounded-[20px] bg-muted p-5">
              <b className="font-display text-xl">{s.n}. {s.title}</b>
              <p className="mt-1 text-sm text-foreground/70">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>
      <section className="mt-16 px-5">
        <RequestForm />
      </section>
    </SiteLayout>
  );
}
