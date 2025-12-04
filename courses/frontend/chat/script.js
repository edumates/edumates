// 1. استيراد دوال Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
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
const CHAT_COLLECTION = 'frontend-chat'; // الاسم الجديد للمجموعة

// 3. عناصر DOM
const elements = {
    userInfo: document.getElementById('userInfo'),
    userAvatar: document.getElementById('userAvatar'),
    userName: document.getElementById('userName'),
    messagesList: document.getElementById('messagesList'),
    messageForm: document.getElementById('messageForm'),
    msgInput: document.getElementById('msgInput'),
    sendBtn: document.getElementById('sendBtn'),
    replyPreview: document.getElementById('replyPreview'),
    replyToUser: document.getElementById('replyToUser'),
    replyToText: document.getElementById('replyToText'),
    cancelReplyBtn: document.getElementById('cancelReplyBtn'),
    alertBar: document.getElementById('alertBar'),
    alertText: document.getElementById('alertText'),
    termsModal: document.getElementById('termsModal'),
    acceptTermsBtn: document.getElementById('acceptTermsBtn')
};

// متغيرات الحالة
let currentReplyTo = null;
let localUserData = JSON.parse(localStorage.getItem('chatUser')) || null;

// 4. إدارة شاشة الترحيب والشروط
function checkTerms() {
    if (!localStorage.getItem('termsAccepted')) {
        elements.termsModal.classList.remove('hidden');
    } else {
        elements.termsModal.classList.add('hidden');
        initChat();
    }
}

elements.acceptTermsBtn.addEventListener('click', () => {
    localStorage.setItem('termsAccepted', 'true');
    elements.termsModal.classList.add('hidden');
    initChat();
});

// بدء التشغيل
checkTerms();

// 5. تهيئة الدردشة والمستخدم
function initChat() {
    // تسجيل الدخول بشكل مجهول في الخلفية للاتصال بقاعدة البيانات
    signInAnonymously(auth).catch((error) => {
        console.error("خطأ في الاتصال:", error);
    });

    // توليد بيانات مستخدم عشوائية إذا لم تكن موجودة
    if (!localUserData) {
        const randomNum = Math.floor(Math.random() * 10000);
        localUserData = {
            displayName: `طالب ${randomNum}`,
            photoURL: `https://ui-avatars.com/api/?name=St+${randomNum}&background=random&color=fff`,
            uid: 'user_' + Date.now() + '_' + Math.floor(Math.random() * 1000)
        };
        localStorage.setItem('chatUser', JSON.stringify(localUserData));
    }

    // عرض بيانات المستخدم
    elements.userInfo.classList.remove('hidden');
    elements.userName.textContent = localUserData.displayName;
    elements.userAvatar.src = localUserData.photoURL;

    // تشغيل الاستماع للرسائل
    loadMessages();
}

// 6. تحميل الرسائل
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

// عرض الرسالة
function renderMessage(msg) {
    // نستخدم المعرف المخزن محلياً لتحديد ما إذا كانت الرسالة لي
    const isMe = localUserData && msg.localUid === localUserData.uid;
    const isDeleted = msg.isDeleted === true;

    const div = document.createElement('div');
    div.className = `message ${isMe ? 'me' : 'others'}`;
    div.id = `msg-${msg.id}`;

    let timeString = '';
    if (msg.timestamp) {
        const date = msg.timestamp.toDate();
        timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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

    let contentHTML = isDeleted 
        ? `<div class="msg-content deleted"><i class="fas fa-ban"></i> تم حذف الرسالة</div>` 
        : `<div class="msg-content">${replyHTML} ${sanitize(msg.text)} 
           <div style="text-align: left; font-size: 0.65rem; opacity: 0.6; margin-top: 5px;">${timeString}</div></div>`;

    let actionsHTML = (!isDeleted) ? `
        <div class="msg-actions">
            <button class="action-btn reply-btn" title="رد"><i class="fas fa-reply"></i></button>
            ${isMe ? `<button class="action-btn delete-btn" title="حذف"><i class="fas fa-trash"></i></button>` : ''}
        </div>` : '';

    div.innerHTML = `
        ${!isMe ? `<div class="msg-header"><img src="${msg.userPhoto}" class="msg-avatar"> <span>${sanitize(msg.userName)}</span></div>` : ''}
        ${contentHTML}
        ${actionsHTML}
    `;

    if (!isDeleted) {
        div.querySelector('.reply-btn').addEventListener('click', () => initiateReply(msg));
        if (isMe) div.querySelector('.delete-btn').addEventListener('click', () => deleteMessage(msg.id));
    }

    elements.messagesList.appendChild(div);
}

// 7. نظام الحماية والفلترة (Validation System)
function validateMessage(text) {
    // 1. منع الروابط (com, net, http, www, etc)
    const urlPattern = /(\.com|\.net|\.org|\.io|\.gov|http:\/\/|https:\/\/|www\.)/i;
    if (urlPattern.test(text)) {
        return "يُمنع إرسال الروابط الخارجية.";
    }

    // 2. منع أرقام الهواتف (أكثر من 3 أرقام متتالية)
    // \d{4,} تعني 4 أرقام أو أكثر
    const phonePattern = /\d{4,}/;
    if (phonePattern.test(text)) {
        return "يُمنع كتابة أكثر من 3 أرقام متتالية.";
    }

    // 3. منع كلمات السوشيال ميديا
    const socialWords = ['facebook', 'instagram', 'twitter', 'snapchat', 'tiktok', 'whatsapp', 'telegram', 'فيسبوك', 'انستجرام', 'تويتر', 'سناب', 'تيك توك', 'واتس', 'تيليجرام'];
    if (new RegExp(socialWords.join("|"), "i").test(text)) {
        return "يُمنع ذكر منصات التواصل الاجتماعي.";
    }

    // 4. منع الكلمات البذيئة (قائمة قابلة للتوسيع)
    // ملاحظة: يمكنك إضافة كلمات أخرى هنا حسب الحاجة
    const badWords = ['كلمة_سيئة_1', 'كلمة_سيئة_2', 'احمق', 'غبي', 'شتيمة']; 
    if (new RegExp(badWords.join("|"), "i").test(text)) {
        return "الرسالة تحتوي على ألفاظ غير لائقة.";
    }

    return null; // لا توجد مخالفات
}

function showAlert(message) {
    elements.alertText.textContent = message;
    elements.alertBar.classList.remove('hidden');
    
    // إخفاء التنبيه بعد 3 ثواني
    setTimeout(() => {
        elements.alertBar.classList.add('hidden');
    }, 3000);
}

// 8. إرسال الرسالة
elements.messageForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = elements.msgInput.value.trim();
    if (!text) return;

    // التحقق من الأمان قبل الإرسال
    const validationError = validateMessage(text);
    if (validationError) {
        showAlert(validationError);
        return; // إيقاف الإرسال
    }

    try {
        const messageData = {
            text: text,
            localUid: localUserData.uid, // نستخدم المعرف المحلي للمقارنة
            userName: localUserData.displayName,
            userPhoto: localUserData.photoURL,
            timestamp: serverTimestamp(),
            isDeleted: false
        };

        if (currentReplyTo) {
            messageData.replyTo = {
                id: currentReplyTo.id,
                name: currentReplyTo.userName,
                text: currentReplyTo.text.substring(0, 50) + '...'
            };
        }

        await addDoc(collection(db, CHAT_COLLECTION), messageData);
        
        elements.msgInput.value = '';
        cancelReply(); 
    } catch (error) {
        console.error("خطأ:", error);
    }
});

// 9. وظائف مساعدة
async function deleteMessage(msgId) {
    if (confirm("حذف الرسالة؟")) {
        try {
            const msgRef = doc(db, CHAT_COLLECTION, msgId);
            await updateDoc(msgRef, { isDeleted: true, text: "" });
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

function sanitize(str) {
    if (!str) return '';
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}
