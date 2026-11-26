import { useState } from "react";
import {
  aiToolOptions,
  brand,
  buildRequestMessage,
  contactLink,
} from "@/lib/site-config";

type Channel = "whatsapp" | "telegram" | "email";

const channels: { id: Channel; label: string }[] = [
  { id: "whatsapp", label: "واتساب" },
  { id: "telegram", label: "تيليجرام" },
  { id: "email", label: "البريد الإلكتروني" },
];

export function RequestForm() {
  const [name, setName] = useState("");
  const [details, setDetails] = useState("");
  const [aiTool, setAiTool] = useState<string>(aiToolOptions[0] ?? "");
  const [channel, setChannel] = useState<Channel>("whatsapp");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!details.trim()) {
      setError("اكتب ما تريده أولاً.");
      return;
    }
    setError("");
    const message = buildRequestMessage({ name, details, aiTool });
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
    } catch {
      setCopied(false);
    }
    window.open(contactLink(channel, message), "_blank", "noopener");
  }

  return (
    <form
      id="request"
      onSubmit={onSubmit}
      className="mx-auto max-w-2xl rounded-[20px] border border-border bg-card p-6 shadow-soft md:p-8"
    >
      <h2 className="text-2xl md:text-3xl">اطلب خدمتك مع {brand.name}</h2>
      <p className="mt-2 text-sm text-foreground/70">
        اكتب ما تحتاجه، واختر طريقة التواصل. سيفتح التطبيق برسالة جاهزة.
      </p>

      <label className="mt-6 block text-sm font-semibold">
        الاسم (اختياري)
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 font-normal"
        />
      </label>

      <label className="mt-4 block text-sm font-semibold">
        ماذا تريد؟
        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          rows={5}
          placeholder="مثال: أحتاج سيرة ذاتية لوظيفة مدير مشاريع، مع خطاب تعريفي."
          className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 font-normal"
        />
      </label>

      <label className="mt-4 block text-sm font-semibold">
        أداة الذكاء الاصطناعي
        <select
          value={aiTool}
          onChange={(e) => setAiTool(e.target.value)}
          className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 font-normal"
        >
          {aiToolOptions.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </label>

      <fieldset className="mt-4">
        <legend className="text-sm font-semibold">قناة التواصل</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {channels.map((c) => (
            <label
              key={c.id}
              className={`cursor-pointer rounded-full border px-4 py-2 text-sm font-semibold ${
                channel === c.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background"
              }`}
            >
              <input
                type="radio"
                name="channel"
                value={c.id}
                checked={channel === c.id}
                onChange={() => setChannel(c.id)}
                className="sr-only"
              />
              {c.label}
            </label>
          ))}
        </div>
      </fieldset>

      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      <button type="submit" className="btn-signal mt-6 w-full">
        أرسل الطلب
      </button>
      {copied && (
        <p className="mt-3 text-xs text-foreground/60">
          تم نسخ نص الرسالة أيضاً، إن لم يظهر في التطبيق الصقه يدوياً.
        </p>
      )}
    </form>
  );
}
