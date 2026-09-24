import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
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

/** الحد الأدنى للمسافة (بكسل) لاعتبار الحركة سحباً */
const SWIPE_THRESHOLD = 50;

function useSwipe(
  onSwipeLeft: () => void,
  onSwipeRight: () => void,
  enabled: boolean
) {
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);

  const onStart = (clientX: number, clientY: number) => {
    if (!enabled) return;
    startX.current = clientX;
    startY.current = clientY;
  };

  const onEnd = (clientX: number, clientY: number) => {
    if (!enabled || startX.current === null || startY.current === null) return;
    const dx = clientX - startX.current;
    const dy = clientY - startY.current;
    startX.current = null;
    startY.current = null;

    // تجاهل السحب العمودي القوي (تمرير الصفحة)
    if (Math.abs(dy) > Math.abs(dx)) return;
    if (Math.abs(dx) < SWIPE_THRESHOLD) return;

    if (dx < 0) onSwipeLeft();  // سحب لليسار → الصورة التالية
    else onSwipeRight();       // سحب لليمين → الصورة السابقة
  };

  return {
    onTouchStart: (e: React.TouchEvent) =>
      onStart(e.touches[0].clientX, e.touches[0].clientY),
    onTouchEnd: (e: React.TouchEvent) =>
      onEnd(e.changedTouches[0].clientX, e.changedTouches[0].clientY),
    onMouseDown: (e: React.MouseEvent) => onStart(e.clientX, e.clientY),
    onMouseUp: (e: React.MouseEvent) => onEnd(e.clientX, e.clientY),
  };
}

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
  const [open, setOpen] = useState(false);
  const current = imgs[index] ?? imgs[0];
  const multi = imgs.length > 1;

  const goPrev = () => setIndex((i) => (i - 1 + imgs.length) % imgs.length);
  const goNext = () => setIndex((i) => (i + 1) % imgs.length);

  const swipeHandlers = useSwipe(goNext, goPrev, multi);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, imgs.length]);

  return (
    <>
      <article className="group overflow-hidden rounded-2xl border border-border bg-card">
        <div
          className="relative aspect-4/3 touch-pan-y overflow-hidden bg-muted select-none"
          {...swipeHandlers}
        >
          {current ? (
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="size-full cursor-zoom-in"
              aria-label={`تكبير صورة ${item.title}`}
            >
              <img
                src={current}
                alt={item.title}
                loading="lazy"
                draggable={false}
                className="pointer-events-none size-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </button>
          ) : (
            <div className="flex size-full items-center justify-center text-sm text-muted-foreground">
              لا توجد صورة
            </div>
          )}

          {/* مؤشر عدد الصور */}
          {multi && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-2.5 py-1 text-[11px] font-medium text-white">
              {index + 1} / {imgs.length}
            </div>
          )}

          {multi && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goPrev();
                }}
                aria-label="الصورة السابقة"
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 px-2 py-1 text-sm text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goNext();
                }}
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

      {/* Lightbox */}
      {open && current && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute right-4 top-4 z-10 rounded-full bg-white/10 px-3 py-1.5 text-lg text-white hover:bg-white/20"
            aria-label="إغلاق"
          >
            ✕
          </button>

          <div
            className="relative flex max-h-[90vh] max-w-[95vw] items-center justify-center"
            onClick={(e) => e.stopPropagation()}
            {...swipeHandlers}
          >
            {multi && (
              <>
                <button
                  type="button"
                  onClick={goPrev}
                  className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 px-3 py-2 text-2xl text-white hover:bg-white/20 md:-left-12"
                  aria-label="السابقة"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 px-3 py-2 text-2xl text-white hover:bg-white/20 md:-right-12"
                  aria-label="التالية"
                >
                  ›
                </button>
              </>
            )}

            <img
              src={current}
              alt={item.title}
              draggable={false}
              className="max-h-[90vh] max-w-[95vw] select-none rounded-lg object-contain shadow-2xl"
            />
          </div>

          {multi && (
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1.5 text-xs text-white">
              {index + 1} / {imgs.length}
              <span className="mr-2 opacity-70"> — اسحب للتبديل</span>
            </div>
          )}
        </div>
      )}
    </>
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
