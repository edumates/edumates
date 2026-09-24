/**
 * معرض الأعمال.
 * استبدل قيمة images بروابط صورك الحقيقية، وعدّل العنوان والوصف والتصنيف.
 * يمكنك إضافة أي عدد من العناصر بنفس الشكل.
 * يدعم عدة صور لكل عمل مع إمكانية التبديل بينها.
 */
export type PortfolioItem = {
  id: string;
  title: string;
  description: string;
  category: string;
  /** صورة رئيسية (للتوافق مع الكود القديم) أو استخدم images */
  image?: string;
  /** مصفوفة الصور للتبديل بينها في نفس العمل */
  images: string[];
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
    id: "cv-executive-secretary",
    title: "سيرة ذاتية لسكرتير تنفيذي",
    description:
      "سيرة ذاتية رسمية مفصلة لسكرتير تنفيذي وإدارة مكتب، تشمل الملخص المهني والمهارات والخبرات العملية والمؤهلات العلمية بصياغة احترافية وتنسيق واضح.",
    category: "سيرة ذاتية",
    images: [
      "/pics/executive-secretary-cv-arabic-formal.jpg",
    ],
  },
  {
    id: "cv-ali-abdalkareem",
    title: "سيرة ذاتية حديثة (عربي وإنجليزي)",
    description:
      "تصميم سيرة ذاتية عصرية لعلي عبدالكريم بنسختين عربية وإنجليزية، مع أيقونات ملونة وتخطيط مرئي يبرز الخبرات والدورات والمهارات واللغات.",
    category: "سيرة ذاتية",
    images: [
      "/pics/ali-abdalkareem-modern-cv-arabic.jpg",
      "/pics/ali-abdalkareem-modern-cv-english.jpg",
    ],
  },
  {
    id: "deck-abc-network",
    title: "عرض تقديمي لشبكة ABC التجارية",
    description:
      "عرض استثماري وتسويقي متكامل لشركة B2B يتضمن أغلفة، أجندة، نبذة عن الشركة، الرؤية والرسالة، الجوائز، الممثلين، وعملية المبيعات الاستراتيجية مع رسوم بيانية وتصميم ذهبي احترافي.",
    category: "عروض تقديمية",
    images: [
      "/pics/abc-network-presentation-covers-and-agenda.jpg",
      "/pics/abc-network-presentation-about-facts-history.jpg",
      "/pics/abc-network-presentation-overview-vision-mission.jpg",
      "/pics/abc-network-presentation-awards-representatives.jpg",
      "/pics/abc-network-presentation-sales-marketing-strategy.jpg",
      "/pics/abc-network-presentation-b2b-sales-process.jpg",
    ],
  },
  {
    id: "deck-outer-space",
    title: "عرض تعليمي عن الفضاء الخارجي",
    description:
      "حزمة شرائح تعليمية ملونة عن الفضاء الخارجي موجهة للطلاب والمعلمين، تتضمن فهرس المحتويات ودروس متعددة بتصميم فلكي جذاب مع كواكب ومركبات فضائية.",
    category: "عروض تقديمية",
    images: [
      "/pics/outer-space-educational-presentation-1.jpg",
      "/pics/outer-space-educational-presentation-2.jpg",
    ],
  },
  {
    id: "deck-education-school",
    title: "عرض رسوم تعليمية مدرسية",
    description:
      "شرائح رسوم فيكتور احترافية باللغة العربية عن التعليم والعودة إلى المدرسة، مع حافلة مدرسية ورسوم توضيحية متحركة وإحصائيات مرئية.",
    category: "عروض تقديمية",
    images: [
      "/pics/education-school-illustrations-presentation.jpg",
    ],
  },
  {
    id: "deck-world-maps",
    title: "عرض خرائط العالم والأعمال",
    description:
      "شرائح احترافية تتضمن خريطة العالم وخريطة الولايات المتحدة وخريطة الصين مع رسوم بيانية ومؤشرات أداء مناسبة للعروض التجارية والاستراتيجية.",
    category: "عروض تقديمية",
    images: [
      "/pics/world-maps-business-presentation.jpg",
    ],
  },
  {
    id: "design-infographics",
    title: "قوالب إنفوجرافيك أعمال",
    description:
      "مجموعة قوالب إنفوجرافيك جاهزة باللونين الأزرق والبنفسجي: أشكال ماسية وسداسية ومسارات مرقمة ودورات عمليات، مثالية للعروض التقديمية والتقارير.",
    category: "تصاميم",
    images: [
      "/pics/business-infographic-templates-set-1.jpg",
      "/pics/business-infographic-templates-set-2.jpg",
      "/pics/business-infographic-templates-set-3.jpg",
      "/pics/business-infographic-templates-set-4.jpg",
    ],
  },
  {
    id: "design-azb-water-ad",
    title: "إعلان توصيل مياه عذب",
    description:
      "تصميم إعلاني جذاب لشركة عذب للمياه والمشروبات يعرض عبوات المياه وخدمة التوصيل للمساجد والمدارس والمنازل والمكاتب مع هوية بصرية منعشة.",
    category: "تصاميم",
    images: [
      "/pics/azb-water-delivery-advertisement.jpg",
    ],
  },
  {
    id: "design-tea-menu",
    title: "قائمة أسعار الشاي",
    description:
      "قائمة أسعار أنيقة لمشروبات الشاي بأنواعه (شرقي، كلاسيك، طايفي، مغربي، عدني وغيرها) مع أسعار الورق والقزاز والترموس وتصميم تراثي دافئ.",
    category: "تصاميم",
    images: [
      "/pics/tea-menu-price-list.jpg",
    ],
  },
  {
    id: "design-sweets-menu",
    title: "قائمة الحلى والخفافيف",
    description:
      "قائمة مصورة للحلى والحلويات الخفيفة تشمل البسبوسة والباستري والتمر والكرواسون والفصفص بأسعار واضحة وتصميم شهي وجذاب.",
    category: "تصاميم",
    images: [
      "/pics/sweets-and-snacks-menu.jpg",
    ],
  },
  {
    id: "design-barber-letterhead",
    title: "ترويسة صالون حلاقة النخبة",
    description:
      "ترويسة رسمية لمؤسسة حلاق النخبة الثاني للحلاقة الرجالية بهوية خضراء وأسود، مع شعار احترافي ومساحة للصورة ومعلومات التواصل.",
    category: "تصاميم",
    images: [
      "/pics/elite-barber-shop-letterhead.jpg",
    ],
  },
  {
    id: "design-saudi-founding-day",
    title: "بطاقات يوم التأسيس للطلاب",
    description:
      "مجموعة بطاقات تهنئة ليوم التأسيس السعودي موجهة للطلاب المبدعين، بعبارات تحفيزية وتصميم تراثي يضم نخيل وجمل وكتاب وشعار يوم التأسيس.",
    category: "تصاميم",
    images: [
      "/pics/saudi-founding-day-student-cards.jpg",
    ],
  },
];
