import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { brand } from "@/lib/site-config";
import { LogoMark } from "./Logo";

const links = [
  { to: "/", label: "الرئيسية" },
  { to: "/services", label: "الخدمات" },
  { to: "/portfolio", label: "أعمالنا" },
  { to: "/about", label: "عن الخدمة" },
] as const;

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-3">
          <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
            <LogoMark />
            {brand.name}
          </Link>
          <nav className="flex flex-wrap items-center gap-1 text-sm">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                activeOptions={{ exact: l.to === "/" }}
                className="rounded-full px-3 py-2 font-semibold text-foreground/70 hover:text-foreground [&.active]:bg-muted [&.active]:text-foreground"
              >
                {l.label}
              </Link>
            ))}
            <Link to="/" hash="request" className="btn-signal !px-4 !py-2">
              اطلب خدمة
            </Link>
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="mt-20 border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-8 text-sm text-foreground/60">
          <span className="flex items-center gap-2 font-display font-bold text-foreground">
            <LogoMark size={22} />
            {brand.name}
          </span>
          <span>{brand.tagline}</span>
        </div>
      </footer>
    </div>
  );
}

export function PlaceholderBadge() {
  return (
    <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[11px] font-semibold text-foreground/60">
      بيانات تجريبية
    </span>
  );
}
