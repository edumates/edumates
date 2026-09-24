import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
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

function PortfolioCard({
  item,
}: {
  item: (typeof portfolioItems)[number];
}) {
  const imgs =
    item.images?.length > 0
      ? item.images
      : item.image
        ? [item.image]
        : [];
  const [index, setIndex] = useState(0);
  const current = imgs[index] ?? imgs[0];

  return (
    <article className="group overflow-hidden rounded-2xl border border-border bg-card">
      <div className="relative aspect-4/3 overflow-hidden bg-muted">
        {current ? (
          <img
            src={current}
            alt={item.title}
            loading="lazy"
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-sm text-muted-foreground">
            لا توجد صورة
          </div>
        )}

        {imgs.length > 1 && (
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {imgs.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`صورة ${i + 1}`}
                className={
                  i === index
                    ? "h-2.5 w-2.5 rounded-full bg-gold shadow"
                    : "h-2.5 w-2.5 rounded-full bg-white/70 hover:bg-white"
                }
              />
            ))}
          </div>
        )}

        {imgs.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => setIndex((i) => (i - 1 + imgs.length) % imgs.length)}
              aria-label="الصورة السابقة"
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 px-2 py-1 text-sm text-white opacity-0 transition-opacity group-hover:opacity-100"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => setIndex((i) => (i + 1) % imgs.length)}
              aria-label="الصورة التالية"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 px-2 py-1 text-sm text-white opacity-0 transition-opacity group-hover:opacity-100"
            >
              ›
            </button>
          </>
        )}
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
  );
}

function Portfolio() {
  const [active, setActive] = useState<string>("الكل");
  const items =
    active === "الكل"
      ? portfolioItems
      : portfolioItems.filter((i) => i.category === active);

  return (
    <div className="min-h-screen">
      <Header />

      <section className="surface-navy">
        <div className="mx-auto max-w-4xl px-5 py-20 text-center">
          <span className="text-xs font-bold text-gold">معرض الأعمال</span>
          <h1 className="mt-4 text-4xl leading-tight md:text-5xl">
            أعمال تتحدث عن نفسها
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed opacity-85">
            مجموعة مختارة من الملفات التي صممناها وكتبناها — مصنّفة حسب نوع
            الخدمة.
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
            <PortfolioCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-20">
        <div className="surface-navy rounded-3xl p-10 text-center">
          <h2 className="text-2xl">مشروعك القادم يستحق نفس العناية</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm opacity-80">
            أرسل لنا تفاصيل طلبك ونعود إليك بخطة تنفيذ ومدة وسعر.
          </p>
          <a
            href="https://wa.me/966538396424"
            target="_blank"
            rel="noopener"
            className="btn-base btn-gold mt-7"
          >
            تواصل معنا
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
