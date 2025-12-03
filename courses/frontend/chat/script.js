import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, updateDoc, doc } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";

// إعدادات Firebase
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
const db = getFirestore(app);
const CHAT_COLLECTION = 'frontend-chat-secure'; 

// === عناصر الواجهة ===
const elements = {
    modal: document.getElementById('consentModal'),
    guestInput: document.getElementById('guestNameInput'),
    acceptBtn: document.getElementById('acceptBtn'),
    loginError: document.getElementById('loginError'),
    
    userInfo: document.getElementById('userInfo'),
    userAvatar: document.getElementById('userAvatar'),
    userName: document.getElementById('userName'),
    logoutBtn: document.getElementById('logoutBtn'),
    
    messagesList: document.getElementById('messagesList'),
    inputArea: document.getElementById('inputArea'),
    messageForm: document.getElementById('messageForm'),
    msgInput: document.getElementById('msgInput'),
    securityWarning: document.getElementById('securityWarning'),
    
    replyPreview: document.getElementById('replyPreview'),
    replyToUser: document.getElementById('replyToUser'),
    replyToText: document.getElementById('replyToText'),
    cancelReplyBtn: document.getElementById('cancelReplyBtn')
};

// === متغيرات المستخدم ===
let currentUser = null; // { id: "unique-id", name: "Guest" }
let currentReplyTo = null;

// === قائمة الكلمات المحظورة (عينة تعليمية، يجب توسيعها) ===
const BANNED_WORDS = [
    "شتم", "قذر", "حيوان", "غبي", "حقير", "سكس", "sex", "porn", "xxx", "احمق", "تافه", "كلب"
    // يمكن إضافة المزيد هنا
];

// === 1. إدارة الدخول (بدون تسجيل دخول حقيقي) ===

// التحقق عند التحميل
window.addEventListener('DOMContentLoaded', () => {
    const storedUser = localStorage.getItem('chatUser');
    if (storedUser) {
        currentUser = JSON.parse(storedUser);
        initializeChat();
    } else {
        elements.modal.classList.remove('hidden');
    }
});

elements.acceptBtn.addEventListener('click', () => {
    const name = elements.guestInput.value.trim();
    
    if (name.length < 3) {
        elements.loginError.textContent = "الاسم يجب أن يكون 3 أحرف على الأقل";
        return;
    }
    
    // إنشاء مستخدم جديد
    currentUser = {
        id: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        name: name
    };
    
    localStorage.setItem('chatUser', JSON.stringify(currentUser));
    initializeChat();
});

elements.logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('chatUser');
    location.reload();
});

function initializeChat() {
    elements.modal.classList.add('hidden');
    elements.userInfo.classList.remove('hidden');
    elements.inputArea.classList.remove('hidden');
    
    elements.userName.textContent = currentUser.name;
    elements.userAvatar.textContent = currentUser.name.charAt(0).toUpperCase();
    
    loadMessages();
}

// === 2. التحقق من المحتوى (الأمان) ===

function validateContent(text) {
    elements.securityWarning.textContent = "";

    // 1. منع الروابط (Links)
    const urlPattern = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|(\.[a-z]{2,}\/)/i;
    if (urlPattern.test(text)) {
        return "⛔ يمنع نشر الروابط الخارجية لأسباب أمنية.";
    }

    // 2. منع السوشيال ميديا (Social Media handles)
    const socialPattern = /(@[\w]+)|(facebook|instagram|snapchat|tiktok|telegram|whatsapp)/i;
    if (socialPattern.test(text)) {
        return "⛔ يمنع نشر حسابات التواصل الاجتماعي. المحادثة للتعليم فقط.";
    }

    // 3. منع الأرقام (أكثر من 3 أرقام متتالية - لمنع الهواتف)
    const numberPattern = /\d{4,}/; 
    // ملاحظة: نسمح بـ 3 أرقام (مثل 100، 360) ولكن نمنع 4 فأكثر (مثل 0100...)
    if (numberPattern.test(text)) {
        return "⛔ يمنع نشر الأرقام الطويلة أو أرقام الهواتف.";
    }

    // 4. منع الكلمات البذيئة
    const lowerText = text.toLowerCase();
    for (let word of BANNED_WORDS) {
        if (lowerText.includes(word)) {
            return "⛔ تحتوي الرسالة على كلمات غير لائقة.";
        }
    }

    return null; // النص سليم
}

// === 3. إدارة الرسائل ===

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
    const isMe = currentUser && msg.userId === currentUser.id;
    const isDeleted = msg.isDeleted === true;

    const div = document.createElement('div');
    div.className = `message ${isMe ? 'me' : 'others'}`;
    div.id = `msg-${msg.id}`;

    // معالجة الوقت
    let timeString = '';
    if (msg.timestamp) {
        const date = msg.timestamp.toDate();
        timeString = date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    }

    // الرد
    let replyHTML = '';
    if (msg.replyTo && !isDeleted) {
        replyHTML = `
            <div class="reply-context" onclick="scrollToMessage('${msg.replyTo.id}')">
                <small>رد على <b>${sanitize(msg.replyTo.name)}</b></small><br>
                <span>${sanitize(msg.replyTo.text)}</span>
            </div>
        `;
    }

    // المحتوى
    let contentHTML = '';
    if (isDeleted) {
        contentHTML = `<div class="msg-content deleted"><i class="fas fa-ban"></i> تم حذف الرسالة</div>`;
    } else {
        contentHTML = `
            <div class="msg-content">
                ${replyHTML}
                ${sanitize(msg.text)}
                <div style="text-align: left; font-size: 0.6rem; opacity: 0.6; margin-top: 5px;">${timeString}</div>
            </div>
        `;
    }

    // الأزرار
    let actionsHTML = '';
    if (!isDeleted) {
        actionsHTML = `
            <div class="msg-actions">
                <button class="action-btn reply-btn"><i class="fas fa-reply"></i></button>
                ${isMe ? `<button class="action-btn delete-btn"><i class="fas fa-trash"></i></button>` : ''}
            </div>
        `;
    }

    const initial = msg.userName ? msg.userName.charAt(0).toUpperCase() : '?';
    
    div.innerHTML = `
        ${!isMe ? `
            <div class="msg-header">
                <div class="msg-avatar-small">${initial}</div>
                <span>${sanitize(msg.userName)}</span>
            </div>` : ''}
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

elements.messageForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = elements.msgInput.value.trim();
    if (!text) return;

    // 🔒 التحقق الأمني قبل الإرسال
    const error = validateContent(text);
    if (error) {
        elements.securityWarning.textContent = error;
        elements.msgInput.classList.add('error-shake');
        setTimeout(() => elements.msgInput.classList.remove('error-shake'), 500);
        return;
    }

    try {
        const messageData = {
            text: text,
            userId: currentUser.id,
            userName: currentUser.name,
            timestamp: serverTimestamp(),
            isDeleted: false
        };

        if (currentReplyTo) {
            messageData.replyTo = {
                id: currentReplyTo.id,
                name: currentReplyTo.userName,
                text: currentReplyTo.text.substring(0, 30) + '...'
            };
        }

        await addDoc(collection(db, CHAT_COLLECTION), messageData);
        elements.msgInput.value = '';
        cancelReply(); 
    } catch (error) {
        console.error("Error:", error);
    }
});

// === بقية الدوال (نفس المنطق السابق مع تحديثات طفيفة) ===

async function deleteMessage(msgId) {
    if (confirm("حذف الرسالة؟")) {
        try {
            await updateDoc(doc(db, CHAT_COLLECTION, msgId), {
                isDeleted: true,
                text: ""
            });
        } catch (e) { console.error(e); }
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
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
};

// دالة التعقيم لمنع HTML Injection (مهمة جداً)
function sanitize(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#039;');
}
