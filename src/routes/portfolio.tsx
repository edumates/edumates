import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { SectionHeading } from "@/components/site/SectionHeading";
import { categories, portfolioItems } from "@/data/portfolio";

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
  const [active, setActive] = useState<string>("الكل");
  const items =
    active === "الكل" ? portfolioItems : portfolioItems.filter((i) => i.category === active);

  return (
    <div className="min-h-screen">
      <Header />

      <section className="surface-navy">
        <div className="mx-auto max-w-4xl px-5 py-20 text-center">
          <span className="text-xs font-bold text-gold">معرض الأعمال</span>
          <h1 className="mt-4 text-4xl leading-tight md:text-5xl">أعمال تتحدث عن نفسها</h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed opacity-85">
            مجموعة مختارة من الملفات التي صممناها وكتبناها — مصنّفة حسب نوع الخدمة.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="mb-10 flex flex-wrap justify-center gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={
                active === c
                  ? "rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground"
                  : "rounded-full border border-border px-5 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
              }
            >
              {c}
            </button>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {items.map((item) => (
            <article
              key={item.id}
              className="group overflow-hidden rounded-2xl border border-border bg-card"
            >
              <div className="aspect-4/3 overflow-hidden bg-muted">
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-6">
                <span className="text-xs font-bold text-gold">{item.category}</span>
                <h2 className="mt-2 text-base">{item.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
                {item.link && (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener"
                    className="mt-4 inline-block text-sm font-bold text-primary underline"
                  >
                    عرض العمل
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-20">
        <div className="surface-navy rounded-3xl p-10 text-center">
          <h2 className="text-2xl">مشروعك القادم يستحق نفس العناية</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm opacity-80">
            أرسل لنا تفاصيل طلبك ونعود إليك بخطة تنفيذ ومدة وسعر.
          </p>
          <a href="https://wa.me/966538396424" target="_blank" rel="noopener" className="btn-base btn-gold mt-7">
            تواصل معنا
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
