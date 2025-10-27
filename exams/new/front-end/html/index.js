/**********************
 * تبويبات الواجهة
 **********************/
const tabs = document.querySelectorAll(".tab-btn");
const tabViews = document.querySelectorAll(".tab");
tabs.forEach(btn => {
  btn.addEventListener("click", () => {
    tabs.forEach(b => b.classList.remove("active"));
    tabViews.forEach(v => v.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");
  });
});

/**********************
 * أسئلة الاختيار من متعدد (30) — من السهل إلى الصعب
 **********************/
const mcqData = [
  // === المبتدئ (1–8) ===
  { q: "أي وسم يُستخدم لإنشاء رابط خارجي؟", opts: ["&lt;link&gt;", "&lt;a&gt;", "&lt;href&gt;"], ans: 1 },
  { q: "ما الخاصية التي تُحدد مسار الصورة؟", opts: ["alt", "src", "href"], ans: 1 },
  { q: "أي وسم يُستخدم لعنوان فرعي؟", opts: ["&lt;h1&gt;", "&lt;h3&gt;", "&lt;title&gt;"], ans: 1 },
  { q: "كم عدد مستويات العناوين في HTML؟", opts: ["4", "6", "8"], ans: 1 },
  { q: "أي وسم يُستخدم لسطر جديد؟", opts: ["&lt;br&gt;", "&lt;hr&gt;", "&lt;nl&gt;"], ans: 0 },
  { q: "ما هو الوسم الصحيح لقائمة مرتبة؟", opts: ["&lt;ul&gt;", "&lt;ol&gt;", "&lt;list&gt;"], ans: 1 },
  { q: "أي خاصية تُجعل الحقل مطلوبًا؟", opts: ["required", "must", "need"], ans: 0 },
  { q: "ما هو الامتداد الصحيح لملف HTML؟", opts: [".htm", ".html", ".web"], ans: 1 },

  // === المتوسط (9–18) ===
  { q: "اكمل: &lt;a href=&quot;about.html&quot; _____&gt;", opts: ["target=&quot;_blank&quot;", "rel=&quot;external&quot;", "open=&quot;new&quot;"], ans: 0 },
  { q: "ما الوسم الواجب إغلاقه: &lt;p&gt;مرحبا", opts: ["&lt;/div&gt;", "&lt;/p&gt;", "&lt;/body&gt;"], ans: 1 },
  { q: "&lt;img src=&quot;x.jpg&quot; alt=&quot;&quot;&gt; — ما المشكلة؟", opts: ["لا يوجد width", "alt فارغ", "src خاطئ"], ans: 1 },
  { q: "اكمل: &lt;input type=&quot;_____&quot;&gt; لحقل كلمة مرور", opts: ["text", "password", "hidden"], ans: 1 },
  { q: "أي كود يُنشئ جدولًا بـ 2 صف و 3 أعمدة؟", opts: ["&lt;tr&gt;&lt;td&gt;x3&lt;/td&gt;&lt;/tr&gt;x2", "&lt;td&gt;x6&lt;/td&gt;", "&lt;tr&gt;x3&lt;/td&gt;"], ans: 0 },
  { q: "&lt;button&gt;إرسال&lt;/button&gt; داخل &lt;form&gt; — هل يكفي؟", opts: ["نعم", "لا، يحتاج type", "يحتاج name"], ans: 1 },
  { q: "أي خاصية تُحدد عرض الصورة؟", opts: ["width", "size", "w"], ans: 0 },
  { q: "&lt;h1 style=&quot;color:red&quot;&gt; — أي لون سيظهر؟", opts: ["أحمر", "أزرق", "أخضر"], ans: 0 },
  { q: "اكمل: &lt;video _____&gt; لتشغيل تلقائي", opts: ["autoplay", "auto", "play"], ans: 0 },
  { q: "&lt;form action=&quot;save.php&quot; _____&gt; — ما الذي يُرسل البيانات؟", opts: ["method=&quot;POST&quot;", "send=&quot;true&quot;", "post"], ans: 0 },

  // === المتقدم (19–25) ===
  { q: "أي وسم دلالي لمحتوى رئيسي؟", opts: ["&lt;div&gt;", "&lt;main&gt;", "&lt;content&gt;"], ans: 1 },
  { q: "&lt;em&gt;مهم&lt;/em&gt; يُظهر النص:", opts: ["مائل دلاليًا", "عريض", "ملون"], ans: 0 },
  { q: "&lt;mark&gt;نص&lt;/mark&gt; يُظهر:", opts: ["خلفية صفراء", "خط تحت", "مائل"], ans: 0 },
  { q: "أي وسم لعرض كود برمجي؟", opts: ["&lt;pre&gt;", "&lt;code&gt;", "&lt;script&gt;"], ans: 1 },
  { q: "&lt;abbr title=&quot;HTML&quot;&gt;H&lt;/abbr&gt; — ماذا يحدث عند التمرير؟", opts: ["يظهر Tooltip", "يتغير اللون", "لا شيء"], ans: 0 },
  { q: "&lt;blockquote&gt;اقتباس&lt;/blockquote&gt; — أي مخرج؟", opts: ["مسافة بادئة", "خط عمودي", "نص مائل"], ans: 0 },
  { q: "&lt;sup&gt;2&lt;/sup&gt; في x<sup>2</sup> — أين يظهر الـ 2؟", opts: ["أعلى يمين", "أسفل يسار", "نفس السطر"], ans: 0 },

  // === المحترف (26–30) ===
  { q: "أي كود خاطئ دلاليًا؟", opts: ["&lt;b&gt;عريض&lt;/b&gt;", "&lt;strong&gt;مهم&lt;/strong&gt;", "&lt;i&gt;مائل&lt;/i&gt;"], ans: 2 },
  { q: "ما المشكلة في: &lt;img src=&quot;img.jpg&quot;&gt;", opts: ["لا alt", "لا width", "كلاهما"], ans: 2 },
  { q: "أي هيكل غير صحيح؟", opts: ["&lt;ul&gt;&lt;li&gt;&lt;ul&gt;&lt;li&gt;&lt;/li&gt;&lt;/ul&gt;&lt;/li&gt;&lt;/ul&gt;", "&lt;ol&gt;&lt;li&gt;1&lt;/li&gt;&lt;/ol&gt;", "&lt;table&gt;&lt;tr&gt;&lt;td&gt;&lt;/td&gt;&lt;/tr&gt;&lt;/table&gt;"], ans: 0 },
  { q: "لماذا نستخدم lang=&quot;ar&quot; في &lt;html&gt;؟", opts: ["تحسين SEO", "دعم القارئ الآلي", "كلاهما"], ans: 2 },
  { q: "أي كود يسبب مشكلة إتاحة (Accessibility)؟", opts: ["&lt;button onclick=&quot;f()&quot;&gt;", "&lt;div role=&quot;button&quot; tabindex=&quot;0&quot;&gt;", "&lt;a href=&quot;#&quot;&gt;"], ans: 2 },
];

const mcqForm = document.getElementById("mcq-form");
mcqData.forEach((item, idx) => {
  const qBox = document.createElement("div");
  qBox.className = "q";
  qBox.innerHTML = `<h4>${idx + 1}- ${item.q}</h4>`;
  item.opts.forEach((opt, i) => {
    const id = `q${idx + 1}_o${i}`;
    const label = document.createElement("label");
    label.setAttribute("for", id);
    label.innerHTML = `<input type="radio" name="q${idx + 1}" id="${id}" value="${i}"> ${opt}`;
    qBox.appendChild(label);
  });
  mcqForm.appendChild(qBox);
});

let mcqScore = 0;
document.getElementById("save-mcq").addEventListener("click", () => {
  let score = 0;
  mcqData.forEach((item, idx) => {
    const opts = document.querySelectorAll(`input[name="q${idx + 1}"]`);
    opts.forEach(opt => {
      const label = opt.parentElement;
      label.style.background = "";
      label.style.color = "";
      if (opt.checked) {
        if (Number(opt.value) === item.ans) {
          score++;
          label.style.background = "#d1fae5";
          label.style.color = "#15803d";
        } else {
          label.style.background = "#fee2e2";
          label.style.color = "#b91c1c";
        }
      }
    });
  });
  mcqScore = score;
  document.getElementById("mcq-score").textContent = `تم الحفظ: ${score} / 30`;
});

/**********************
 * المهام العملية (10) — من السهل إلى الصعب
 **********************/
const tasksData = [
  {
    title: "عنوان رئيسي",
    desc: "أنشئ عنوانًا رئيسيًا &lt;h1&gt; يحتوي النص: <strong>EDUMATES</strong>",
    check: doc => {
      const h1 = doc.querySelector("h1");
      return !!(h1 && h1.textContent.trim() === "EDUMATES");
    },
    starter: ""
  },
  {
    title: "رابط خارجي مفتوح في نافذة جديدة",
    desc: "رابط إلى <code>https://example.com</code>، نص: <strong>زيارة</strong>، <code>target=&quot;_blank&quot;</code>",
    check: doc => {
      const a = Array.from(doc.querySelectorAll("a")).find(x => x.textContent.trim() === "زيارة");
      return !!(a && a.getAttribute("href") === "https://example.com" && a.getAttribute("target") === "_blank");
    },
    starter: ""
  },
  {
    title: "صورة مع وصف إتاحة",
    desc: "أدرج صورة <code>src=&quot;img/cat.jpg&quot;</code> و<code>alt</code> يحتوي كلمة <strong>قطة</strong>",
    check: doc => {
      const img = doc.querySelector("img[src='img/cat.jpg']");
      return !!(img && img.hasAttribute("alt") && img.getAttribute("alt").includes("قطة"));
    },
    starter: ""
  },
  {
    title: "قائمة غير مرتبة بـ 4 عناصر",
    desc: "أنشئ &lt;ul&gt; بها <strong>4 عناصر &lt;li&gt; على الأقل</strong>",
    check: doc => {
      const ul = doc.querySelector("ul");
      return !!(ul && ul.querySelectorAll("li").length >= 4);
    },
    starter: ""
  },
  {
    title: "جدول بيانات (3×2)",
    desc: "جدول بـ <strong>3 صفوف</strong>، وكل صف به <strong>خليتين &lt;td&gt;</strong>",
    check: doc => {
      const table = doc.querySelector("table");
      if (!table) return false;
      const rows = table.querySelectorAll("tr");
      return rows.length >= 3 && Array.from(rows).every(r => r.querySelectorAll("td").length >= 2);
    },
    starter: ""
  },
  {
    title: "نموذج تسجيل دخول",
    desc: "نموذج به: <code>email</code> (required)، <code>password</code>، زر <code>type=&quot;submit&quot;</code>",
    check: doc => {
      const form = doc.querySelector("form");
      if (!form) return false;
      const email = form.querySelector("input[type='email'][required]");
      const pass = form.querySelector("input[type='password']");
      const btn = form.querySelector("button[type='submit'], input[type='submit']");
      return !!(email && pass && btn);
    },
    starter: ""
  },
  {
    title: "بطاقة مع فئة ومعرف",
    desc: "&lt;div&gt; بـ <code>class=&quot;card&quot;</code> و <code>id=&quot;intro&quot;</code> ونص داخلي",
    check: doc => {
      const d = doc.querySelector("div.card#intro");
      return !!(d && d.textContent.trim().length > 0);
    },
    starter: ""
  },
  {
    title: "فيديو مع تحكم وملصق",
    desc: "&lt;video controls poster=&quot;thumb.jpg&quot;&gt; + مصدر <code>video/mp4</code>",
    check: doc => {
      const v = doc.querySelector("video[controls][poster]");
      if (!v) return false;
      const s = v.querySelector("source[src][type='video/mp4']");
      return !!s;
    },
    starter: ""
  },
  {
    title: "هيكل دلالي كامل",
    desc: "استخدم: <code>header, nav, main, article, section, footer</code> جميعها",
    check: doc => {
      return ["header","nav","main","article","section","footer"].every(sel => !!doc.querySelector(sel));
    },
    starter: ""
  },
  {
    title: "تصحيح كود معيب",
    desc: `صحّح هذا الكود:<br><pre>&lt;img src="logo.png"&gt;<br>&lt;a href="contact"&gt;اتصل&lt;/a&gt;<br>&lt;h7&gt;عنوان&lt;/h7&gt;</pre>`,
    check: doc => {
      const img = doc.querySelector("img[src='logo.png']");
      const a = doc.querySelector("a[href='contact']");
      const h = doc.querySelector("h1, h2, h3, h4, h5, h6");
      return !!(img && img.hasAttribute("alt") && img.getAttribute("alt").trim() && 
                a && a.getAttribute("href").startsWith("http") && 
                h && h.textContent.trim() === "عنوان");
    },
    starter: `<img src="logo.png">\n<a href="contact">اتصل</a>\n<h7>عنوان</h7>`
  },
];

const tasksWrap = document.getElementById("tasks");
const editors = [];
tasksData.forEach((t, idx) => {
  const card = document.createElement("div");
  card.className = "task card";
  card.innerHTML = `
    <header>
      <h4>${idx + 1}- ${t.title}</h4>
      <p class="hint">${t.desc}</p>
    </header>
    <div class="body">
      <div>
        <textarea class="code" id="code_${idx}">${t.starter}</textarea>
        <div class="actions-row" style="margin-top:8px">
          <button class="btn" data-action="run" data-i="${idx}">تشغيل</button>
          <button class="btn" data-action="check" data-i="${idx}">تحقق</button>
          <span id="status_${idx}" class="status">بانتظار التحقق…</span>
        </div>
      </div>
      <div>
        <div class="iframe-wrap">
          <iframe id="prev_${idx}" style="width:100%; height:220px; border:0"></iframe>
        </div>
      </div>
    </div>
  `;
  tasksWrap.appendChild(card);

  const textarea = document.getElementById(`code_${idx}`);
  const editor = CodeMirror.fromTextArea(textarea, {
    mode: "htmlmixed",
    theme: "default",
    lineNumbers: false,
    indentWithTabs: true,
    indentUnit: 2,
    matchBrackets: true,
    autoCloseTags: true
  });
  editors.push(editor);
});

function parseHTMLtoDoc(html) {
  const parser = new DOMParser();
  return parser.parseFromString(`<body>${html}</body>`, "text/html");
}

function runTask(i) {
  const code = editors[i].getValue();
  const iframe = document.getElementById(`prev_${i}`);
  iframe.srcdoc = `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"></head><body>${code}</body></html>`;
}

function checkTask(i) {
  const code = editors[i].getValue();
  const doc = parseHTMLtoDoc(code);
  let ok = false;
  try { ok = tasksData[i].check(doc); } catch (e) { ok = false; }
  const st = document.getElementById(`status_${i}`);
  if (ok) {
    st.innerHTML = "تم بنجاح";
    st.classList.add("ok"); st.classList.remove("bad");
  } else {
    st.innerHTML = `✘ لم يتحقق الشرط<br><small>تلميح: راجع الوصف أعلاه</small>`;
    st.classList.add("bad"); st.classList.remove("ok");
  }
  return ok;
}

tasksWrap.addEventListener("click", e => {
  const btn = e.target.closest("button.btn");
  if (!btn) return;
  const i = Number(btn.dataset.i);
  const action = btn.dataset.action;
  if (action === "run") runTask(i);
  if (action === "check") checkTask(i);
});

let practicalScore = 0;
document.getElementById("save-practical").addEventListener("click", () => {
  let score = 0;
  for (let i = 0; i < tasksData.length; i++) {
    if (checkTask(i)) score++;
  }
  practicalScore = score;
  document.getElementById("practical-score").textContent = `تم الحفظ: ${score} / 10`;
});

/**********************
 * النتيجة النهائية
 **********************/
function levelOf(total) {
  if (total <= 15) return "مبتدئ";
  if (total <= 26) return "جيد";
  if (total <= 35) return "ممتاز";
  return "محترف";
}

document.getElementById("calc-final").addEventListener("click", () => {
  document.getElementById("res-mcq").textContent = mcqScore;
  document.getElementById("res-practical").textContent = practicalScore;
  const total = mcqScore + practicalScore;
  document.getElementById("res-total").textContent = total;
  document.getElementById("res-level").textContent = levelOf(total);
});