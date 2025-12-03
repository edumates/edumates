// 1. استيراد دوال Firebase (نفس الإصدار المستخدم في ملفاتك)
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, updateDoc, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";

// 2. إعدادات Firebase (من ملفك courses-det-script.js)
const firebaseConfig = {
    apiKey: "AIzaSyBhCxGjQOQ88b2GynL515ZYQXqfiLPhjw4",
    authDomain: "edumates-983dd.firebaseapp.com",
    projectId: "edumates-983dd",
    storageBucket: "edumates-983dd.firebasestorage.app",
    messagingSenderId: "172548876353",
    appId: "1:172548876353:web:955b1f41283d26c44c3ec0",
    measurementId: "G-L1KCZTW8R9"
};

// تهيئة التطبيق
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const CHAT_COLLECTION = 'community-messages'; // اسم المجموعة الجديدة في قاعدة البيانات

// 3. عناصر DOM
const elements = {
    loginBtn: document.getElementById('loginBtn'),
    logoutBtn: document.getElementById('logoutBtn'),
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
    cancelReplyBtn: document.getElementById('cancelReplyBtn')
};

// متغير لتخزين حالة الرد الحالية
let currentReplyTo = null; // { id: "msgId", name: "Ahmed", text: "hello" }

// 4. إدارة المصادقة (Authentication)
onAuthStateChanged(auth, (user) => {
    if (user) {
        // حالة تسجيل الدخول
        elements.loginBtn.classList.add('hidden');
        elements.userInfo.classList.remove('hidden');
        elements.userAvatar.src = user.photoURL;
        elements.userName.textContent = user.displayName.split(' ')[0]; // الاسم الأول فقط
        
        elements.msgInput.disabled = false;
        elements.sendBtn.disabled = false;
        
        loadMessages(); // بدء تحميل الرسائل
    } else {
        // حالة تسجيل الخروج
        elements.loginBtn.classList.remove('hidden');
        elements.userInfo.classList.add('hidden');
        elements.messagesList.innerHTML = '<div class="loading-spinner">يرجى تسجيل الدخول لرؤية المحادثة</div>';
        elements.msgInput.disabled = true;
        elements.sendBtn.disabled = true;
    }
});

elements.loginBtn.addEventListener('click', () => signInWithPopup(auth, new GoogleAuthProvider()));
elements.logoutBtn.addEventListener('click', () => signOut(auth));

// 5. تحميل الرسائل وعرضها (Real-time)
function loadMessages() {
    const q = query(collection(db, CHAT_COLLECTION), orderBy('timestamp', 'asc'));

    onSnapshot(q, (snapshot) => {
        elements.messagesList.innerHTML = ''; // مسح القائمة لإعادة بنائها (يمكن تحسين الأداء لاحقاً)
        
        snapshot.forEach((docSnap) => {
            const msg = docSnap.data();
            msg.id = docSnap.id;
            renderMessage(msg);
        });

        scrollToBottom();
    });
}

// دالة عرض الرسالة الواحدة
function renderMessage(msg) {
    const currentUser = auth.currentUser;
    const isMe = currentUser && msg.userId === currentUser.uid;
    const isDeleted = msg.isDeleted === true;

    const div = document.createElement('div');
    div.className = `message ${isMe ? 'me' : 'others'}`;
    div.id = `msg-${msg.id}`;

    // معالجة الوقت
    let timeString = '';
    if (msg.timestamp) {
        const date = msg.timestamp.toDate();
        timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    // محتوى الرد (إذا كانت الرسالة رداً على أخرى)
    let replyHTML = '';
    if (msg.replyTo && !isDeleted) {
        replyHTML = `
            <div class="reply-context" onclick="scrollToMessage('${msg.replyTo.id}')">
                <small>رد على <b>${sanitize(msg.replyTo.name)}</b></small><br>
                <span style="opacity:0.8">${sanitize(msg.replyTo.text)}</span>
            </div>
        `;
    }

    // محتوى النص (محذوف أم عادي)
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

    // أزرار التحكم (رد / حذف)
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
        ${!isMe ? `<div class="msg-header"><img src="${msg.userPhoto}" class="msg-avatar"> <span>${sanitize(msg.userName)}</span></div>` : ''}
        ${contentHTML}
        ${actionsHTML}
    `;

    // تفعيل أزرار الرد والحذف
    if (!isDeleted) {
        const replyBtn = div.querySelector('.reply-btn');
        const deleteBtn = div.querySelector('.delete-btn');

        if (replyBtn) {
            replyBtn.addEventListener('click', () => initiateReply(msg));
        }
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => deleteMessage(msg.id));
        }
    }

    elements.messagesList.appendChild(div);
}

// 6. إرسال الرسالة
elements.messageForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = elements.msgInput.value.trim();
    if (!text) return;

    const user = auth.currentUser;
    
    try {
        const messageData = {
            text: text,
            userId: user.uid,
            userName: user.displayName,
            userPhoto: user.photoURL,
            timestamp: serverTimestamp(),
            isDeleted: false
        };

        // إذا كان هناك رد
        if (currentReplyTo) {
            messageData.replyTo = {
                id: currentReplyTo.id,
                name: currentReplyTo.userName,
                text: currentReplyTo.text.substring(0, 50) + (currentReplyTo.text.length > 50 ? '...' : '')
            };
        }

        await addDoc(collection(db, CHAT_COLLECTION), messageData);
        
        // إعادة تعيين الحقول
        elements.msgInput.value = '';
        cancelReply(); 
    } catch (error) {
        console.error("خطأ في الإرسال:", error);
    }
});

// 7. منطق الحذف (Soft Delete)
async function deleteMessage(msgId) {
    if (confirm("هل أنت متأكد من أنك تريد حذف هذه الرسالة؟ سيبقى مكانها محفوظاً.")) {
        try {
            const msgRef = doc(db, CHAT_COLLECTION, msgId);
            await updateDoc(msgRef, {
                isDeleted: true,
                text: "" // نمسح النص الأصلي للحماية
            });
        } catch (error) {
            console.error("فشل الحذف:", error);
            alert("حدث خطأ أثناء الحذف");
        }
    }
}

// 8. منطق الرد
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

// 9. دوال مساعدة
function scrollToBottom() {
    elements.messagesList.scrollTop = elements.messagesList.scrollHeight;
}

// دالة لتمرير الشاشة إلى الرسالة الأصلية عند الضغط على الرد
window.scrollToMessage = function(msgId) {
    const el = document.getElementById(`msg-${msgId}`);
    if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.style.backgroundColor = '#ffffff20'; // ومضة بسيطة للتمييز
        setTimeout(() => el.style.backgroundColor = 'transparent', 1000);
    } else {
        alert("الرسالة الأصلية قديمة جداً ولم تعد ظاهرة في الشاشة الحالية");
    }
};

function sanitize(str) {
    if (!str) return '';
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}