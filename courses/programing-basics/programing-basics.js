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
    const { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, where, getDocs } = await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js");

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
        closeRoadmap: document.getElementById('closeRoadmap'),
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

    // Ratings - بدون رسائل، وتلون النجوم فوراً
    const updateStars = (container, rating) => {
        container.querySelectorAll('i').forEach((star, i) => {
            star.classList.toggle('active', i < rating);
        });
    };

    document.querySelectorAll('.rating-stars').forEach(container => {
        const linkId = container.closest('[data-link-id]').dataset.linkId;

        // تحميل التقييمات
        const load = async () => {
            const q = query(collection(db, 'ratings'), where('linkId', '==', linkId));
            const snap = await getDocs(q);
            let sum = 0, count = 0;
            snap.forEach(d => { sum += d.data().rating; count++; });
            const avg = count ? (sum / count).toFixed(1) : '0.0';
            container.querySelector('.average-rating').textContent = avg;
            container.querySelector('.rating-count').textContent = `(${count} تقييم)`;
            updateStars(container, Math.round(avg));
        };
        load();

        // إرسال تقييم
        container.querySelectorAll('i').forEach(star => {
            star.addEventListener('click', async () => {
                if (!auth.currentUser) return;
                const rating = +star.dataset.value;
                await addDoc(collection(db, 'ratings'), {
                    linkId,
                    userId: auth.currentUser.uid,
                    rating,
                    timestamp: serverTimestamp()
                });
                load();
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
        }
    });
});