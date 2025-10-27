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
 * أسئلة الاختيار من متعدد (30) – CSS
 **********************/
const mcqData = [
  // === المبتدئ (1–8) ===
  { q: "أي خاصية تُحدد لون النص؟", opts: ["color", "font-color", "text-color"], ans: 0 },
  { q: "أي خاصية تُحدد حجم الخط؟", opts: ["font-size", "text-size", "size"], ans: 0 },
  { q: "ما الوحدة النسبية المستخدمة في التصميم المتجاوب؟", opts: ["px", "rem", "pt"], ans: 1 },
  { q: "أي خاصية تُضيف مسافة داخلية؟", opts: ["margin", "padding", "space"], ans: 1 },
  { q: "أي خاصية تُحدد لون الخلفية؟", opts: ["bg", "background-color", "color"], ans: 1 },
  { q: "أي قيمة لـ `display` تُخفي العنصر؟", opts: ["none", "hidden", "invisible"], ans: 0 },
  { q: "أي خاصية تُحدد نوع الخط؟", opts: ["font-family", "font-type", "text-font"], ans: 0 },
  { q: "كيف تُكتب التعليقات في CSS؟", opts: ["//", "<!-- -->", "/* */"], ans: 2 },

  // === المتوسط (9–18) ===
  { q: "اكمل: `p { _____ : center; }`", opts: ["align", "text-align", "justify"], ans: 1 },
  { q: "Adolescent: ما هو المُحدد الأكثر تحديدًا؟", opts: ["p", ".para", "#id"], ans: 2 },
  { q: "أي خاصية تُحدد ارتفاع العنصر؟", opts: ["height", "size", "h"], ans: 0 },
  { q: "اكمل: `img { width: _____; }` لجعل الصورة متجاوبة", opts: ["100%", "auto", "full"], ans: 0 },
  { q: "أي خاصية تُضيف ظلًا للنص؟", opts: ["text-shadow", "shadow", "box-shadow"], ans: 0 },
  { q: "ما هو `box-sizing: border-box`؟", opts: ["يضيف الحدود للعرض", "يُحسب الحدود داخل العرض", "يُزيل الحدود"], ans: 1 },
  { q: "أي خاصية تُحدد شكل المؤشر؟", opts: ["pointer", "cursor", "hover"], ans: 1 },
  { q: "اكمل: `a:hover { _____ }`", opts: ["color: blue;", "onclick", "onhover"], ans: 0 },
  { q: "أي خاصية تُحدد انتقالًا سلسًا؟", opts: ["animation", "transition", "transform"], ans: 1 },
  { q: "ما هو `position: absolute`؟", opts: ["يخرج من التدفق", "يتبع الأب", "ثابت في الشاشة"], ans: 0 },

  // === المتقدم (19–25) ===
  { q: "أي مُحدد يختار العنصر الأول من نوعه؟", opts: [":first", ":first-child", ":nth-child(1)"], ans: 1 },
  { q: "ما هو `flex`؟", opts: ["نظام تخطيط", "خاصية عرض", "وحدة قياس"], ans: 0 },
  { q: "اكمل: `display: grid;` ثم `grid-template-columns: _____`", opts: ["1fr 1fr", "50% 50%", "كلاهما"], ans: 2 },
  { q: "أي خاصية تُحدد ترتيب العناصر في Flex؟", opts: ["order", "z-index", "flex-order"], ans: 0 },
  { q: "ما هو `calc(100% - 20px)`؟", opts: ["حساب ديناميكي", "دالة جافاسكربت", "خطأ"], ans: 0 },
  { q: "أي مُحدد يختار عنصرًا عند التمرير فوقه؟",  opts: [":hover", ":focus", ":active"], ans: 0 },
  { q: "ما هو `@media`؟", opts: ["استعلام إعلامي", "وظيفة جافا", "مُحدد"], ans: 0 },

  // === المحترف (26–30) ===
  { q: "أي خاصية تُستخدم للـ Custom Properties؟", opts: ["--var", "$var", "@var"], ans: 0 },
  { q: "ما هو `contain: paint`؟", opts: ["تحسين أداء", "تلوين", "إخفاء"], ans: 0 },
  { q: "أي مُحدد يختار العنصر الذي يسبقه مباشرة؟", opts: ["~", "+", ">" ], ans: 1 },
  { q: "لماذا نستخدم `will-change`؟", opts: ["تحسين الأداء", "تغيير الشكل", "إخفاء"], ans: 0 },
  { q: "أي خاصية تُنشئ تدرج لوني؟", opts: ["gradient", "linear-gradient", "color-gradient"], ans: 1 },
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
      if (opt.checked && Number(opt.value) === item.ans) {
        score++;
        label.style.background = "#d1fae5";
        label.style.color = "#15803d";
      } else if (opt.checked) {
        label.style.background = "#fee2e2";
        label.style.color = "#b91c1c";
      }
    });
  });
  mcqScore = score;
  document.getElementById("mcq-score").textContent = `تم الحفظ: ${score} / 30`;
});

/**********************
 * المهام العملية (10) – CSS
 **********************/
const tasksData = [
  {
    title: "لون خلفية",
    desc: "اجعل خلفية العنصر <strong>زرقاء فاتحة</strong>",
    html: `<div class="box">مربع</div>`,
    check: doc => {
      const el = doc.querySelector(".box") || doc.body;
      return getComputedStyle(el).backgroundColor.includes("173, 216, 230");
    }
  },
  {
    title: "حجم خط",
    desc: "اجعل حجم الخط في <code>.text</code> <strong>20px</strong>",
    html: `<p class="text">نص تجريبي</p>`,
    check: doc => getComputedStyle(doc.querySelector(".text")).fontSize === "20px"
  },
  {
    title: "توسيط أفقي",
    desc: "مركز النص أفقيًا باستخدام <code>text-align</code>",
    html: `<div class="center">مركز</div>`,
    check: doc => getComputedStyle(doc.querySelector(".center")).textAlign === "center"
  },
  {
    title: "مربع متجاوب",
    desc: "اجعل <code>.box</code> بعرض <strong>100%</strong> وبارتفاع <strong>200px</strong>",
    html: `<div class="box">مربع</div>`,
    check: doc => {
      const b = doc.querySelector(".box");
      const s = getComputedStyle(b);
      return s.width === "100%" && s.height === "200px";
    }
  },
  {
    title: "تأثير عند التمرير",
    desc: "غيّر لون <code>.btn</code> إلى <strong>أحمر</strong> عند الـ <code>:hover</code>",
    html: `<button class="btn">زر</button>`,
    check: doc => {
      const rules = Array.from(doc.styleSheets).flatMap(s => Array.from(s.cssRules));
      const rule = rules.find(r => r.selectorText === ".btn:hover");
      return rule && rule.style.color === "red";
    }
  },
  {
    title: "Flexbox – توسيط كامل",
    desc: "مركز <code>.child</code> أفقيًا وعموديًا داخل <code>.parent</code>",
    html: `<div class="parent"><div class="child">مركز</div></div>`,
    check: doc => {
      const p = getComputedStyle(doc.querySelector(".parent"));
      return p.display === "flex" && 
             p.justifyContent.includes("center") && 
             p.alignItems.includes("center");
    }
  },
  {
    title: "Grid – 3 أعمدة",
    desc: "استخدم <code>display: grid</code> لإنشاء <strong>3 أعمدة متساوية</strong>",
    html: `<div class="grid"><div>1</div><div>2</div><div>3</div></div>`,
    check: doc => {
      const g = getComputedStyle(doc.querySelector(".grid"));
      return g.display === "grid" && g.gridTemplateColumns.includes("1fr");
    }
  },
  {
    title: "انتقال سلس",
    desc: "أضف انتقالًا سلسًا للـ <code>background-color</code> مدته <strong>0.5s</strong>",
    html: `<div class="trans">حرك المؤشر</div>`,
    check: doc => {
      const t = getComputedStyle(doc.querySelector(".trans"));
      return t.transition && t.transition.includes("background-color") && t.transition.includes("0.5s");
    }
  },
  {
    title: "متغيرات CSS",
    desc: "استخدم <code>--main-color: #3498db;</code> وطبّقه على <code>.box</code>",
    html: `<div class="box">مربع</div>`,
    check: doc => {
      const root = doc.documentElement;
      const box = doc.querySelector(".box");
      return getComputedStyle(root).getPropertyValue("--main-color").trim() === "#3498db" &&
             getComputedStyle(box).backgroundColor.includes("52, 152, 219");
    }
  },
  {
    title: "تصميم بطاقة كاملة",
    desc: "صمم بطاقة بـ: ظل، حواف مستديرة، انتقال عند الـ hover، توسيط",
    html: `<div class="card">بطاقة</div>`,
    check: doc => {
      const c = getComputedStyle(doc.querySelector(".card"));
      return c.boxShadow && 
             c.borderRadius && 
             c.transition && 
             c.textAlign === "center";
    }
  },
];

/**********************
 * دوال مساعدة
 **********************/
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function getSelector(html) {
  const match = html.match(/class=["']([^"']+)["']/);
  return match ? `.${match[1]}` : "body";
}

/**********************
 * بناء المهام العملية
 **********************/
const tasksWrap = document.getElementById("tasks");
const editors = [];

tasksData.forEach((t, idx) => {
  const card = document.createElement("div");
  card.className = "task card";
  card.innerHTML = `
    <header>
      <h4>${idx + 1}- ${t.title}</h4>
      <p class="hint">${t.desc}</p>
      <pre class="html-preview">${escapeHtml(t.html)}</pre>
    </header>
    <div class="body">
      <div>
        <textarea class="code" id="code_${idx}"></textarea>
        <div class="actions-row" style="margin-top:8px">
          <button class="btn" data-action="run" data-i="${idx}">تشغيل</button>
          <button class="btn" data-action="check" data-i="${idx}">تحقق</button>
          <span id="status_${idx}" class="status">بانتظار التحقق…</span>
        </div>
      </div>
      <div class="iframe-wrap">
        <iframe id="prev_${idx}" style="width:100%; height:260px; border:0"></iframe>
      </div>
    </div>
  `;
  tasksWrap.appendChild(card);

  const textarea = document.getElementById(`code_${idx}`);
  const editor = CodeMirror.fromTextArea(textarea, {
    mode: "css",
    theme: "default",
    lineNumbers: false,
    indentWithTabs: true,
    indentUnit: 2
  });
  editors.push(editor);
});

/**********************
 * تشغيل وتحقق
 **********************/
function runTask(i) {
  const css = editors[i].getValue();
  const html = tasksData[i].html;
  const iframe = document.getElementById(`prev_${i}`);
  iframe.srcdoc = `
    <!doctype html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="utf-8">
      <style>${css}</style>
    </head>
    <body style="margin:0; padding:20px; font-family: sans-serif;">
      ${html}
    </body>
    </html>`;
}

function checkTask(i) {
  const iframe = document.getElementById(`prev_${i}`).contentDocument;
  let ok = false;
  try { ok = tasksData[i].check(iframe); } catch (e) { ok = false; }
  const st = document.getElementById(`status_${i}`);
  const selector = getSelector(tasksData[i].html);
  
  if (ok) {
    st.innerHTML = "تم بنجاح";
    st.classList.add("ok"); st.classList.remove("bad");
  } else {
    st.innerHTML = `فشل<br><small>تلميح: تأكد من استخدام <code>${selector}</code></small>`;
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
  return "محترف CSS";
}

document.getElementById("calc-final").addEventListener("click", () => {
  document.getElementById("res-mcq").textContent = mcqScore;
  document.getElementById("res-practical").textContent = practicalScore;
  const total = mcqScore + practicalScore;
  document.getElementById("res-total").textContent = total;
  document.getElementById("res-level").textContent = levelOf(total);
});