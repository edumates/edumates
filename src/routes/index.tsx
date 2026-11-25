import { createFileRoute } from "@tanstack/react-router";

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

function Home() {
  return <div />;
}
