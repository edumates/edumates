// 1. استيراد دوال Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
// استخدام signInAnonymously بدلاً من Google لعدم الحاجة لحساب
import { getAuth, signInAnonymously, signOut, onAuthStateChanged, updateProfile } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, updateDoc, doc } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";

// 2. إعدادات Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBhCxGjQOQ88b2GynL515ZYQXqfiLPhjw4",
    authDomain: "edumates-983dd.firebaseapp.com",
    projectId: "edumates-983dd",
    storageBucket: "edumates-983dd.firebasestorage.app",
    messagingSenderId: "172548876353",
    appId: "1:172548876353:web:955b1f41283d26c44c3ec0",
    measurementId: "G-L1KCZTW8R9"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const CHAT_COLLECTION = 'frontend-chat-messages'; // اسم جديد للمجموعة

// ==========================================
// إعدادات الأمان والفلترة (Safety Filters)
// ==========================================

// قائمة الكلمات الممنوعة (مثال بسيط، يجب توسيعها)
const FORBIDDEN_WORDS = [
    "غباء", "غبي", "حقير", "تافه", "سكس", "جنس", "اباحي", 
    "شتيمة", "احمق", "زفت", "كلب", "حيوان", "قتل", "موت", 
    "انتحار", "عنصري", "سافل"
];

// منصات التواصل الممنوعة (لإبقاء الشات تعليمي)
const SOCIAL_MEDIA_KEYWORDS = [
    "facebook", "instagram", "snapchat", "tiktok", "twitter", 
    "whatsapp", "telegram", "inst", "face", "snap", "تيك توك", 
    "فيس", "انستا", "سناب", "واتس"
];

function validateMessage(text) {
    const lowerText = text.toLowerCase();

    // 1. منع الروابط (URLs)
    const urlPattern = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|(\.[a-z]{2,}\/)/i;
    if (urlPattern.test(text)) {
        return { valid: false, reason: "يمنع إرسال الروابط لأسباب أمنية." };
    }

    // 2. منع أرقام الهواتف (أكثر من 3 أرقام متتالية)
    // يسمح بـ 123 (مثلاً إصدار) لكن يمنع 1234
    const phonePattern = /\d{4,}/; 
    if (phonePattern.test(text)) {
        return { valid: false, reason: "يمنع كتابة أكثر من 3 أرقام متتالية لمنع تبادل الهواتف." };
    }

    // 3. منع الكلمات البذيئة
    for (let word of FORBIDDEN_WORDS) {
        if (lowerText.includes(word)) {
            return { valid: false, reason: "تحتوي الرسالة على كلمات غير لائقة." };
        }
    }

    // 4. منع السوشيال ميديا
    for (let social of SOCIAL_MEDIA_KEYWORDS) {
        if (lowerText.includes(social)) {
            return { valid: false, reason: "يرجى عدم نشر حسابات تواصل اجتماعي، الشات تعليمي فقط." };
        }
    }

    return { valid: true };
}

// ==========================================
// عناصر DOM
// ==========================================
const elements = {
    termsModal: document.getElementById('termsModal'),
    agreeBtn: document.getElementById('agreeBtn'),
    guestNameInput: document.getElementById('guestNameInput'),
    
    logoutBtn: document.getElementById('logoutBtn'),
    userInfo: document.getElementById('userInfo'),
    userName: document.getElementById('userName'),
    
    messagesList: document.getElementById('messagesList'),
    messageForm: document.getElementById('messageForm'),
    msgInput: document.getElementById('msgInput'),
    sendBtn: document.getElementById('sendBtn'),
    
    replyPreview: document.getElementById('replyPreview'),
    replyToUser: document.getElementById('replyToUser'),
    replyToText: document.getElementById('replyToText'),
    cancelReplyBtn: document.getElementById('cancelReplyBtn')
};

let currentReplyTo = null;

// ==========================================
// إدارة الدخول والشروط (Authentication)
// ==========================================

// تفعيل زر الموافقة فقط عند كتابة اسم
elements.guestNameInput.addEventListener('input', (e) => {
    elements.agreeBtn.disabled = e.target.value.trim().length < 3;
});

// عند الضغط على موافقة
elements.agreeBtn.addEventListener('click', () => {
    const nickname = elements.guestNameInput.value.trim();
    if (nickname.length < 3) return;

    // تسجيل الدخول المجهول
    signInAnonymously(auth)
        .then((result) => {
            // تحديث اسم المستخدم في Firebase Profile (مؤقتاً للجلسة)
            updateProfile(result.user, { displayName: nickname })
                .then(() => {
                    elements.termsModal.classList.add('hidden'); // إخفاء النافذة
                });
        })
        .catch((error) => {
            console.error(error);
            alert("حدث خطأ في الاتصال، حاول مرة أخرى.");
        });
});

// مراقبة حالة المستخدم
onAuthStateChanged(auth, (user) => {
    if (user) {
        // المستخدم وافق ودخل
        elements.termsModal.classList.add('hidden'); // تأكيد الإخفاء
        elements.userInfo.classList.remove('hidden');
        elements.userName.textContent = user.displayName || "زائر";
        
        elements.msgInput.disabled = false;
        elements.sendBtn.disabled = false;
        
        loadMessages();
    } else {
        // المستخدم خرج أو لم يدخل بعد
        elements.termsModal.classList.remove('hidden'); // إظهار الشروط
        elements.userInfo.classList.add('hidden');
        elements.msgInput.disabled = true;
        elements.sendBtn.disabled = true;
        elements.messagesList.innerHTML = '<div class="welcome-msg"><i class="fas fa-lock"></i><p>يجب الموافقة على الشروط للدخول</p></div>';
    }
});

elements.logoutBtn.addEventListener('click', () => {
    if(confirm("هل تريد الخروج؟ ستحتاج للموافقة على الشروط مرة أخرى عند الدخول.")) {
        signOut(auth);
        location.reload(); // إعادة تحميل الصفحة لإظهار الشروط من جديد
    }
});

// ==========================================
// إدارة الرسائل (Chat Logic)
// ==========================================

function loadMessages() {
    const q = query(collection(db, CHAT_COLLECTION), orderBy('timestamp', 'asc'));

    onSnapshot(q, (snapshot) => {
        elements.messagesList.innerHTML = ''; 
        
        snapshot.forEach((docSnap) => {
            const msg = docSnap.data();
            msg.id = docSnap.id;
            renderMessage(msg);
        });

        scrollToBottom();
    });
}

function renderMessage(msg) {
    const currentUser = auth.currentUser;
    const isMe = currentUser && msg.userId === currentUser.uid;
    const isDeleted = msg.isDeleted === true;

    const div = document.createElement('div');
    div.className = `message ${isMe ? 'me' : 'others'}`;
    div.id = `msg-${msg.id}`;

    let timeString = '';
    if (msg.timestamp) {
        const date = msg.timestamp.toDate();
        timeString = date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    }

    let replyHTML = '';
    if (msg.replyTo && !isDeleted) {
        replyHTML = `
            <div class="reply-context" onclick="scrollToMessage('${msg.replyTo.id}')">
                <small>رد على <b>${sanitize(msg.replyTo.name)}</b></small><br>
                <span style="opacity:0.8">${sanitize(msg.replyTo.text)}</span>
            </div>
        `;
    }

    let contentHTML = '';
    if (isDeleted) {
        contentHTML = `<div class="msg-content deleted"><i class="fas fa-ban"></i> تم حذف هذه الرسالة</div>`;
    } else {
        contentHTML = `
            <div class="msg-content">
                ${replyHTML}
                ${sanitize(msg.text)}
                <div style="text-align: left; font-size: 0.65rem; opacity: 0.6; margin-top: 5px;">${timeString}</div>
            </div>
        `;
    }

    let actionsHTML = '';
    if (!isDeleted) {
        actionsHTML = `
            <div class="msg-actions">
                <button class="action-btn reply-btn" title="رد"><i class="fas fa-reply"></i></button>
                ${isMe ? `<button class="action-btn delete-btn" title="حذف"><i class="fas fa-trash"></i></button>` : ''}
            </div>
        `;
    }

    div.innerHTML = `
        ${!isMe ? `<div class="msg-header"><span>${sanitize(msg.userName)}</span></div>` : ''}
        ${contentHTML}
        ${actionsHTML}
    `;

    if (!isDeleted) {
        const replyBtn = div.querySelector('.reply-btn');
        const deleteBtn = div.querySelector('.delete-btn');

        if (replyBtn) replyBtn.addEventListener('click', () => initiateReply(msg));
        if (deleteBtn) deleteBtn.addEventListener('click', () => deleteMessage(msg.id));
    }

    elements.messagesList.appendChild(div);
}

// إرسال الرسالة مع التحقق الأمني
elements.messageForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = elements.msgInput.value.trim();
    if (!text) return;

    // 1. التحقق من الأمان
    const validation = validateMessage(text);
    if (!validation.valid) {
        alert("⚠️ تنبيه أمني:\n" + validation.reason);
        return; // إيقاف الإرسال
    }

    const user = auth.currentUser;
    if (!user) return;

    try {
        const messageData = {
            text: text,
            userId: user.uid,
            userName: user.displayName || "مستخدم",
            timestamp: serverTimestamp(),
            isDeleted: false
        };

        if (currentReplyTo) {
            messageData.replyTo = {
                id: currentReplyTo.id,
                name: currentReplyTo.userName,
                text: currentReplyTo.text.substring(0, 50) + (currentReplyTo.text.length > 50 ? '...' : '')
            };
        }

        await addDoc(collection(db, CHAT_COLLECTION), messageData);
        
        elements.msgInput.value = '';
        cancelReply(); 
    } catch (error) {
        console.error("Error:", error);
    }
});

async function deleteMessage(msgId) {
    if (confirm("حذف الرسالة؟")) {
        try {
            const msgRef = doc(db, CHAT_COLLECTION, msgId);
            await updateDoc(msgRef, { isDeleted: true, text: "" });
        } catch (error) { console.error(error); }
    }
}

function initiateReply(msg) {
    currentReplyTo = msg;
    elements.replyPreview.classList.remove('hidden');
    elements.replyToUser.textContent = msg.userName;
    elements.replyToText.textContent = msg.text;
    elements.msgInput.focus();
}

function cancelReply() {
    currentReplyTo = null;
    elements.replyPreview.classList.add('hidden');
}

elements.cancelReplyBtn.addEventListener('click', cancelReply);

function scrollToBottom() {
    elements.messagesList.scrollTop = elements.messagesList.scrollHeight;
}

window.scrollToMessage = function(msgId) {
    const el = document.getElementById(`msg-${msgId}`);
    if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.style.backgroundColor = 'rgba(0, 210, 211, 0.2)';
        setTimeout(() => el.style.backgroundColor = 'transparent', 1000);
    }
};

function sanitize(str) {
    if (!str) return '';
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}
