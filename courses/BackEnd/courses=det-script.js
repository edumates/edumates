document.addEventListener('DOMContentLoaded', async function() {
    // تهيئة Firebase
    const firebaseConfig = {
        apiKey: "AIzaSyBhCxGjQOQ88b2GynL515ZYQXqfiLPhjw4",
        authDomain: "edumates-983dd.firebaseapp.com",
        projectId: "edumates-983dd",
        storageBucket: "edumates-983dd.firebasestorage.app",
        messagingSenderId: "172548876353",
        appId: "1:172548876353:web:955b1f41283d26c44c3ec0",
        measurementId: "G-L1KCZTW8R9"
    };

    const { initializeApp } = await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js");
    const { getAuth, GoogleAuthProvider, signInWithPopup, signOut } = await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js");
    const { getAnalytics } = await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-analytics.js");
    const { 
        getFirestore, collection, addDoc, onSnapshot, query, 
        orderBy, serverTimestamp, limit, startAfter, where, getDocs 
    } = await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js");

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const provider = new GoogleAuthProvider();
    let analytics = null;
    try {
        if (location.protocol === 'https:' || location.hostname === 'localhost') {
            analytics = getAnalytics(app);
        }
    } catch (e) { console.warn('Analytics معطّل:', e); }
    const db = getFirestore(app);

    // عناصر DOM
    const elements = {
        currentYear: document.querySelector('.current-year'),
        mobileMenuBtn: document.querySelector('.mobile-menu-btn'),
        navLinks: document.querySelector('.nav-links'),
        viewRoadmapBtn: document.querySelector('.view-roadmap-btn'),
        roadmapPopup: document.querySelector('#roadmapPopup'),
        closeRoadmap: document.querySelector('#closeRoadmap'),
        toggleFeatures: document.querySelectorAll('.toggle-features'),
        googleLoginBtn: document.getElementById('googleLoginBtn'),
        chatBtn: document.getElementById('chatBtn'),
        chatPopup: document.getElementById('chatPopup'),
        closeChat: document.getElementById('closeChat'),
        chatMessages: document.getElementById('chatMessages'),
        messageInput: document.getElementById('messageInput'),
        sendMessageBtn: document.getElementById('sendMessageBtn'),
        chatLoading: document.getElementById('chatLoading'),
        loadMoreBtn: document.getElementById('loadMoreBtn')
    };

    // السنة الحالية
    if (elements.currentYear) elements.currentYear.textContent = new Date().getFullYear();

    // تحديث روابط الاختبارات
    function updateExamLinks() {
        const examLinks = [
            { text: 'اختبار Node.js', href: 'exam-node.html' },
            { text: 'اختبار Python', href: 'exam-python.html' },
            { text: 'اختبار Databases', href: 'exam-databases.html' },
            { text: 'اختبار APIs', href: 'exam-api.html' }
        ];
        document.querySelectorAll('.features-list a').forEach(link => {
            examLinks.forEach(exam => {
                if (link.textContent.trim() === exam.text) {
                    link.setAttribute('href', exam.href);
                }
            });
        });
    }
    updateExamLinks();

    // متغيرات المحادثة
    let lastVisible = null;
    let unsubscribeMessages = null;
    const messagesPerPage = 20;
    let hasMoreMessages = true;
    let unsubscribeRatings = {};

    // القائمة المتنقلة
    function toggleMobileMenu() {
        if (!elements.navLinks) return;
        const isOpen = elements.navLinks.classList.contains('active');
        elements.navLinks.classList.toggle('active');
        elements.mobileMenuBtn.innerHTML = isOpen ?
            '<i class="fas fa-bars"></i>' :
            '<i class="fas fa-times"></i>';
    }
    function closeMobileMenu() {
        if (window.innerWidth <= 768 && elements.navLinks) {
            elements.navLinks.classList.remove('active');
            elements.mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
        }
    }

    // نافذة المحادثة
    function toggleChatPopup() {
        if (elements.chatPopup) {
            const isActive = elements.chatPopup.classList.toggle('active');
            elements.chatPopup.setAttribute('aria-hidden', !isActive);
            if (isActive) {
                elements.messageInput.focus();
                if (!elements.chatMessages.hasChildNodes()) loadMessages();
                scrollChatToBottom();
            } else if (unsubscribeMessages) {
                unsubscribeMessages();
                unsubscribeMessages = null;
            }
        }
    }

    function scrollChatToBottom() {
        if (elements.chatMessages) {
            elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
        }
    }

    // إرسال رسالة (collection: backend-chat)
    async function sendMessage() {
        const user = auth.currentUser;
        if (!user) { alert('يرجى تسجيل الدخول لإرسال الرسائل'); return; }
        const text = elements.messageInput.value.trim();
        if (!text) { alert('يرجى إدخال رسالة'); return; }
        if (text.length > 500) { alert('الحد الأقصى 500 حرف'); return; }

        try {
            elements.sendMessageBtn.disabled = true;
            await addDoc(collection(db, 'backend-chat'), {
                text,
                userId: user.uid,
                userName: user.displayName || 'مستخدم',
                userPhoto: user.photoURL || 'https://via.placeholder.com/30',
                timestamp: serverTimestamp()
            });
            elements.messageInput.value = '';
            scrollChatToBottom();
        } catch (e) {
            console.error(e);
            alert('خطأ في الإرسال: ' + e.message);
        } finally {
            elements.sendMessageBtn.disabled = false;
        }
    }

    // تحميل الرسائل
    function loadMessages() {
        if (!hasMoreMessages) return;
        elements.chatLoading.classList.add('active');

        let q = query(
            collection(db, 'backend-chat'),
            orderBy('timestamp', 'asc'),
            limit(messagesPerPage)
        );
        if (lastVisible) q = query(q, startAfter(lastVisible));

        unsubscribeMessages = onSnapshot(q, snap => {
            if (snap.empty) {
                hasMoreMessages = false;
                elements.loadMoreBtn.style.display = 'none';
                elements.chatLoading.classList.remove('active');
                return;
            }

            const msgs = [];
            snap.forEach(doc => msgs.push({ id: doc.id, ...doc.data() }));
            lastVisible = snap.docs[snap.docs.length - 1];
            elements.loadMoreBtn.style.display = hasMoreMessages ? 'block' : 'none';
            elements.chatLoading.classList.remove('active');

            if (!elements.chatMessages.hasChildNodes()) elements.chatMessages.innerHTML = '';

            msgs.forEach(m => {
                if (!m.text || !m.timestamp) return;
                const isMe = auth.currentUser && m.userId === auth.currentUser.uid;
                const div = document.createElement('div');
                div.className = `message ${isMe ? 'user-message' : ''}`;
                div.innerHTML = `
                    <div class="message-header">
                        <img src="${m.userPhoto}" alt="${sanitize(m.userName)}" class="message-avatar">
                        <span class="message-sender">${sanitize(m.userName)}</span>
                        <span class="message-time">${m.timestamp ? new Date(m.timestamp.toMillis()).toLocaleTimeString('ar-EG', {hour:'2-digit',minute:'2-digit'}) : 'الآن'}</span>
                    </div>
                    <p class="message-text">${sanitize(m.text)}</p>
                `;
                elements.chatMessages.appendChild(div);
            });
            scrollChatToBottom();
        }, err => {
            console.error(err);
            elements.chatLoading.classList.remove('active');
            alert('خطأ في تحميل الرسائل');
        });
    }

    function sanitize(str) {
        const div = document.createElement('div');
        div.textContent = str.replace(/[<>]/g, '');
        return div.innerHTML;
    }

    // تقييم المصدر (collection: backend-ratings)
    async function submitRating(linkId, rating) {
        const user = auth.currentUser;
        if (!user) { alert('سجّل الدخول أولاً'); return; }

        try {
            const q = query(
                collection(db, 'backend-ratings'),
                where('linkId', '==', linkId),
                where('userId', '==', user.uid)
            );
            const snap = await getDocs(q);
            if (!snap.empty) { alert('لقد قيّمت هذا المصدر مسبقاً'); return; }

            await addDoc(collection(db, 'backend-ratings'), {
                linkId,
                userId: user.uid,
                rating,
                timestamp: serverTimestamp()
            });
        } catch (e) {
            console.error(e);
            alert('خطأ في التقييم: ' + e.message);
        }
    }

    // تحديث عرض النجوم
    function updateStarDisplay(container, avg, count, userRating = null) {
        const stars = container.querySelectorAll('i');
        stars.forEach(s => {
            const v = parseInt(s.dataset.value);
            if (userRating && v <= userRating) {
                s.classList.add('rated');
                s.style.color = 'var(--accent-orange)';
            } else if (avg > 0 && v <= Math.floor(avg)) {
                s.classList.add('rated');
                s.style.color = 'var(--accent-orange)';
            } else {
                s.classList.remove('rated');
                s.style.color = 'var(--text-light)';
            }
        });
        container.querySelector('.average-rating').textContent = avg ? avg.toFixed(1) : '0.0';
        container.querySelector('.rating-count').textContent = `(${count} تقييم)`;
    }

    // تحميل التقييمات
    function loadRatings(linkId, container) {
        const q = query(collection(db, 'backend-ratings'), where('linkId', '==', linkId));
        unsubscribeRatings[linkId] = onSnapshot(q, async snap => {
            let total = 0, cnt = 0, userRating = null;
            const user = auth.currentUser;

            if (user) {
                const uq = query(collection(db, 'backend-ratings'), where('linkId', '==', linkId), where('userId', '==', user.uid));
                const usnap = await getDocs(uq);
                if (!usnap.empty) userRating = usnap.docs[0].data().rating;
            }

            snap.forEach(doc => {
                total += doc.data().rating;
                cnt++;
            });
            const avg = cnt > 0 ? total / cnt : 0;
            updateStarDisplay(container, avg, cnt, userRating);
        });
    }

    // إعداد المستمعين
    function setupEventListeners() {
        elements.mobileMenuBtn?.addEventListener('click', toggleMobileMenu);
        document.querySelectorAll('.nav-link').forEach(l => l.addEventListener('click', closeMobileMenu));
        elements.chatBtn?.addEventListener('click', toggleChatPopup);
        elements.closeChat?.addEventListener('click', toggleChatPopup);
        elements.sendMessageBtn?.addEventListener('click', sendMessage);
        elements.messageInput?.addEventListener('keypress', e => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
        });
        elements.loadMoreBtn?.addEventListener('click', loadMessages);
        elements.toggleFeatures.forEach(t => t.addEventListener('click', toggleFeatures));
        elements.googleLoginBtn?.addEventListener('click', handleGoogleLogin);

        // نجوم التقييم
        document.querySelectorAll('.rating-stars').forEach(stars => {
            const linkId = stars.closest('li')?.getAttribute('data-link-id');
            if (!linkId) return;
            loadRatings(linkId, stars);
            stars.querySelectorAll('i').forEach(star => {
                star.addEventListener('click', () => {
                    const rating = parseInt(star.dataset.value);
                    submitRating(linkId, rating);
                });
            });
        });
    }

    // تسجيل الدخول
    async function handleGoogleLogin() {
        try {
            elements.googleLoginBtn.disabled = true;
            const result = await signInWithPopup(auth, provider);
            updateUIAfterLogin(result.user);
        } catch (e) {
            console.error(e);
            alert('خطأ في تسجيل الدخول: ' + e.message);
        } finally {
            elements.googleLoginBtn.disabled = false;
        }
    }

    function updateUIAfterLogin(user) {
        elements.googleLoginBtn.innerHTML = `
            <img src="${user.photoURL || 'https://via.placeholder.com/30'}" alt="${sanitize(user.displayName)}" class="user-avatar">
            <span>${sanitize(user.displayName || 'مستخدم')}</span>
            <i class="fas fa-sign-out-alt logout-icon" aria-label="تسجيل الخروج"></i>
        `;
        elements.googleLoginBtn.querySelector('.logout-icon')?.addEventListener('click', async e => {
            e.stopPropagation();
            await signOut(auth);
            location.reload();
        });
    }

    // القوائم المنسدلة
    function toggleFeatures(e) {
        const li = e.currentTarget.closest('li');
        const list = li.querySelector('.features-list');
        const active = list.classList.contains('active');
        document.querySelectorAll('.features-list').forEach(l => l.classList.remove('active'));
        document.querySelectorAll('.toggle-features').forEach(t => t.classList.remove('active'));
        if (!active) {
            list.classList.add('active');
            e.currentTarget.classList.add('active');
        }
    }

    setupEventListeners();

    // مراقبة حالة المستخدم
    auth.onAuthStateChanged(user => {
        if (user) {
            updateUIAfterLogin(user);
            if (elements.chatPopup.classList.contains('active') && !unsubscribeMessages) loadMessages();
        } else {
            elements.chatMessages.innerHTML = '';
            hasMoreMessages = true;
            lastVisible = null;
            elements.loadMoreBtn.style.display = 'none';
            if (unsubscribeMessages) { unsubscribeMessages(); unsubscribeMessages = null; }
            Object.values(unsubscribeRatings).forEach(u => u());
            unsubscribeRatings = {};
        }
    });
});
