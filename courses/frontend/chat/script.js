// 1. استيراد دوال Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, updateDoc, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";

// 2. إعدادات Firebase (نفس الإعدادات المستخدمة في courses-det-script.js)
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

// اسم المجموعة تم تغييره ليتطابق مع طلبك
const CHAT_COLLECTION = 'frontend-chat'; 

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
    
    // عناصر الرد
    replyPreview: document.getElementById('replyPreview'),
    replyToUser: document.getElementById('replyToUser'),
    replyToText: document.getElementById('replyToText'),
    cancelReplyBtn: document.getElementById('cancelReplyBtn'),

    // عناصر التنبيهات والنافذة المنبثقة
    securityAlert: document.getElementById('securityAlert'),
    alertMessage: document.getElementById('alertMessage'),
    
    setupModal: document.getElementById('setupModal'),
    setupDisplayName: document.getElementById('setupDisplayName'),
    checkAge: document.getElementById('checkAge'),
    checkTerms: document.getElementById('checkTerms'),
    checkConduct: document.getElementById('checkConduct'),
    completeSetupBtn: document.getElementById('completeSetupBtn')
};

// متغيرات عامة
let currentReplyTo = null;
let chatDisplayName = null; // سيتم جلبه من البروفايل
let unsubscribeChat = null; // لإيقاف الاستماع عند الخروج

// 4. إدارة المصادقة (Authentication Logic)
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // المستخدم مسجل دخوله (سواء من هنا أو من صفحة الكورسات)
        elements.loginBtn.classList.add('hidden');
        elements.userInfo.classList.remove('hidden');
        elements.userAvatar.src = user.photoURL || 'https://via.placeholder.com/35';
        
        // التحقق من البروفايل في user-profiles
        await checkUserProfile(user);
    } else {
        // حالة تسجيل الخروج
        handleLogoutUI();
    }
});

elements.loginBtn.addEventListener('click', async () => {
    try {
        await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (error) {
        console.error("Login Error:", error);
    }
});

elements.logoutBtn.addEventListener('click', () => signOut(auth));

function handleLogoutUI() {
    elements.loginBtn.classList.remove('hidden');
    elements.userInfo.classList.add('hidden');
    elements.messagesList.innerHTML = '<div class="loading-spinner">يرجى تسجيل الدخول لرؤية المحادثة</div>';
    elements.msgInput.disabled = true;
    elements.sendBtn.disabled = true;
    elements.setupModal.classList.add('hidden');
    
    if (unsubscribeChat) {
        unsubscribeChat();
        unsubscribeChat = null;
    }
}

// 5. التحقق من البروفايل والموافقة (Profile Check)
async function checkUserProfile(user) {
    try {
        const docRef = doc(db, 'user-profiles', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists() && docSnap.data().chatInfo) {
            // المستخدم لديه بروفايل وموافق على الشروط
            const data = docSnap.data().chatInfo;
            chatDisplayName = data.displayName;
            elements.userName.textContent = chatDisplayName;
            enableChat();
        } else {
            // مستخدم جديد أو لم يوافق بعد -> إظهار النافذة
            elements.setupDisplayName.value = user.displayName || '';
            elements.setupModal.classList.remove('hidden');
        }
    } catch (error) {
        console.error("Profile Error:", error);
        alert("حدث خطأ أثناء تحميل البيانات");
    }
}

// 6. منطق نافذة الإعداد (Setup Modal)
function validateSetupForm() {
    const name = elements.setupDisplayName.value.trim();
    const isAge = elements.checkAge.checked;
    const isTerms = elements.checkTerms.checked;
    const isConduct = elements.checkConduct.checked;

    if (name.length >= 3 && isAge && isTerms && isConduct) {
        elements.completeSetupBtn.disabled = false;
    } else {
        elements.completeSetupBtn.disabled = true;
    }
}

// تفعيل التحقق عند تغيير المدخلات
[elements.setupDisplayName, elements.checkAge, elements.checkTerms, elements.checkConduct].forEach(el => {
    el.addEventListener('input', validateSetupForm);
    el.addEventListener('change', validateSetupForm);
});

elements.completeSetupBtn.addEventListener('click', async () => {
    const user = auth.currentUser;
    if (!user) return;

    elements.completeSetupBtn.textContent = "جاري الحفظ...";
    const name = elements.setupDisplayName.value.trim();

    try {
        // حفظ البيانات في user-profiles
        await setDoc(doc(db, 'user-profiles', user.uid), {
            chatInfo: {
                displayName: name,
                termsAccepted: true,
                ageConfirmed: true,
                joinedAt: serverTimestamp()
            }
        }, { merge: true });

        elements.setupModal.classList.add('hidden');
        chatDisplayName = name;
        elements.userName.textContent = name;
        enableChat();
    } catch (error) {
        console.error("Save Error:", error);
        alert("فشل حفظ البيانات");
    }
});

// 7. تفعيل المحادثة وتحميل الرسائل
function enableChat() {
    elements.msgInput.disabled = false;
    elements.sendBtn.disabled = false;
    loadMessages();
}

function loadMessages() {
    const q = query(collection(db, CHAT_COLLECTION), orderBy('timestamp', 'asc'));

    unsubscribeChat = onSnapshot(q, (snapshot) => {
        elements.messagesList.innerHTML = '';
        
        snapshot.forEach((docSnap) => {
            const msg = docSnap.data();
            msg.id = docSnap.id;
            renderMessage(msg);
        });
        scrollToBottom();
    });
}

// 8. نظام الفلاتر والأمان (Security Filters)
function containsForbiddenContent(text) {
    // 1. منع الروابط (com, net, http, www, etc)
    const urlPattern = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|(\.[a-z]{2,}(\/|\s|$))/i;
    
    // 2. منع أكثر من 3 أرقام متتالية
    const numberPattern = /\d{4,}/; 

    // 3. كلمات بذيئة أو سوشال ميديا (قائمة مصغرة كمثال)
    const badWords = [
        "facebook", "instagram", "tiktok", "snapchat", "twitter", "whatsapp",
        "sex", "xxx", "porn", "quack", "stupid", // أمثلة إنجليزية
        "غبي", "حقير", "سافل", "رقمي", "تعال خاص" // أمثلة عربية
    ];

    if (urlPattern.test(text)) return "يمنع إرسال الروابط الخارجية.";
    if (numberPattern.test(text)) return "يمنع كتابة سلاسل أرقام طويلة (أرقام الهواتف).";
    
    const lowerText = text.toLowerCase();
    for (let word of badWords) {
        if (lowerText.includes(word)) return "تحتوي الرسالة على كلمات أو منصات محظورة.";
    }

    return null; // آمن
}

function showSecurityAlert(message) {
    elements.alertMessage.textContent = message;
    elements.securityAlert.classList.remove('hidden');
    
    // إخفاء الشريط بعد 3 ثواني
    setTimeout(() => {
        elements.securityAlert.classList.add('hidden');
    }, 3000);
}

// 9. إرسال الرسالة
elements.messageForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = elements.msgInput.value.trim();
    if (!text) return;

    // فحص الأمان قبل الإرسال
    const violation = containsForbiddenContent(text);
    if (violation) {
        showSecurityAlert(violation);
        return; // توقف، لا ترسل
    }

    const user = auth.currentUser;
    
    try {
        const messageData = {
            text: text,
            userId: user.uid,
            userName: chatDisplayName || user.displayName, // استخدام الاسم المختار
            userPhoto: user.photoURL || 'https://via.placeholder.com/35',
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
        console.error("Send Error:", error);
    }
});

// 10. عرض الرسائل
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

    let contentHTML = '';
    if (isDeleted) {
        contentHTML = `<div class="msg-content deleted"><i class="fas fa-ban"></i> تم حذف هذه الرسالة من قبل المرسل</div>`;
    } else {
        // إذا كان هناك رد
        let replyHTML = '';
        if (msg.replyTo) {
            replyHTML = `
                <div class="reply-context" onclick="scrollToMessage('${msg.replyTo.id}')">
                    <small>رد على <b>${sanitize(msg.replyTo.name)}</b></small><br>
                    <span style="opacity:0.8">${sanitize(msg.replyTo.text)}</span>
                </div>
            `;
        }

        contentHTML = `
            <div class="msg-content">
                ${replyHTML}
                ${sanitize(msg.text)}
                <div style="text-align: left; font-size: 0.65rem; opacity: 0.6; margin-top: 5px;">${timeString}</div>
            </div>
        `;
    }

    // أزرار التحكم
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

    // تفعيل الأزرار
    if (!isDeleted) {
        const replyBtn = div.querySelector('.reply-btn');
        const deleteBtn = div.querySelector('.delete-btn');

        if (replyBtn) replyBtn.addEventListener('click', () => initiateReply(msg));
        if (deleteBtn) deleteBtn.addEventListener('click', () => deleteMessage(msg.id));
    }

    elements.messagesList.appendChild(div);
}

// 11. وظائف إضافية (الحذف، الرد، التنظيف)
async function deleteMessage(msgId) {
    if (confirm("حذف الرسالة؟")) {
        try {
            await updateDoc(doc(db, CHAT_COLLECTION, msgId), {
                isDeleted: true,
                text: ""
            });
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
if(elements.cancelReplyBtn) elements.cancelReplyBtn.addEventListener('click', cancelReply);

function scrollToBottom() {
    elements.messagesList.scrollTop = elements.messagesList.scrollHeight;
}

window.scrollToMessage = function(msgId) {
    const el = document.getElementById(`msg-${msgId}`);
    if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.style.backgroundColor = '#ffffff20';
        setTimeout(() => el.style.backgroundColor = 'transparent', 1000);
    }
};

function sanitize(str) {
    if (!str) return '';
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}
