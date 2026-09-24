import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { SectionHeading } from "@/components/site/SectionHeading";
import { portfolioItems } from "@/data/portfolio";
import {
  FileText,
  Presentation,
  Languages,
  Palette,
  BookOpen,
  GraduationCap,
  Clock,
  ShieldCheck,
  Sparkles,
  MapPin,
} from "lucide-react";

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

const services = [
  {
    icon: FileText,
    title: "سير ذاتية تُقنع قبل المقابلة",
    text: "صياغة إنجازاتك بلغة نتائج، وتصميم يجتاز أنظمة التوظيف الآلية ويلفت نظر مدير التوظيف في ثوانٍ.",
  },
  {
    icon: Presentation,
    title: "عروض تقديمية بسرد مقنع",
    text: "نبني قصة العرض قبل الشرائح: تسلسل منطقي، بيانات واضحة، وتصميم يخدم رسالتك لا يزاحمها.",
  },
  {
    icon: Languages,
    title: "ترجمة وتحويل وتنسيق الملفات",
    text: "ترجمة دقيقة وتحويل PDF وWord مع الحفاظ الكامل على التنسيق والجداول والخطوط.",
  },
  {
    icon: Palette,
    title: "كليشات وهويات مطبوعة",
    text: "ترويسات، بطاقات، ومنشورات بهوية بصرية متناسقة جاهزة للطباعة والنشر الرقمي.",
  },
  {
    icon: BookOpen,
    title: "كتابة الكتب والمستندات والعقود",
    text: "تحرير وصياغة رسمية بلغة سليمة، وتنسيق احترافي للفهارس والمراجع والأقسام.",
  },
  {
    icon: GraduationCap,
    title: "أبحاث وخدمات أكاديمية",
    text: "إعداد وتنسيق الأبحاث والتقارير المدرسية والجامعية وفق المعايير المطلوبة.",
  },
];

const pillars = [
  {
    icon: ShieldCheck,
    title: "جودة مراجعة مرتين",
    text: "كل ملف يمر على مراجعة لغوية وأخرى بصرية قبل التسليم.",
  },
  {
    icon: Clock,
    title: "التزام بالموعد",
    text: "تسليم في الوقت المتفق عليه، وتعديلات مجانية ضمن نطاق الطلب.",
  },
  {
    icon: Sparkles,
    title: "خصوصية كاملة",
    text: "بياناتك ومستنداتك تبقى سرية ولا تُستخدم في أي عرض دون إذنك.",
  },
];

function Home() {
  const featured = portfolioItems.slice(0, 3);

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero */}
      <section className="surface-navy relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 md:grid-cols-[1.1fr_0.9fr] md:py-28">
          <div>
            {/* تم حذف شارة «خبرة تتجاوز 7 سنوات» */}
            <h1 className="text-4xl leading-tight text-surface-foreground md:text-5xl">
              ملفاتك هي انطباعك الأول.
              <br />
              <span className="text-gold-gradient">نجعله انطباعاً لا يُنسى.</span>
            </h1>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="https://wa.me/966538396424"
                target="_blank"
                rel="noopener"
                className="btn-base btn-gold !px-10 !py-4 text-lg font-extrabold shadow-gold ring-4 ring-gold/25"
              >
                ابدأ مشروعك اليوم
              </a>
              <Link to="/portfolio" className="btn-base btn-ghost-light">
                شاهد أعمالنا
              </Link>
              {/* زر جديد ينتقل لقسم المكتبة والخريطة أسفل الصفحة */}
              <a href="#library" className="btn-base btn-ghost-light">
                زُرنا في المكتبة
              </a>
            </div>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-surface-foreground/85">
              استوديو ابتكار يكتب ويصمم السير الذاتية والعروض التقديمية والمستندات الرسمية
              بمعايير مهنية دقيقة. نعمل أونلاين مع كل مناطق المملكة، ونستقبلك حضورياً في الطائف.
            </p>
          </div>

          <div className="rounded-2xl border border-white/15 bg-white/5 p-7 backdrop-blur-sm">
            <div className="grid grid-cols-3 gap-4 text-center">
              {[
                { k: "+7", v: "سنوات خبرة" },
                { k: "+100", v: "ملف مُنجز" },
                { k: "2س", v: "متوسط الرد" },
              ].map((s) => (
                <div key={s.v}>
                  <div className="font-display text-2xl font-extrabold text-gold">{s.k}</div>
                  <div className="mt-1 text-xs opacity-75">{s.v}</div>
                </div>
              ))}
            </div>
            <div className="mt-7 space-y-3 text-sm">
              {["تشخيص مجاني لملفك الحالي", "نسخة قابلة للتعديل دائماً", "تنسيق متوافق مع أنظمة ATS"].map(
                (t) => (
                  <div key={t} className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-3">
                    <span className="size-1.5 rounded-full bg-gold" />
                    {t}
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </section>

      {/* خدمات */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <SectionHeading
          eyebrow="خدماتنا"
          title="ست خدمات تغطي كل ما تحتاجه على الورق"
          description="من أول سطر في سيرتك الذاتية إلى آخر شريحة في عرضك التقديمي."
        />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {services.map((s) => (
            <article
              key={s.title}
              className="rounded-2xl border border-border bg-card p-7 transition-all hover:-translate-y-1 hover:shadow-soft"
            >
              <div className="flex size-11 items-center justify-center rounded-xl bg-gold-soft">
                <s.icon className="size-5 text-primary" />
              </div>
              <h3 className="mt-5 text-lg">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
            </article>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link to="/services" className="btn-base btn-outline-navy">
            تفاصيل الخدمات وآلية العمل
          </Link>
        </div>
      </section>

      {/* لماذا ابتكار */}
      <section className="bg-muted py-20">
        <div className="mx-auto max-w-6xl px-5">
          <SectionHeading
            eyebrow="لماذا ابتكار"
            title="احتراف يظهر في التفاصيل الصغيرة"
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {pillars.map((p) => (
              <div key={p.title} className="rounded-2xl bg-card p-7 shadow-soft">
                <p.icon className="size-6 text-gold" />
                <h3 className="mt-4 text-lg">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* أعمال مميزة — إصلاح الصور */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <SectionHeading
          eyebrow="أعمالنا"
          title="نماذج حقيقية من مشاريع سلّمناها"
          description="كل نموذج يعرض مشكلة العميل والحل الذي صمّمناه."
        />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {featured.map((item) => {
            // الصورة الأولى من المصفوفة، أو image القديم إن وُجد
            const img =
              item.images?.[0] ?? item.image ?? "";

            return (
              <article
                key={item.id}
                className="group overflow-hidden rounded-2xl border border-border bg-card"
              >
                <div className="aspect-4/3 overflow-hidden bg-muted">
                  {img ? (
                    <img
                      src={img}
                      alt={item.title}
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : null}
                </div>
                <div className="p-6">
                  <span className="text-xs font-bold text-gold">{item.category}</span>
                  <h3 className="mt-2 text-base">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
        <div className="mt-10 text-center">
          <Link to="/portfolio" className="btn-base btn-outline-navy">
            كل الأعمال
          </Link>
        </div>
      </section>

      {/* المكتبة والخريطة — id للتنقل من الزر */}
      <section id="library" className="mx-auto max-w-6xl scroll-mt-24 px-5 pb-20">
        <div className="surface-navy grid gap-8 rounded-3xl p-8 md:grid-cols-2 md:p-10">
          <div className="flex flex-col justify-center">
            <span className="inline-flex items-center gap-2 text-xs font-bold text-gold">
              <MapPin className="size-3.5" /> خدمات حضورية
            </span>
            <h2 className="mt-3 text-2xl text-surface-foreground">
              تحتاج طباعة أو تجليد؟ زُرنا في مكتبة الريادة
            </h2>
            <p className="mt-2 max-w-xl text-sm text-surface-foreground/80">
              الطائف — المملكة العربية السعودية. طباعة، تصوير، تجليد، وكل الخدمات المكتبية على
              أرض الواقع.
            </p>
            <p className="mt-4 flex items-center gap-2 text-sm text-surface-foreground/90">
              <Clock className="size-4 text-gold" /> السبت — الخميس، 9 صباحاً حتى 9 مساءً
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="https://maps.app.goo.gl/oHAhEWxRH48Dn4ur7"
                target="_blank"
                rel="noopener"
                className="btn-base btn-gold"
              >
                الموقع على الخريطة
              </a>
              <a
                href="https://wa.me/966538396424"
                target="_blank"
                rel="noopener"
                className="btn-base btn-ghost-light"
              >
                واتساب 0538396424
              </a>
            </div>
          </div>
          <div className="h-72 overflow-hidden rounded-2xl border border-white/15 md:h-80">
            <iframe
              title="موقع مكتبة الريادة"
              src="https://www.google.com/maps?q=%D9%85%D9%83%D8%AA%D8%A8%D8%A9%20%D8%A7%D9%84%D8%B1%D9%8A%D8%A7%D8%AF%D8%A9%20%D8%A7%D9%84%D8%B7%D8%A7%D8%A6%D9%81&output=embed"
              className="size-full"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
