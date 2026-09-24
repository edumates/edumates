import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Check } from "lucide-react";

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

const services = [
  {
    title: "كتابة وتصميم السيرة الذاتية",
    text: "نعيد بناء سيرتك من الصفر: صياغة الإنجازات بأرقام، ترتيب الأقسام حسب الوظيفة المستهدفة، وتصميم يجتاز أنظمة الفرز الآلي.",
    items: ["نسخة PDF ونسخة Word قابلة للتعديل", "خطاب تعريفي اختياري", "تحسين ملف لينكدإن"],
  },
  {
    title: "العروض التقديمية",
    text: "نبني سرد العرض أولاً ثم الشرائح: رسالة واحدة لكل شريحة، بيانات مبسّطة، وهوية بصرية ثابتة.",
    items: ["عروض استثمارية وتجارية", "عروض تدريبية وأكاديمية", "قالب قابل لإعادة الاستخدام"],
  },
  {
    title: "الترجمة وتحويل الملفات",
    text: "ترجمة عربي/إنجليزي بمصطلحات صحيحة، وتحويل بين PDF وWord وExcel مع الحفاظ على التنسيق.",
    items: ["ترجمة مستندات ومراسلات", "تحويل PDF إلى Word محرّر", "إعادة بناء الجداول والخطوط"],
  },
  {
    title: "التصاميم والكليشات",
    text: "ترويسات، بطاقات أعمال، مغلفات، ومنشورات تسويقية بهوية بصرية متناسقة وجاهزة للطباعة.",
    items: ["ملفات بجودة طباعة", "قوالب منشورات للمنصات", "تعديلات ضمن نطاق الطلب"],
  },
  {
    title: "كتابة الكتب والمستندات والعقود",
    text: "تحرير وصياغة رسمية بلغة سليمة، مع تنسيق الفهارس والمراجع والأقسام حسب المعايير.",
    items: ["تنسيق كتب إلكترونية", "عقود ومستندات رسمية", "تدقيق لغوي كامل"],
  },
  {
    title: "الخدمات الأكاديمية",
    text: "إعداد وتنسيق الأبحاث والتقارير المدرسية والجامعية والعروض المصاحبة لها.",
    items: ["تنسيق وفق دليل الجامعة", "عروض تقديمية للمناقشة", "مراجعة المصادر والمراجع"],
  },
];

function Services() {
  return (
    <div className="min-h-screen">
      <Header />

      <section className="surface-navy">
        <div className="mx-auto max-w-4xl px-5 py-20 text-center">
          <span className="text-xs font-bold text-gold">خدماتنا</span>
          <h1 className="mt-4 text-4xl leading-tight md:text-5xl">
            خدمة واحدة لكل ملف يحمل اسمك
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed opacity-85">
            نتعامل مع كل طلب كمشروع صغير له هدف وجمهور ومعيار نجاح، لا كملف يُنسخ من قالب.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="grid gap-6 md:grid-cols-2">
          {services.map((s) => (
            <article key={s.title} className="rounded-2xl border border-border bg-card p-8">
              <h2 className="text-xl">{s.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
              <ul className="mt-5 space-y-2">
                {s.items.map((i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <Check className="size-4 shrink-0 text-gold" />
                    {i}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-20">
        <div className="surface-navy rounded-3xl p-10 text-center">
          <SectionHeading
            eyebrow="ابدأ الآن"
            title="أخبرنا بما تحتاجه، ونرسل لك خطة وسعراً واضحاً"
          />
          <a href="https://wa.me/966538396424" target="_blank" rel="noopener" className="btn-base btn-gold mt-8">
            طلب عرض سعر
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
