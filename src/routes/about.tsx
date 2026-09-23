import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { SectionHeading } from "@/components/site/SectionHeading";

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

const values = [
  { t: "الدقة قبل السرعة", d: "لا نسلّم ملفاً لم نقرأه مرتين ولم نراجع تنسيقه بعين المصمم." },
  { t: "الوضوح في التعامل", d: "سعر ونطاق ومدة معروفة قبل البدء، بدون مفاجآت لاحقة." },
  { t: "الشراكة لا التنفيذ", d: "نسألك عن هدفك من الملف، ثم نبني المحتوى ليخدم ذلك الهدف." },
  { t: "التطوير المستمر", d: "نحدّث قوالبنا وأساليب الصياغة بما يتوافق مع سوق العمل اليوم." },
];

const steps = [
  { n: "01", t: "الاستماع", d: "نفهم هدفك وجمهورك والمواد المتوفرة لديك." },
  { n: "02", t: "الصياغة", d: "نكتب أو نعيد صياغة المحتوى بلغة مهنية مركزة." },
  { n: "03", t: "التصميم", d: "ننفّذ التصميم بهوية بصرية متناسقة وقابلة للتعديل." },
  { n: "04", t: "التسليم والمراجعة", d: "نسلّم الملف بصيغه المختلفة وننفّذ تعديلاتك." },
];

function About() {
  return (
    <div className="min-h-screen">
      <Header />

      <section className="surface-navy">
        <div className="mx-auto max-w-4xl px-5 py-20 text-center">
          <span className="text-xs font-bold text-gold">من نحن</span>
          <h1 className="mt-4 text-4xl leading-tight md:text-5xl">
            نصنع الملفات التي يُحكم عليك من خلالها
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed opacity-85">
            ابتكار استوديو مكتبي سعودي بدأ عمله قبل أكثر من سبع سنوات بفكرة واحدة: أن المستند
            الجيد ليس ترفاً، بل أداة تفتح فرصة عمل أو تُقنع مستثمراً أو تُنجح بحثاً.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-12 px-5 py-20 md:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4 text-base leading-relaxed text-muted-foreground">
          <h2 className="text-2xl text-foreground">قصتنا</h2>
          <p>
            انطلقنا من أعمال مكتبية بسيطة، ثم تحوّلت التجربة إلى تخصص دقيق: كيف نكتب سيرة ذاتية
            تُقرأ فعلاً؟ كيف نبني عرضاً تقديمياً يوصل الفكرة في دقيقتين؟ كيف ننسّق كتاباً يستحق
            أن يُطبع؟
          </p>
          <p>
            اليوم نعمل بشكل كامل <strong className="text-foreground">أونلاين</strong> مع عملاء من
            جميع مناطق المملكة، ونحتفظ بحضور ميداني في{" "}
            <strong className="text-foreground">مكتبة الريادة</strong> بالطائف لخدمات الطباعة
            والتجليد.
          </p>
          <p>
            عملاؤنا خلاصتهم واحدة: باحثون عن وظيفة، أصحاب مشاريع، طلاب، وجهات تحتاج مستندات رسمية
            دقيقة.
          </p>
          <a href="https://wa.me/966538396424" target="_blank" rel="noopener" className="btn-base btn-outline-navy mt-4">
            تحدّث معنا
          </a>
        </div>

        <div className="surface-navy rounded-3xl p-8">
          <div className="font-display text-5xl font-extrabold text-gold">7+</div>
          <p className="mt-3 text-sm leading-relaxed opacity-85">
            سنوات من التخصص في صناعة الملفات المكتبية والسير الذاتية والعروض التقديمية.
          </p>
          <div className="mt-8 space-y-4 border-t border-white/10 pt-6 text-sm">
            <div className="flex justify-between">
              <span className="opacity-70">نطاق الخدمة</span>
              <span className="font-bold">كل مناطق المملكة</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-70">الحضور الميداني</span>
              <span className="font-bold">الطائف</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-70">صيغ التسليم</span>
              <span className="font-bold">PDF / Word / PPT</span>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-muted py-20">
        <div className="mx-auto max-w-6xl px-5">
          <SectionHeading eyebrow="قيمنا" title="أربع قواعد لا نتنازل عنها" />
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {values.map((v) => (
              <div key={v.t} className="rounded-2xl bg-card p-7 shadow-soft">
                <h3 className="text-lg">{v.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{v.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20">
        <SectionHeading eyebrow="آلية العمل" title="أربع خطوات واضحة من الطلب إلى التسليم" />
        <div className="mt-12 grid gap-6 md:grid-cols-4">
          {steps.map((s) => (
            <div key={s.n} className="rounded-2xl border border-border bg-card p-6">
              <span className="font-display text-2xl font-extrabold text-gold">{s.n}</span>
              <h3 className="mt-3 text-base">{s.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
