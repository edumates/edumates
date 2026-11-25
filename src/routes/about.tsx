import { createFileRoute } from "@tanstack/react-router";

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

function About() {
  return <div />;
}
