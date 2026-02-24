document.addEventListener('DOMContentLoaded', async function() {
    const firebaseConfig = {
        apiKey: "AIzaSyBhCxGjQOQ88b2GynL515ZYQXqfiLPhjw4",
        authDomain: "edumates-983dd.firebaseapp.com",
        projectId: "edumates-983dd",
        storageBucket: "edumates-983dd.firebasestorage.app",
        messagingSenderId: "172548876353",
        appId: "1:172548876353:web:955b1f41283d26c44c3ec0"
    };

    const { initializeApp } = await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js");
    const { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } = await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js");
    const { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, where, getDocs, doc, deleteDoc, updateDoc } = await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js");

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const provider = new GoogleAuthProvider();
    const db = getFirestore(app);

    // Elements
    const el = {
        googleLoginBtn: document.getElementById('googleLoginBtn'),
        chatBtn: document.getElementById('chatBtn'),
        chatPopup: document.getElementById('chatPopup'),
        closeChat: document.getElementById('closeChat'),
        chatMessages: document.getElementById('chatMessages'),
        messageInput: document.getElementById('messageInput'),
        sendMessageBtn: document.getElementById('sendMessageBtn'),
        chatLoading: document.getElementById('chatLoading'),
        viewRoadmapBtn: document.getElementById('viewRoadmapBtn'),
        roadmapModal: document.getElementById('roadmapModal'),
        closeRoadmap: document.getElementById('closeModal'),  // تعديل هنا ليطابق HTML
        currentYear: document.querySelector('.current-year')
    };

    if (el.currentYear) el.currentYear.textContent = new Date().getFullYear();

    // Mobile Menu
    document.querySelector('.mobile-menu-btn')?.addEventListener('click', () => {
        document.querySelector('.nav-links').classList.toggle('active');
    });

    // Roadmap Modal
    el.viewRoadmapBtn?.addEventListener('click', () => {
        el.roadmapModal.classList.add('active');
    });
    el.closeRoadmap?.addEventListener('click', () => {
        el.roadmapModal.classList.remove('active');
    });

    // Chat
    let unsubscribe = null;
    el.chatBtn?.addEventListener('click', () => {
        if (!auth.currentUser) {
            alert('قم بتسجيل الدخول أولاً');
            return;
        }
        el.chatPopup.classList.add('active');
        el.messageInput.focus();
        if (!unsubscribe) loadMessages();
    });

    el.closeChat?.addEventListener('click', () => {
        el.chatPopup.classList.remove('active');
        if (unsubscribe) unsubscribe();
    });

    const loadMessages = () => {
        el.chatLoading.style.display = 'block';
        const q = query(collection(db, 'frontend-chat'), orderBy('timestamp', 'asc'));
        unsubscribe = onSnapshot(q, snap => {
            el.chatLoading.style.display = 'none';
            el.chatMessages.innerHTML = '';
            snap.forEach(doc => {
                const data = doc.data();
                const div = document.createElement('div');
                div.className = `message ${data.userId === auth.currentUser.uid ? 'mine' : 'other'}`;
                div.innerHTML = `
                    <strong>${data.userName}</strong>
                    <p>${data.text}</p>
                    <small>${new Date(data.timestamp?.toDate()).toLocaleTimeString('ar')}</small>
                `;
                el.chatMessages.appendChild(div);
            });
            el.chatMessages.scrollTop = el.chatMessages.scrollHeight;
        });
    };

    el.sendMessageBtn?.addEventListener('click', async () => {
        const text = el.messageInput.value.trim();
        if (!text) return;
        await addDoc(collection(db, 'frontend-chat'), {
            text,
            userId: auth.currentUser.uid,
            userName: auth.currentUser.displayName || 'مجهول',
            userPhoto: auth.currentUser.photoURL,
            timestamp: serverTimestamp()
        });
        el.messageInput.value = '';
    });

    el.messageInput?.addEventListener('keypress', e => {
        if (e.key === 'Enter') el.sendMessageBtn.click();
    });

    // نظام التقييم (منسوخ من courses=det-script.js مع تعديلات طفيفة)
    let unsubscribeRatings = {};

    const loadRatings = async (linkId, starsContainer) => {
        const q = query(collection(db, 'ratings'), where('linkId', '==', linkId));
        const snap = await getDocs(q);
        let sum = 0, count = 0;
        snap.forEach(d => { sum += d.data().rating; count++; });
        const avg = count ? (sum / count).toFixed(1) : '0.0';
        starsContainer.querySelector('.average-rating').textContent = avg;
        starsContainer.querySelector('.rating-count').textContent = `(${count} تقييم)`;

        // تحديث النجوم بناءً على المتوسط
        updateStars(starsContainer, Math.round(avg));

        // إذا كان المستخدم مسجلاً، حمّل تقييمه الشخصي
        if (auth.currentUser) {
            const userRatingQuery = query(collection(db, 'ratings'), where('linkId', '==', linkId), where('userId', '==', auth.currentUser.uid));
            unsubscribeRatings[linkId] = onSnapshot(userRatingQuery, userSnap => {
                if (!userSnap.empty) {
                    const userRating = userSnap.docs[0].data().rating;
                    updateStars(starsContainer, userRating);
                }
            });
        }
    };

    const submitRating = async (linkId, rating) => {
        const user = auth.currentUser;
        if (!user) {
            alert('يرجى تسجيل الدخول للتقييم');
            return;
        }

        const userRatingQuery = query(collection(db, 'ratings'), where('linkId', '==', linkId), where('userId', '==', user.uid));
        const userRatingSnap = await getDocs(userRatingQuery);

        if (!userRatingSnap.empty) {
            alert('لقد قيّمت هذا المورد سابقًا');
            return;
        }

        try {
            await addDoc(collection(db, 'ratings'), {
                linkId,
                userId: user.uid,
                rating,
                timestamp: serverTimestamp()
            });
            // إعادة تحميل التقييمات
            document.querySelectorAll('.rating-stars').forEach(container => {
                if (container.parentElement.getAttribute('data-link-id') === linkId) {
                    loadRatings(linkId, container);
                }
            });
        } catch (error) {
            console.error('خطأ في إرسال التقييم:', error);
            alert('حدث خطأ أثناء إرسال التقييم');
        }
    };

    const updateStars = (container, rating) => {
        container.querySelectorAll('i').forEach((star, i) => {
            star.classList.toggle('active', i < rating);
        });
    };

    // إضافة مستمعي الأحداث للنجوم
    document.querySelectorAll('.rating-stars').forEach(starsContainer => {
        const linkId = starsContainer.parentElement.getAttribute('data-link-id');
        loadRatings(linkId, starsContainer);

        starsContainer.querySelectorAll('i').forEach(star => {
            star.addEventListener('click', () => {
                const rating = parseInt(star.getAttribute('data-value'));
                submitRating(linkId, rating);
            });
        });
    });

    // تسجيل الدخول
    el.googleLoginBtn?.addEventListener('click', () => signInWithPopup(auth, provider));

    onAuthStateChanged(auth, user => {
        if (user) {
            el.googleLoginBtn.innerHTML = `
                <img src="${user.photoURL}" class="user-avatar">
                <span>${user.displayName.split(' ')[0]}</span>
            `;
            // تحديث تقييمات المستخدم
            document.querySelectorAll('.rating-stars').forEach(starsContainer => {
                const linkId = starsContainer.parentElement.getAttribute('data-link-id');
                loadRatings(linkId, starsContainer);
            });
        } else {
            // إلغاء الاشتراك في تقييمات المستخدم
            Object.values(unsubscribeRatings).forEach(unsubscribe => unsubscribe());
            unsubscribeRatings = {};
            // إعادة تحميل التقييمات العامة
            document.querySelectorAll('.rating-stars').forEach(starsContainer => {
                const linkId = starsContainer.parentElement.getAttribute('data-link-id');
                loadRatings(linkId, starsContainer);
            });
        }
    });
});
