/**
 * الإعدادات المركزية للموقع. عدّل القيم هنا فقط.
 * - الاسم: غيّر brand.name (حالياً اسم مؤقت).
 * - قنوات التواصل: املأ contact.* وسيعمل كل زر مباشرة.
 *   whatsapp: رقم دولي بدون + أو أصفار (مثال 966500000000)
 *   telegram: اسم المستخدم بدون @
 *   email: البريد الإلكتروني
 * - الألوان والخطوط: في src/styles.css داخل :root.
 */
export const brand = {
  name: "Studio X",
  tagline: "خدمات بالذكاء الاصطناعي، بمراجعة بشرية",
};

export const contact = {
  whatsapp: "",
  telegram: "",
  email: "",
};

/** true = تظهر وسم "بيانات تجريبية" بجانب الأرقام والتقييمات والأعمال */
export const PLACEHOLDER_DATA = true;

export const stats = [
  { value: "1,240+", label: "خدمة تم تسليمها" },
  { value: "3 ساعات", label: "متوسط سرعة التسليم" },
  { value: "4.9 / 5", label: "متوسط تقييم العملاء" },
  { value: "100%", label: "من الأعمال تمت مراجعتها بشرياً" },
];

export const steps = [
  {
    n: "1",
    title: "الذكاء الاصطناعي يبدأ",
    text: "نختار أنسب أداة لمهمتك، وتنجز المسودة الأولى خلال دقائق.",
  },
  {
    n: "2",
    title: "إنسان يتقنها",
    text: "خبير مسمّى يراجع المسودة ويصحح ويحسّن كل تفصيلة.",
  },
  {
    n: "3",
    title: "تسليم موثّق",
    text: "يصلك العمل بعد توقيع المراجع وشارة «تمت المراجعة».",
  },
];

export const services = [
  { title: "سير ذاتية وخطابات تعريفية", text: "صياغة وتصميم يناسب الوظيفة المستهدفة وأنظمة الفرز الآلي." },
  { title: "عروض تقديمية", text: "قصة واضحة، شرائح مرتبة، وتصميم يخدم رسالتك." },
  { title: "ترجمة وتدقيق لغوي", text: "ترجمة آلية سريعة يراجعها مترجم بشري لضمان المعنى والنبرة." },
  { title: "مستندات وتقارير", text: "كتابة وتنسيق تقارير وعقود وملفات رسمية." },
  { title: "تصاميم وهوية بصرية", text: "شعارات ومنشورات وقوالب، تولّدها الأدوات ويضبطها مصمم." },
  { title: "جداول وتحليل بيانات", text: "تنظيف وتلخيص البيانات مع فحص بشري للأرقام." },
];

export const aiToolOptions = [
  "اختر أفضل أداة لي",
  "ChatGPT",
  "Claude",
  "Gemini",
  "Midjourney",
  "Canva AI",
  "بدون ذكاء اصطناعي (عمل بشري فقط)",
];

export const reviews = [
  { name: "عميل تجريبي ١", role: "باحث عن عمل", rating: 5, text: "وصلتني السيرة الذاتية في ساعات، وكانت أدق مما توقعت." },
  { name: "عميل تجريبي ٢", role: "صاحب مشروع صغير", rating: 5, text: "العرض التقديمي كان مرتباً وواضحاً، والمراجع صحّح ملاحظات مهمة." },
  { name: "عميل تجريبي ٣", role: "طالب دراسات عليا", rating: 4, text: "الترجمة سريعة وتمت مراجعتها بعناية. أنصح بها." },
];

export type Work = {
  title: string;
  category: string;
  aiTool: string;
  reviewTools: string[];
  reviewer: string;
  note: string;
};

export const works: Work[] = [
  { title: "سيرة ذاتية لمهندس برمجيات", category: "سيرة ذاتية", aiTool: "Claude", reviewTools: ["Grammarly", "فحص ATS"], reviewer: "مراجعة: سارة", note: "إعادة صياغة الإنجازات بالأرقام." },
  { title: "عرض استثماري لشركة ناشئة", category: "عروض تقديمية", aiTool: "ChatGPT + Canva AI", reviewTools: ["Figma", "مراجعة يدوية للبيانات"], reviewer: "مراجعة: خالد", note: "10 شرائح بهوية موحّدة." },
  { title: "ترجمة عقد خدمات", category: "ترجمة", aiTool: "Gemini", reviewTools: ["LanguageTool", "مترجم معتمد"], reviewer: "مراجعة: ليلى", note: "عربي إنجليزي مع تدقيق المصطلحات القانونية." },
  { title: "هوية بصرية لمتجر", category: "تصاميم", aiTool: "Midjourney", reviewTools: ["Illustrator", "اختبار التباين"], reviewer: "مراجعة: عمر", note: "شعار وألوان وقوالب منشورات." },
  { title: "تقرير ربع سنوي", category: "مستندات", aiTool: "ChatGPT", reviewTools: ["Excel", "مراجعة الأرقام"], reviewer: "مراجعة: منى", note: "تلخيص وتنسيق تقرير من 24 صفحة." },
  { title: "كتاب إلكتروني تعليمي", category: "مستندات", aiTool: "Claude", reviewTools: ["Grammarly", "تدقيق إملائي بشري"], reviewer: "مراجعة: يوسف", note: "تحرير وتنسيق وإخراج PDF." },
];

export function buildRequestMessage(opts: {
  name: string;
  details: string;
  aiTool: string;
}) {
  const lines = [
    `مرحباً ${brand.name}،`,
    "أريد طلب خدمة:",
    opts.details.trim(),
    "",
    `تفضيل الأداة: ${opts.aiTool}`,
  ];
  if (opts.name.trim()) lines.push(`الاسم: ${opts.name.trim()}`);
  return lines.join("\n");
}

export function contactLink(
  channel: "whatsapp" | "telegram" | "email",
  message: string,
) {
  const text = encodeURIComponent(message);
  if (channel === "whatsapp") {
    const n = contact.whatsapp.replace(/\D/g, "");
    return n ? `https://wa.me/${n}?text=${text}` : `https://wa.me/?text=${text}`;
  }
  if (channel === "telegram") {
    const u = contact.telegram.replace(/^@/, "").trim();
    return u
      ? `https://t.me/${u}?text=${text}`
      : `https://t.me/share/url?url=%20&text=${text}`;
  }
  const subject = encodeURIComponent(`طلب خدمة - ${brand.name}`);
  return `mailto:${contact.email}?subject=${subject}&body=${text}`;
}
