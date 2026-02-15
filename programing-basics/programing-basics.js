// ===============================
// courses=det-script.js (FULL)
// ===============================
document.addEventListener('DOMContentLoaded', async function () {
  // -------------------------------
  // Firebase Init
  // -------------------------------
  const firebaseConfig = {
    apiKey: "AIzaSyBhCxGjQOQ88b2GynL515ZYQXqfiLPhjw4",
    authDomain: "edumates-983dd.firebaseapp.com",
    projectId: "edumates-983dd",
    storageBucket: "edumates-983dd.firebasestorage.app",
    messagingSenderId: "172548876353",
    appId: "1:172548876353:web:955b1f41283d26c44c3ec0",
    measurementId: "G-L1KCZTW8R9"
  };

  // Dynamic imports (Firebase v11 modular)
  const { initializeApp } = await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js");
  const { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } =
    await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js");
  await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-analytics.js");
  const {
    getFirestore, collection, addDoc, onSnapshot, query, orderBy,
    serverTimestamp, limitToLast, endBefore, getDocs, where
  } = await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js");

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();
  const db = getFirestore(app);

  // -------------------------------
  // DOM Cache
  // -------------------------------
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const el = {
    currentYear: $('.current-year'),
    mobileMenuBtn: $('.mobile-menu-btn'),
    navLinks: $('.nav-links'),
    // Chat
    chatBtn: $('#chatBtn'),
    chatPopup: $('#chatPopup'),
    closeChat: $('#closeChat'),
    chatMessages: $('#chatMessages'),
    chatLoading: $('#chatLoading'),
    loadMoreBtn: $('#loadMoreBtn'),
    messageInput: $('#messageInput'),
    sendMessageBtn: $('#sendMessageBtn'),
    usernameInput: $('#usernameInput'),       // قد لا تكون موجودة في HTML
    saveUsernameBtn: $('#saveUsernameBtn'),   // قد لا تكون موجودة في HTML

    // Auth
    googleLoginBtn: $('#googleLoginBtn'),
  };

  // -------------------------------
  // Utilities
  // -------------------------------
  const PAGE_SIZE = 20;
  let renderedIds = new Set();
  let unsubscribeLatest = null;
  let firstVisibleDoc = null; // الأقدم في القائمة المعروضة
  const locale = 'ar-EG';

  const sanitizeHTML = (str) => {
    const div = document.createElement('div');
    div.textContent = String(str ?? '').replace(/[<>]/g, '');
    return div.innerHTML;
  };

  const fmtTime = (ts) => {
    try {
      const d = ts?.toDate ? ts.toDate() : (ts instanceof Date ? ts : new Date());
      return d.toLocaleString(locale, { hour: '2-digit', minute: '2-digit', year: 'numeric', month: 'short', day: '2-digit' });
    } catch { return ''; }
  };

  const scrollChatToBottom = () => {
    if (!el.chatMessages) return;
    el.chatMessages.scrollTop = el.chatMessages.scrollHeight;
  };

  // -------------------------------
  // Year in footer
  // -------------------------------
  if (el.currentYear) el.currentYear.textContent = new Date().getFullYear();

  // -------------------------------
  // Mobile menu
  // -------------------------------
  function toggleMobileMenu() {
    if (!el.navLinks || !el.mobileMenuBtn) return;
    el.navLinks.classList.toggle('active');
    const isOpen = el.navLinks.classList.contains('active');
    el.mobileMenuBtn.innerHTML = isOpen ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
  }
  function closeMobileMenuIfNarrow() {
    if (!el.navLinks || !el.mobileMenuBtn) return;
    if (window.innerWidth <= 768) {
      el.navLinks.classList.remove('active');
      el.mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
    }
  }


  // -------------------------------
  // Toggle features (القوائم داخل الروابط التعليمية)
  // -------------------------------
  function wireFeatureToggles() {
    $$('.toggle-arrow').forEach(arrow => {
      arrow.addEventListener('click', (e) => {
        e.stopPropagation();
        const li = arrow.closest('li');
        if (!li) return;
        const list = $('.features-list', li);
        if (!list) return;
        const active = list.classList.contains('active');

        // أغلق الكل
        $$('.features-list').forEach(l => l.classList.remove('active'));
        $$('.toggle-arrow').forEach(a => a.classList.remove('active'));

        // افتح المطلوب
        if (!active) {
          list.classList.add('active');
          arrow.classList.add('active');
        }
      });
    });
  }

  // -------------------------------
  // Auth (Google)
  // -------------------------------
  async function handleGoogleLogin() {
    try {
      if (el.googleLoginBtn) el.googleLoginBtn.disabled = true;
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      updateUIAfterLogin(user);
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء تسجيل الدخول: ' + err.message);
    } finally {
      if (el.googleLoginBtn) el.googleLoginBtn.disabled = false;
    }
  }

  function updateUIAfterLogin(user) {
    if (!el.googleLoginBtn) return;
    if (user) {
      el.googleLoginBtn.innerHTML = `
        <img src="${user.photoURL || 'https://via.placeholder.com/30'}" alt="Avatar" class="user-avatar">
        <span>${sanitizeHTML(user.displayName || localStorage.getItem('chat-username') || 'مستخدم')}</span>
        <i class="fas fa-sign-out-alt logout-icon" title="تسجيل الخروج"></i>
      `;
      const logoutIcon = $('.logout-icon', el.googleLoginBtn);
      if (logoutIcon) {
        logoutIcon.addEventListener('click', async (e) => {
          e.stopPropagation();
          try { await signOut(auth); } catch (er) { console.error(er); }
        });
      }
    } else {
      el.googleLoginBtn.textContent = 'تسجيل الدخول باستخدام جوجل';
    }
  }

  onAuthStateChanged(auth, (user) => {
    updateUIAfterLogin(user);
    // لا نجبر المستخدم على تسجيل الدخول للدردشة، لكن سنظهر الفرق في ألوان رسائله
  });

  if (el.googleLoginBtn) el.googleLoginBtn.addEventListener('click', handleGoogleLogin);

  // -------------------------------
  // Username (localStorage)
  // -------------------------------
  if (el.saveUsernameBtn && el.usernameInput) {
    // Prefill
    const saved = localStorage.getItem('chat-username') || '';
    if (saved) el.usernameInput.value = saved;

    el.saveUsernameBtn.addEventListener('click', () => {
      const name = el.usernameInput.value.trim();
      if (!name) return alert('من فضلك اكتب اسم صالح');
      localStorage.setItem('chat-username', name);
      alert('تم حفظ اسمك بنجاح ✅');
    document.querySelector('.chat-username').style.display = 'none';
    });
  }

  // -------------------------------
  // Chat popup open/close
  // -------------------------------
  function openChat() {
    if (!el.chatPopup) return;
    el.chatPopup.classList.add('active');
    el.chatPopup.setAttribute('aria-hidden', 'false');
    if (el.messageInput) el.messageInput.focus();
    ensureChatSubscribed();
    scrollChatToBottom();
  }
  function closeChat() {
    if (!el.chatPopup) return;
    el.chatPopup.classList.remove('active');
    el.chatPopup.setAttribute('aria-hidden', 'true');
    if (unsubscribeLatest) { unsubscribeLatest(); unsubscribeLatest = null; }
  }
  if (el.chatBtn) el.chatBtn.addEventListener('click', openChat);
  if (el.closeChat) el.closeChat.addEventListener('click', closeChat);

  // -------------------------------
  // Chat: rendering & paging
  // -------------------------------
  function renderMessage(doc, currentUser) {
    const data = doc.data();
    const id = doc.id;
    if (renderedIds.has(id)) return; // avoid duplicates
    const wrapper = document.createElement('div');
    wrapper.className = 'message';
    const isMine = currentUser && (data.userId === currentUser.uid);
    if (isMine) wrapper.classList.add('user-message');

    const avatar = sanitizeHTML(data.userPhoto || 'https://via.placeholder.com/30');
    const sender = sanitizeHTML(data.userName || 'مستخدم');
    const time = fmtTime(data.timestamp);

    wrapper.innerHTML = `
      <div class="message-header">
        <img class="message-avatar" src="${avatar}" alt="avatar">
        <span class="message-sender">${sender}</span>
        <span class="message-time">${time}</span>
      </div>
      <div class="message-text">${sanitizeHTML(data.text || '')}</div>
    `;
    el.chatMessages.appendChild(wrapper);
    renderedIds.add(id);
  }

  function prependMessages(docs, currentUser) {
    // احفظ موضع التمرير
    const prevHeight = el.chatMessages.scrollHeight;
    const prevTop = el.chatMessages.scrollTop;

    const frag = document.createDocumentFragment();
    docs.forEach(doc => {
      const data = doc.data();
      const id = doc.id;
      if (renderedIds.has(id)) return;
      const wrapper = document.createElement('div');
      wrapper.className = 'message';
      const isMine = currentUser && (data.userId === currentUser.uid);
      if (isMine) wrapper.classList.add('user-message');

      const avatar = sanitizeHTML(data.userPhoto || 'https://via.placeholder.com/30');
      const sender = sanitizeHTML(data.userName || 'مستخدم');
      const time = fmtTime(data.timestamp);

      wrapper.innerHTML = `
        <div class="message-header">
          <img class="message-avatar" src="${avatar}" alt="avatar">
          <span class="message-sender">${sender}</span>
          <span class="message-time">${time}</span>
        </div>
        <div class="message-text">${sanitizeHTML(data.text || '')}</div>
      `;
      frag.appendChild(wrapper);
      renderedIds.add(id);
    });
    el.chatMessages.prepend(frag);

    // حافظ على موضع التمرير بعد الإدراج في الأعلى
    const newHeight = el.chatMessages.scrollHeight;
    el.chatMessages.scrollTop = newHeight - (prevHeight - prevTop);
  }

  function setChatLoading(v) {
    if (!el.chatLoading) return;
    el.chatLoading.style.display = v ? 'block' : 'none';
  }

  function ensureChatSubscribed() {
    if (!el.chatMessages) return;
    if (unsubscribeLatest) return; // already

    setChatLoading(true);
    renderedIds.clear();
    el.chatMessages.innerHTML = '';

    const q = query(collection(db, 'messages'), orderBy('timestamp', 'asc'), limitToLast(PAGE_SIZE));
    unsubscribeLatest = onSnapshot(q, (snap) => {
      setChatLoading(false);
      const currUser = auth.currentUser;
      if (!snap.empty) {
        // أول وثيقة هي الأقدم
        firstVisibleDoc = snap.docs[0];
        snap.docs.forEach(d => renderMessage(d, currUser));
        // إظهار زر المزيد لأن احتمال وجود رسائل أقدم
        if (el.loadMoreBtn) el.loadMoreBtn.style.display = 'inline-flex';
        scrollChatToBottom();
      } else {
        if (el.loadMoreBtn) el.loadMoreBtn.style.display = 'none';
      }
    }, (err) => {
      setChatLoading(false);
      console.error('Chat subscription error:', err);
    });
  }

  async function loadOlderMessages() {
    try {
      if (!firstVisibleDoc) return;
      if (!el.chatMessages) return;
      const currUser = auth.currentUser;
      const ts = firstVisibleDoc.data()?.timestamp;
      if (!ts) return;
      const q = query(
        collection(db, 'messages'),
        orderBy('timestamp', 'asc'),
        endBefore(ts),
        limitToLast(PAGE_SIZE)
      );
      const snap = await getDocs(q);
      if (snap.empty) {
        if (el.loadMoreBtn) el.loadMoreBtn.style.display = 'none';
        return;
      }
      // حدد أول مستند (الأقدم) الجديد
      firstVisibleDoc = snap.docs[0];
      prependMessages(snap.docs, currUser);
    } catch (err) {
      console.error('Load older error:', err);
    }
  }

  if (el.loadMoreBtn) el.loadMoreBtn.addEventListener('click', loadOlderMessages);

  // إرسال رسالة
  async function sendMessage() {
    const text = el.messageInput ? el.messageInput.value.trim() : '';
    if (!text) return alert('يرجى إدخال رسالة غير فارغة');

    const user = auth.currentUser;
    const customName = localStorage.getItem('chat-username') || 'مستخدم';

    try {
      if (el.sendMessageBtn) el.sendMessageBtn.disabled = true;
      await addDoc(collection(db, 'messages'), {
        text,
        userId: user ? user.uid : 'guest',
        userName: customName,
        userPhoto: user ? (user.photoURL || 'https://via.placeholder.com/30') : 'https://via.placeholder.com/30',
        timestamp: serverTimestamp()
      });
      if (el.messageInput) el.messageInput.value = '';
      setTimeout(scrollChatToBottom, 50);
    } catch (err) {
      console.error('sendMessage error:', err);
      alert('حدث خطأ أثناء إرسال الرسالة: ' + err.message);
    } finally {
      if (el.sendMessageBtn) el.sendMessageBtn.disabled = false;
    }
  }

  if (el.sendMessageBtn) el.sendMessageBtn.addEventListener('click', sendMessage);
  if (el.messageInput) el.messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
  const saved = localStorage.getItem('chat-username');
if (saved) {
  el.usernameInput.value = saved;
  document.querySelector('.chat-username').style.display = 'none';
}


  // -------------------------------
  // Ratings (stars)
  // -------------------------------
  function updateStarDisplay(container, average) {
    const stars = $$('i.fas.fa-star', container);
    const rounded = Math.round(average);
    stars.forEach((star, idx) => {
      if (idx < rounded) star.classList.add('active');
      else star.classList.remove('active');
    });
  }

  async function loadRatings(linkId, container) {
    try {
      const ratingsRef = collection(db, 'ratings');
      const q = query(ratingsRef, where('linkId', '==', linkId));
      const snap = await getDocs(q);
      let total = 0;
      let count = 0;
      snap.forEach(doc => {
        const r = doc.data()?.rating || 0;
        total += r;
        count += 1;
      });
      const avg = count ? (total / count) : 0;
      const avgEl = $('.average-rating', container);
      const countEl = $('.rating-count', container);
      if (avgEl) avgEl.textContent = avg.toFixed(1);
      if (countEl) countEl.textContent = `(${count} تقييم)`;
      updateStarDisplay(container, avg);
    } catch (err) {
      console.error('loadRatings error:', err);
    }
  }

  async function submitRating(linkId, rating) {
    const user = auth.currentUser;
    if (!user) {
      alert('يرجى تسجيل الدخول لتقييم الروابط.');
      return;
    }
    try {
      // تحقق إذا قيّم من قبل
      const ratingsRef = collection(db, 'ratings');
      const q = query(ratingsRef, where('linkId', '==', linkId), where('userId', '==', user.uid));
      const snap = await getDocs(q);
      if (!snap.empty) {
        alert('لقد قيّمت هذا الرابط مسبقًا.');
        return;
      }
      await addDoc(ratingsRef, {
        linkId, userId: user.uid, rating, timestamp: serverTimestamp()
      });
      // حدّث الواجهة
      const container = document.querySelector(`[data-link-id="${linkId}"] .rating-stars`);
      if (container) await loadRatings(linkId, container);
      alert('تم تسجيل تقييمك، شكرًا لك!');
    } catch (err) {
      console.error('submitRating error:', err);
      alert('تعذر تسجيل التقييم: ' + err.message);
    }
  }

  function wireRatings() {
    $$('.rating-stars').forEach(container => {
      const li = container.closest('[data-link-id]');
      if (!li) return;
      const linkId = li.getAttribute('data-link-id');
      // تحميل المتوسط
      loadRatings(linkId, container);
      // نقر على النجوم
      $$('i.fas.fa-star', container).forEach(star => {
        star.addEventListener('click', () => {
          const rating = parseInt(star.getAttribute('data-value'), 10) || 0;
          if (rating) submitRating(linkId, rating);
        });
      });
    });
  }

  // -------------------------------
  // NEW: Roadmap Modal Functionality (مع إضافة إغلاق عند الضغط على أزرار الخطوات)
  // -------------------------------
  const roadmapBtn = document.getElementById('viewRoadmapBtn');
  const modal = document.getElementById('roadmapModal');
  const closeModal = document.getElementById('closeModal');
  const startLearningBtn = document.getElementById('startLearningBtn');

  function openRoadmapModal() {
    if (modal) {
      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
    }
  }

  function closeRoadmapModal() {
    if (modal) {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
    }
  }

  // Event Listeners للـ Modal الأساسي
  if (roadmapBtn) roadmapBtn.addEventListener('click', openRoadmapModal);
  if (closeModal) closeModal.addEventListener('click', closeRoadmapModal);
  if (startLearningBtn) startLearningBtn.addEventListener('click', () => {
    closeRoadmapModal();
    // يمكن إضافة إجراء إضافي هنا، مثل فتح فيديو أو صفحة
    alert('ابدأ رحلتك في البرمجة الآن! 🚀');
  });

  // إغلاق الـ modal عند النقر خارجها
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeRoadmapModal();
    });
  }

  // **التعديل الجديد: إغلاق الـ Modal عند الضغط على أزرار الخطوات (.step-btn)**
  const stepBtns = document.querySelectorAll('.step-btn');
  stepBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      // أغلق الـ Modal أولاً
      closeRoadmapModal();
      // التنقل سيحدث تلقائيًا عبر href في الـ anchor tag
      // (لا نحتاج إلى منع الافتراضي، لأن href يعمل بشكل طبيعي)
    });
  });

  // -------------------------------
  // Initializations
  // -------------------------------
  wireFeatureToggles();
  wireRatings();
  // إضافة مستمعي للقائمة المتنقلة (إذا كانت موجودة)
  if (el.mobileMenuBtn) el.mobileMenuBtn.addEventListener('click', toggleMobileMenu);
  window.addEventListener('resize', closeMobileMenuIfNarrow);
});