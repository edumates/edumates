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
 * أسئلة الاختيار من متعدد (30)
 **********************/
const mcqData = [
  // ... نفس الأسئلة السابقة (لا تغيير)
  { q: "كيف تعلن عن متغير يمكن تغييره؟", opts: ["let", "const", "var", "variable"], ans: 0 },
  { q: "ما هو الناتج: console.log(typeof null)?", opts: ["null", "object", "undefined", "string"], ans: 1 },
  { q: "أي دالة تُستخدم لطباعة في الكونسول؟", opts: ["print()", "log()", "console.log()", "write()"], ans: 2 },
  { q: "ما هو الناتج: 2 + '2'؟", opts: ["4", "22", "NaN", "Error"], ans: 1 },
  { q: "أي كلمة محجوزة لإنشاء كائن؟", opts: ["object", "new", "this", "class"], ans: 1 },
  { q: "كيف تحصل على طول المصفوفة؟", opts: [".size", ".length", ".count", ".len()"], ans: 1 },
  { q: "ما هو الناتج: Boolean('')؟", opts: ["true", "false", "undefined", "Error"], ans: 1 },
  { q: "أي عبارة تُخرج من الحلقة؟", opts: ["stop", "exit", "break", "return"], ans: 2 },
  { q: "ما الفرق بين == و ===؟", opts: ["لا فرق", "=== يقارن النوع", "== يقارن النوع", "=== أسرع"], ans: 1 },
  { q: "ما هو الناتج: [1,2,3].map(x => x * 2)؟", opts: ["[2,4,6]", "[1,4,9]", "[1,2,3]", "خطأ"], ans: 0 },
  { q: "أي دالة تُنفّذ بعد تأخير؟", opts: ["setTimeout", "setInterval", "delay()", "wait()"], ans: 0 },
  { q: "كيف تُضيف عنصرًا لنهاية المصفوفة؟", opts: [".add()", ".push()", ".append()", ".insert()"], ans: 1 },
  { q: "ما هو الناتج: parseInt('10px')؟", opts: ["10", "NaN", "10px", "Error"], ans: 0 },
  { q: "أي كلمة تُستخدم للدوال السهمية؟", opts: ["function", "=>", "arrow", "lambda"], ans: 1 },
  { q: "ما هو الناتج: !!'false'؟", opts: ["false", "true", "Error", "undefined"], ans: 1 },
  { q: "كيف تُحوّل نص إلى أرقام عشرية؟", opts: ["Number()", "parseFloat()", "toInt()", "float()"], ans: 1 },
  { q: "أي دالة تُزيل العنصر الأخير؟", opts: [".remove()", ".pop()", ".delete()", ".slice()"], ans: 1 },
  { q: "ما هو الناتج: 'abc'.toUpperCase()؟", opts: ["ABC", "abc", "Abc", "error"], ans: 0 },
  { q: "ما هو Hoisting؟", opts: ["رفع المتغيرات للأعلى", "رفع الدوال", "كلاهما", "لا شيء"], ans: 2 },
  { q: "أي دالة تُعيد Promise؟", opts: ["setTimeout", "fetch", "console.log", "alert"], ans: 1 },
  { q: "ما هو الناتج: [...'abc']؟", opts: ["['a','b','c']", "['abc']", "abc", "خطأ"], ans: 0 },
  { q: "كيف تُنشئ كائنًا باستخدام Object Literal؟", opts: ["new Object{}", "{ key: value }", "Object.create()", "class"], ans: 1 },
  { q: "ما هو Closure؟", opts: ["دالة داخل دالة تحتفظ بالمتغيرات", "دالة عالمية", "كائن", "مصفوفة"], ans: 0 },
  { q: "أي كلمة تُستخدم للوراثة؟", opts: ["extends", "inherits", "prototype", "super"], ans: 0 },
  { q: "ما هو الناتج: JSON.stringify({a:1})؟", opts: ['"a:1"', '{"a":1}', "[object Object]", "خطأ"], ans: 1 },
  { q: "ما هو الـ Event Loop؟", opts: ["آلية تنفيذ الأوامر غير المتزامنة", "حلقة for", "مصفوفة الأحداث", "دالة"], ans: 0 },
  { q: "أي كود يسبب ReferenceError؟", opts: ["console.log(x)", "let x = 1", "x = 1", "var x"], ans: 0 },
  { q: "ما هو الناتج: Promise.resolve(1).then(x => x + 1)؟", opts: ["Promise<2>", "2", "1", "خطأ"], ans: 0 },
  { q: "كيف تُمنع السلوك الافتراضي للحدث؟", opts: ["e.stop()", "e.prevent()", "e.preventDefault()", "return false"], ans: 2 },
  { q: "أي طريقة تُستخدم لتحديث الحالة في React؟", opts: ["this.state = ", "setState()", "updateState()", "change()"], ans: 1 },
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
 * المهام العملية (10) — من الصفر
 **********************/
const tasksData = [
  {
    title: "طباعة اسمك",
    desc: "اكتب دالة تُطبع اسمك في الكونسول باستخدام <code>console.log</code>",
    check: (output) => /console\.log/i.test(output.code) && output.console.includes("EDUMATES"),
    starter: "// اكتب الكود هنا...\n"
  },
  {
    title: "جمع رقمين",
    desc: "أنشئ دالة <code>add(a, b)</code> تُعيد مجموع العددين",
    check: (output) => {
      try {
        const fn = new Function('a', 'b', output.code + '; return add;');
        const add = fn();
        return typeof add === 'function' && add(2, 3) === 5 && add(0, 0) === 0;
      } catch { return false; }
    },
    starter: "// اكتب الكود هنا...\n"
  },
  {
    title: "تحقق من الرقم الزوجي",
    desc: "دالة <code>isEven(n)</code> تُعيد <code>true</code> إذا كان الرقم زوجيًا",
    check: (output) => {
      try {
        const fn = new Function('n', output.code + '; return isEven;');
        const isEven = fn();
        return typeof isEven === 'function' && isEven(4) === true && isEven(5) === false && isEven(0) === true;
      } catch { return false; }
    },
    starter: "// اكتب الكود هنا...\n"
  },
  {
    title: "تحويل مصفوفة إلى أضعاف",
    desc: "استخدم <code>.map()</code> لمضاعفة كل عنصر في [1,2,3]",
    check: (output) => {
      try {
        const res = eval(output.code);
        return Array.isArray(res) && res.join() === "2,4,6";
      } catch { return false; }
    },
    starter: "// اكتب الكود هنا...\n"
  },
  {
    title: "فلتر الأرقام الزوجية",
    desc: "استخدم <code>.filter()</code> لاستخراج الأرقام الزوجية من [1,2,3,4,5]",
    check: (output) => {
      try {
        const res = eval(output.code);
        return Array.isArray(res) && res.join() === "2,4";
      } catch { return false; }
    },
    starter: "// اكتب الكود هنا...\n"
  },
  {
    title: "عد تنازلي بـ setInterval",
    desc: "استخدم <code>setInterval</code> لطباعة الأرقام من 5 إلى 1، ثم 'انتهى'",
    check: (output) => {
      return /setInterval/i.test(output.code) && 
             /\b(5|4|3|2|1)\b/.test(output.console) && 
             /انتهى/i.test(output.console) &&
             /clearInterval/i.test(output.code);
    },
    starter: "// اكتب الكود هنا...\n"
  },
  {
    title: "إنشاء كائن شخص",
    desc: "أنشئ كائن <code>person</code> به <code>name</code> و <code>age</code> ودالة <code>greet()</code> تُعيد تحية",
    check: (output) => {
      try {
        const ctx = {};
        new Function('ctx', output.code + '; return ctx;')(ctx);
        const p = ctx.person;
        return p && 
               typeof p.name === 'string' && 
               typeof p.age === 'number' && 
               typeof p.greet === 'function' && 
               /مرحبا|hello/i.test(p.greet());
      } catch { return false; }
    },
    starter: "// اكتب الكود هنا...\n"
  },
  {
    title: "استخدام Promise",
    desc: "أنشئ <code>Promise</code> تُحل بعد ثانية بـ 'نجح'",
    check: (output) => {
      return /new Promise/i.test(output.code) && 
             /resolve/i.test(output.code) && 
             /setTimeout/i.test(output.code) &&
             /\b1000\b/.test(output.code);
    },
    starter: "// اكتب الكود هنا...\n"
  },
  {
    title: "استخدام async/await",
    desc: "اكتب دالة <code>fetchData()</code> بـ async/await تُعيد 'تم الجلب' بعد تأخير",
    check: (output) => {
      return /async.*function.*fetchData/i.test(output.code) && 
             /await/i.test(output.code) && 
             /تم الجلب/i.test(output.code);
    },
    starter: "// اكتب الكود هنا...\n"
  },
  {
    title: "إصلاح كود معطوب",
    desc: "صحح هذا الكود:<br><pre>consol.log('خطأ')\nlet x = 5\nx = 10\n</pre>",
    check: (output) => {
      try {
        const logs = [];
        const console = { log: (msg) => logs.push(msg) };
        const ctx = { console };
        new Function('console', output.code)(ctx);
        return logs.includes('مرحبا') && ctx.x === 10;
      } catch { return false; }
    },
    starter: "consol.log('خطأ')\nlet x = 5\nx = 10"
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
        <pre id="output_${idx}" style="margin-top:8px; font-size:13px; max-height:80px; overflow:auto; display:none; background:#f8f9fa; padding:8px; border-radius:8px;"></pre>
      </div>
    </div>
  `;
  tasksWrap.appendChild(card);

  const textarea = document.getElementById(`code_${idx}`);
  const editor = CodeMirror.fromTextArea(textarea, {
    mode: "javascript",
    theme: "default",
    lineNumbers: false,
    indentWithTabs: false,
    indentUnit: 2,
    matchBrackets: true,
    autoCloseBrackets: true
  });
  editors.push(editor);
});

function runTask(i) {
  const code = editors[i].getValue();
  const outputEl = document.getElementById(`output_${i}`);
  outputEl.style.display = "block";
  outputEl.textContent = "جاري التنفيذ...\n";

  const logs = [];
  const console = { log: (...args) => logs.push(args.join(" ")) };

  try {
    new Function('console', code)(console);
    outputEl.textContent = logs.length ? logs.join("\n") : "لا إخراج";
  } catch (err) {
    outputEl.textContent = `خطأ: ${err.message}`;
  }

  return { code, console: logs.join("\n") };
}

function checkTask(i) {
  const output = runTask(i);
  let ok = false;

  try {
    ok = tasksData[i].check(output);
  } catch (e) {
    ok = false;
  }

  const st = document.getElementById(`status_${i}`);
  if (ok) {
    st.innerHTML = "تم بنجاح";
    st.classList.add("ok"); st.classList.remove("bad");
  } else {
    st.innerHTML = `لم يتحقق الشرط<br><small>راجع الوصف أعلاه</small>`;
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