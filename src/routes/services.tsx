import { createFileRoute } from "@tanstack/react-router";

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
  return <div />;
}
