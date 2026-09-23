import { Link } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="surface-navy mt-24">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-3">
        <div>
          <h3 className="text-xl">
            ابتكار<span className="text-gold">.</span>
          </h3>
          <p className="mt-3 max-w-xs text-sm leading-relaxed opacity-80">
            استوديو مكتبي متخصص في صناعة الملفات الاحترافية: سير ذاتية، عروض تقديمية، مستندات
            وتصاميم — بخبرة تتجاوز سبع سنوات وخدمة أونلاين لكل مناطق المملكة.
          </p>
        </div>

        <div>
          <h4 className="text-base">روابط</h4>
          <div className="mt-3 flex flex-col gap-2 text-sm opacity-80">
            <Link to="/about">من نحن</Link>
            <Link to="/services">الخدمات</Link>
            <Link to="/portfolio">أعمالنا</Link>
            <a href="https://wa.me/966538396424" target="_blank" rel="noopener">تواصل معنا</a>
          </div>
        </div>

        <div>
          <h4 className="text-base">تواصل</h4>
          <div className="mt-3 flex flex-col gap-2 text-sm opacity-80">
            <a href="mailto:alercv100@gmail.com" className="flex items-center gap-2">
              <Mail className="size-4 text-gold" /> alercv100@gmail.com
            </a>
            <a href="https://wa.me/966538396424" className="flex items-center gap-2">
              <Phone className="size-4 text-gold" /> 0538396424
            </a>
            <span className="flex items-center gap-2">
              <MapPin className="size-4 text-gold" /> الطائف — مكتبة الريادة
            </span>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs opacity-60">
        © {new Date().getFullYear()} ابتكار — جميع الحقوق محفوظة.
      </div>
    </footer>
  );
}
