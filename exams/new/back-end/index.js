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
  // مبتدئ
  { q: "كيف تعلن عن متغير في Python؟", opts: ["let x = 5", "x = 5", "var x = 5", "int x = 5"], ans: 1 },
  { q: "ما هو الناتج: print(type(3.14))؟", opts: ["<class 'int'>", "<class 'float'>", "<class 'str'>", "<class 'num'>"], ans: 1 },
  { q: "أي بنية تُستخدم للحلقات؟", opts: ["loop", "for", "repeat", "iterate"], ans: 1 },
  { q: "ما هو الناتج: 2 ** 3؟", opts: ["6", "8", "9", "خطأ"], ans: 1 },
  { q: "كيف تُعلق سطرًا؟", opts: ["// تعليق", "# تعليق", "<!-- تعليق -->", "/* تعليق */"], ans: 1 },
  { q: "أي دالة تُدخل من المستخدم؟", opts: ["read()", "input()", "scan()", "get()"], ans: 1 },
  { q: "ما هو الناتج: len('hello')؟", opts: ["4", "5", "6", "خطأ"], ans: 1 },
  { q: "أي كلمة للشرط؟", opts: ["when", "if", "case", "check"], ans: 1 },

  // متوسط
  { q: "ما هو الناتج: [1,2,3] + [4]؟", opts: ["[1,2,3,4]", "[5]", "[1,2,3][4]", "خطأ"], ans: 0 },
  { q: "كيف تُضيف عنصرًا للقائمة؟", opts: [".add()", ".push()", ".append()", ".insert()"], ans: 2 },
  { q: "ما هو الناتج: 'abc'.upper()؟", opts: ["ABC", "abc", "Abc", "خطأ"], ans: 0 },
  { q: "أي دالة تُحوّل إلى عدد صحيح؟", opts: ["float()", "int()", "str()", "num()"], ans: 1 },
  { q: "كيف تُنشئ دالة؟", opts: ["function f()", "def f():", "func f():", "lambda f()"], ans: 1 },
  { q: "ما هو الناتج: range(3)؟", opts: ["[0,1,2,3]", "[0,1,2]", "[1,2,3]", "خطأ"], ans: 1 },
  { q: "أي بنية للقاموس؟", opts: ["[]", "{}", "()", "<>"], ans: 1 },
  { q: "ما هو الناتج: bool(0)؟", opts: ["True", "False", "None", "خطأ"], ans: 1 },
  { q: "كيف تُخرج من الحلقة؟", opts: ["stop", "exit", "break", "return"], ans: 2 },
  { q: "ما هو الناتج: '5' * 3؟", opts: ["15", "555", "خطأ", "None"], ans: 1 },

  // متقدم
  { q: "ما هو List Comprehension؟", opts: ["قائمة داخل دالة", "إنشاء قائمة باختصار", "قاموس", "حلقة"], ans: 1 },
  { q: "ما هو الناتج: {x: x**2 for x in range(3)}؟", opts: ["[0,1,4]", "{0:0,1:1,2:4}", "[0,1,4]", "خطأ"], ans: 1 },
  { q: "أي كلمة للدوال المجهولة؟", opts: ["def", "lambda", "func", "anonymous"], ans: 1 },
  { q: "ما هو *args؟", opts: ["معاملات غير محدودة", "معامل واحد", "قاموس", "قائمة"], ans: 0 },
  { q: "ما هو **kwargs؟", opts: ["معاملات بأسماء", "معاملات عادية", "قائمة", "رقم"], ans: 0 },
  { q: "أي دالة تُنفذ عند الاستيراد؟", opts: ["__init__", "__main__", "__name__", "__start__"], ans: 2 },
  { q: "ما هو الناتج: isinstance(5, int)؟", opts: ["True", "False", "5", "خطأ"], ans: 0 },

  // محترف
  { q: "ما هو Generator؟", opts: ["دالة تُعيد قيمة واحدة", "دالة تُولد قيمًا تدريجيًا", "قائمة", "كائن"], ans: 1 },
  { q: "كيف تُنشئ Generator؟", opts: ["yield", "return", "print", "generate"], ans: 0 },
  { q: "ما هو الناتج: next(gen)؟", opts: ["القيمة التالية", "القيمة الأخيرة", "خطأ", "None"], ans: 0 },
  { q: "أي مكتبة للتعامل مع المسارات؟", opts: ["os", "pathlib", "sys", "file"], ans: 1 },
  { q: "ما هو Context Manager؟", opts: ["with open()", "try/except", "for loop", "lambda"], ans: 0 },
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
 * المهام العملية (10) — من الصفر
 **********************/
const tasksData = [
  {
    title: "طباعة اسمك",
    desc: "اطبع اسمك باستخدام <code>print()</code>",
    check: (output) => /print/.test(output.code) && output.stdout.includes("EDUMATES"),
    starter: "# اكتب الكود هنا...\n"
  },
  {
    title: "جمع رقمين",
    desc: "أنشئ دالة <code>add(a, b)</code> تُعيد مجموعهما",
    check: (output) => {
      const fn = output.globals.get("add");
      return fn && fn(2, 3) === 5 && fn(0, 0) === 0;
    },
    starter: "# اكتب الكود هنا...\n"
  },
  {
    title: "تحقق من الرقم الزوجي",
    desc: "دالة <code>is_even(n)</code> تُعيد <code>True</code> إذا كان زوجيًا",
    check: (output) => {
      const fn = output.globals.get("is_even");
      return fn && fn(4) === true && fn(5) === false && fn(0) === true;
    },
    starter: "# اكتب الكود هنا...\n"
  },
  {
    title: "مضاعفة قائمة",
    desc: "استخدم List Comprehension لمضاعفة [1,2,3]",
    check: (output) => {
      const result = output.globals.get("doubled");
      return result && result.toJs() && result.toJs().join() === "2,4,6";
    },
    starter: "# اكتب الكود هنا...\n"
  },
  {
    title: "فلتر الأرقام الزوجية",
    desc: "استخدم <code>filter</code> أو List Comprehension لاستخراج الأزواج من [1,2,3,4,5]",
    check: (output) => {
      const result = output.globals.get("evens");
      return result && result.toJs() && result.toJs().join() === "2,4";
    },
    starter: "# اكتب الكود هنا...\n"
  },
  {
    title: "عد تنازلي",
    desc: "استخدم <code>for</code> لطباعة 5 → 1، ثم 'انتهى'",
    check: (output) => {
      return /for/.test(output.code) && /\b5\b.*\b1\b/.test(output.stdout) && /انتهى/.test(output.stdout);
    },
    starter: "# اكتب الكود هنا...\n"
  },
  {
    title: "إنشاء قاموس شخص",
    desc: "أنشئ قاموس <code>person</code> به <code>name</code> و <code>age</code> ومفتاح <code>greet</code> يُعيد تحية",
    check: (output) => {
      const p = output.globals.get("person");
      return p && p.get("name") && p.get("age") && p.get("greet") && /مرحبا|hello/i.test(p.get("greet")());
    },
    starter: "# اكتب الكود هنا...\n"
  },
  {
    title: "Generator للأعداد المربعة",
    desc: "أنشئ Generator يُولد مربعات الأعداد من 1 إلى 3",
    check: (output) => {
      const gen = output.globals.get("squares");
      return gen && [...gen()].join() === "1,4,9";
    },
    starter: "# اكتب الكود هنا...\n"
  },
  {
    title: "قراءة ملف (محاكاة)",
    desc: "استخدم <code>with open()</code> لقراءة نص وطباعته",
    check: (output) => {
      return /with\s+open/.test(output.code) && /read/.test(output.code);
    },
    starter: "# اكتب الكود هنا...\n"
  },
  {
    title: "إصلاح كود معطوب",
    desc: "صحح:<br><pre>prin('خطأ')\nx = 5\ny = x * 2\nprin(y)</pre>",
    check: (output) => {
      return output.stdout.includes("10") && !output.stderr.includes("NameError");
    },
    starter: "prin('خطأ')\nx = 5\ny = x * 2\nprin(y)"
  },
];

/**********************
 * Pyodide + CodeMirror
 **********************/
let pyodide;
const editors = [];
const loadingEl = document.getElementById("loading");
const tasksWrap = document.getElementById("tasks");

async function initPyodide() {
  loadingEl.style.display = "block";
  pyodide = await loadPyodide();
  loadingEl.style.display = "none";
  initTasks();
}

function initTasks() {
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
      mode: "python",
      theme: "default",
      lineNumbers: false,
      indentWithTabs: false,
      indentUnit: 4,
    });
    editors.push(editor);
  });
}

async function runTask(i) {
  const code = editors[i].getValue();
  const outputEl = document.getElementById(`output_${i}`);
  outputEl.style.display = "block";
  outputEl.textContent = "جاري التنفيذ...\n";

  let stdout = "", stderr = "";
  const mockStdout = (data) => stdout += data + "\n";
  const mockStderr = (data) => stderr += data + "\n";

  try {
    await pyodide.runPythonAsync(`
import sys
from io import StringIO
sys.stdout = StringIO()
sys.stderr = StringIO()
    `);
    pyodide.globals.set("print", (x) => mockStdout(x));
    await pyodide.runPythonAsync(code);
    stdout = pyodide.runPython("sys.stdout.getvalue()");
    stderr = pyodide.runPython("sys.stderr.getvalue()");
  } catch (err) {
    stderr = err.message;
  }

  outputEl.textContent = stdout || stderr || "لا إخراج";

  return { code, stdout, stderr, globals: pyodide.globals };
}

async function checkTask(i) {
  const output = await runTask(i);
  let ok = false;
  try {
    ok = tasksData[i].check(output);
  } catch (e) { ok = false; }

  const st = document.getElementById(`status_${i}`);
  if (ok) {
    st.innerHTML = "تم بنجاح";
    st.classList.add("ok"); st.classList.remove("bad");
  } else {
    st.innerHTML = `لم يتحقق الشرط<br><small>راجع الوصف</small>`;
    st.classList.add("bad"); st.classList.remove("ok");
  }
  return ok;
}

tasksWrap.addEventListener("click", async (e) => {
  const btn = e.target.closest("button.btn");
  if (!btn) return;
  const i = Number(btn.dataset.i);
  const action = btn.dataset.action;
  if (action === "run") await runTask(i);
  if (action === "check") await checkTask(i);
});

let practicalScore = 0;
document.getElementById("save-practical").addEventListener("click", async () => {
  let score = 0;
  for (let i = 0; i < tasksData.length; i++) {
    if (await checkTask(i)) score++;
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

// بدء تحميل Pyodide
initPyodide();