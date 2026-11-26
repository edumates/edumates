import type { Work } from "@/lib/site-config";
import { PLACEHOLDER_DATA } from "@/lib/site-config";
import { PlaceholderBadge } from "./SiteLayout";

export function WorkCard({ work }: { work: Work }) {
  return (
    <article className="flex flex-col rounded-[20px] border border-border bg-card p-5">
      <div className="flex items-center justify-between gap-2 text-xs font-semibold text-foreground/60">
        <span>{work.category}</span>
        {PLACEHOLDER_DATA && <PlaceholderBadge />}
      </div>
      <h3 className="mt-3 text-lg">{work.title}</h3>
      <p className="mt-1 text-sm text-foreground/70">{work.note}</p>
      <div className="mt-4 space-y-2 text-sm">
        <div className="flex items-start gap-2">
          <span className="mt-1 inline-block size-3 shrink-0 bg-primary" aria-hidden="true" />
          <span>
            <span className="font-semibold">الأداة: </span>
            {work.aiTool}
          </span>
        </div>
        <div className="flex items-start gap-2">
          <span className="mt-1 inline-block size-3 shrink-0 rounded-full bg-accent" aria-hidden="true" />
          <span>
            <span className="font-semibold">أدوات المراجعة: </span>
            {work.reviewTools.join("، ")}
          </span>
        </div>
      </div>
      <div className="mt-4 inline-flex items-center gap-2 self-start rounded-full bg-verified/15 px-3 py-1 text-xs font-bold text-verified-ink">
        <span aria-hidden="true">✓</span> تمت المراجعة · {work.reviewer}
      </div>
    </article>
  );
}
