/**
 * معرض الأعمال.
 * استبدل قيمة image بروابط صورك الحقيقية، وعدّل العنوان والوصف والتصنيف.
 * يمكنك إضافة أي عدد من العناصر بنفس الشكل.
 */
export type PortfolioItem = {
  id: string;
  title: string;
  description: string;
  category: string;
  image: string;
  link?: string;
};

export const categories = [
  "الكل",
  "سيرة ذاتية",
  "عروض تقديمية",
  "تصاميم",
  "مستندات وكتب",
  "جداول وتقارير",
] as const;

export const portfolioItems: PortfolioItem[] = [
  {
    id: "cv-management",
    title: "سيرة ذاتية لمدير تنفيذي",
    description:
      "إعادة صياغة كاملة للمحتوى وتصميم هيكل بصري يبرز الإنجازات الرقمية للمرشح.",
    category: "سيرة ذاتية",
    image: "https://picsum.photos/seed/ibtikar-cv-1/900/1200",
  },
  {
    id: "cv-fresh",
    title: "سيرة ذاتية لحديثي التخرج",
    description: "قالب عصري يوازن بين المهارات والتدريب العملي ليجتاز أنظمة التوظيف الآلية.",
    category: "سيرة ذاتية",
    image: "https://picsum.photos/seed/ibtikar-cv-2/900/1200",
  },
  {
    id: "deck-startup",
    title: "عرض تقديمي لشركة ناشئة",
    description: "عرض استثماري من 14 شريحة بسرد متدرّج ورسوم بيانية واضحة.",
    category: "عروض تقديمية",
    image: "https://picsum.photos/seed/ibtikar-deck-1/1200/800",
  },
  {
    id: "deck-training",
    title: "حزمة عرض تدريبي",
    description: "تصميم موحّد لبرنامج تدريبي مع أيقونات وشرائح تفاعلية للطباعة والعرض.",
    category: "عروض تقديمية",
    image: "https://picsum.photos/seed/ibtikar-deck-2/1200/800",
  },
  {
    id: "brand-kit",
    title: "كليشة وهوية مطبوعات",
    description: "ترويسة ومغلف وبطاقة أعمال بهوية بصرية متناسقة جاهزة للطباعة.",
    category: "تصاميم",
    image: "https://picsum.photos/seed/ibtikar-brand/1200/900",
  },
  {
    id: "social-set",
    title: "مجموعة منشورات تسويقية",
    description: "قوالب منشورات لمنصات التواصل مع صياغة إعلانية قصيرة ومؤثرة.",
    category: "تصاميم",
    image: "https://picsum.photos/seed/ibtikar-social/1200/900",
  },
  {
    id: "ebook",
    title: "كتاب إلكتروني منسّق",
    description: "تنسيق كتاب من 120 صفحة مع فهرس تلقائي وتصميم أغلفة داخلية.",
    category: "مستندات وكتب",
    image: "https://picsum.photos/seed/ibtikar-book/900/1200",
  },
  {
    id: "contract",
    title: "صياغة عقد رسمي",
    description: "مستند قانوني مُصاغ بلغة دقيقة وتنسيق رسمي جاهز للتوقيع.",
    category: "مستندات وكتب",
    image: "https://picsum.photos/seed/ibtikar-contract/1200/900",
  },
  {
    id: "excel",
    title: "لوحة متابعة على إكسل",
    description: "جداول مترابطة ومعادلات ومؤشرات أداء بصرية لمتابعة المبيعات.",
    category: "جداول وتقارير",
    image: "https://picsum.photos/seed/ibtikar-excel/1200/800",
  },
];
