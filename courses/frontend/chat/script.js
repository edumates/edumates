// 1. استيراد دوال Firebase (نفس الإصدار المستخدم في ملفاتك)
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
import { 
    getFirestore, collection, addDoc, onSnapshot, query, orderBy, 
    serverTimestamp, updateDoc, doc, getDoc, setDoc 
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";

// 2. إعدادات Firebase (من ملفك courses-det-script.js)
const firebaseConfig = {
    apiKey: "AIzaSyBhCxGjQOQ88b2GynL515ZYQXQOQfiLPhjw4", // يجب تغيير هذا إلى مفتاحك الصحيح
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
const CHAT_COLLECTION = 'frontend-chat-messages'; // اسم المجموعة الجديدة في قاعدة البيانات
const USER_PROFILES_COLLECTION = 'user-profiles'; // مجموعة حفظ أسماء المستخدمين والموافقة

// 3. عناصر DOM
const elements = {
    loginBtn: document.getElementById('loginBtn'),
    logoutBtn: document.getElementById('logoutBtn'),
    userInfo: document.getElementById('userInfo'),
    userAvatar: document.getElementById('userAvatar'),
    userNameDisplay: document.getElementById('userName'), // تم تغيير الاسم لتجنب التعارض
    messagesList: document.getElementById('messagesList'),
    messageForm: document.getElementById('messageForm'),
    msgInput: document.getElementById('msgInput'),
    sendBtn: document.getElementById('sendBtn'),
    replyPreview: document.getElementById('replyPreview'),
    replyToUser: document.getElementById('replyToUser'),
    replyToText: document.getElementById('replyToText'),
    cancelReplyBtn: document.getElementById('cancelReplyBtn'),
    
    // عناصر النافذة المشروطة (الـ Modal)
    privacyModal: document.getElementById('privacyModal'),
    modalForm: document.getElementById('modalForm'),
    displayNameInput: document.getElementById('displayNameInput'),
    agreeCheckbox: document.getElementById('agreeCheckbox'),

    // شريط التنبيهات
    alertBar: document.getElementById('alertBar'),
    alertText: document.getElementById('alertText')
};

// متغير لتخزين حالة الرد الحالية
let currentReplyTo = null; // { id: "msgId", name: "Ahmed", text: "hello" }
let currentUserProfile = null; // لتخزين بيانات المستخدم (الاسم والموافقة)

// 4. إدارة المصادقة (Authentication)
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // 1. محاولة تحميل ملف المستخدم
        const userProfileRef = doc(db, USER_PROFILES_COLLECTION, user.uid);
        const profileSnap = await getDoc(userProfileRef);

        if (profileSnap.exists() && profileSnap.data().agreed) {
            // حالة تسجيل الدخول والموافقة المسبقة
            currentUserProfile = profileSnap.data();
            
            elements.privacyModal.close(); // إغلاق النافذة إذا كانت مفتوحة
            elements.loginBtn.classList.add('hidden');
            elements.userInfo.classList.remove('hidden');
            elements.userAvatar.src = user.photoURL;
            elements.userNameDisplay.textContent = currentUserProfile.displayName; 
            
            elements.msgInput.disabled = false;
            elements.sendBtn.disabled = false;
            
            loadMessages(); // بدء تحميل الرسائل
        } else {
            // حالة تسجيل الدخول ولكن لم يوافق بعد / أو لم يحدد الاسم
            elements.privacyModal.showModal();
            // إخفاء عناصر الدردشة مؤقتاً
            elements.loginBtn.classList.add('hidden');
            elements.userInfo.classList.remove('hidden');
            elements.userAvatar.src = user.photoURL;
            elements.userNameDisplay.textContent = user.displayName.split(' ')[0];
        }

    } else {
        // حالة تسجيل الخروج
        currentUserProfile = null;
        elements.privacyModal.close(); // التأكد من إغلاق النافذة
        elements.loginBtn.classList.remove('hidden');
        elements.userInfo.classList.add('hidden');
        elements.messagesList.innerHTML = '<div class="loading-spinner">يرجى تسجيل الدخول والموافقة على سياسة الخصوصية لرؤية المحادثة</div>';
        elements.msgInput.disabled = true;
        elements.sendBtn.disabled = true;
    }
});

// معالجة إرسال نموذج سياسة الخصوصية
elements.modalForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const displayName = elements.displayNameInput.value.trim();
    const agreed = elements.agreeCheckbox.checked;
    const user = auth.currentUser;

    if (!displayName) {
        showAlert('الرجاء إدخال اسم العرض الخاص بك.', 'error');
        return;
    }

    if (!agreed) {
        showAlert('يجب الموافقة على شروط الاستخدام وسياسة الخصوصية.', 'error');
        return;
    }

    if (displayName.length < 3 || displayName.length > 20) {
        showAlert('يجب أن يكون الاسم بين 3 و 20 حرفاً.', 'error');
        return;
    }

    try {
        const userProfileRef = doc(db, USER_PROFILES_COLLECTION, user.uid);
        await setDoc(userProfileRef, {
            displayName: displayName,
            agreed: true,
            email: user.email,
            createdAt: serverTimestamp()
        }, { merge: true }); // نستخدم merge لتجنب مسح البيانات الأخرى إن وجدت

        // إعادة تشغيل حالة المصادقة لتحديث الواجهة
        // هذا سيؤدي إلى إعادة تشغيل onAuthStateChanged و loadMessages
        window.location.reload(); 

    } catch (error) {
        console.error("خطأ في حفظ ملف المستخدم:", error);
        showAlert("فشل حفظ البيانات. حاول مرة أخرى.", 'error');
    }
});

elements.loginBtn.addEventListener('click', () => signInWithPopup(auth, new GoogleAuthProvider()));
elements.logoutBtn.addEventListener('click', () => signOut(auth));


// 5. تحميل الرسائل وعرضها (Real-time)
function loadMessages() {
    const q = query(collection(db, CHAT_COLLECTION), orderBy('timestamp', 'asc'));

    onSnapshot(q, (snapshot) => {
        elements.messagesList.innerHTML = ''; // مسح القائمة لإعادة بنائها 
        
        snapshot.forEach((docSnap) => {
            const msg = docSnap.data();
            msg.id = docSnap.id;
            renderMessage(msg);
        });

        scrollToBottom();
    }, (error) => {
        console.error("خطأ في تحميل الرسائل:", error);
        elements.messagesList.innerHTML = '<div class="loading-spinner danger">فشل تحميل المحادثة.</div>';
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

    // نستخدم msg.userName المخزن في قاعدة البيانات (الذي هو اسم العرض الذي اختاره المستخدم)
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
    if (!user || !currentUserProfile) return; // تأمين إضافي

    // ** التحقق من أمان المحتوى قبل الإرسال **
    const validationResult = validateMessage(text);
    if (!validationResult.isValid) {
        showAlert(validationResult.reason, 'error');
        elements.msgInput.value = ''; // مسح الإدخال
        return;
    }
    // **********************************
    
    try {
        const messageData = {
            text: text,
            userId: user.uid,
            // نستخدم الاسم الذي اختاره المستخدم
            userName: currentUserProfile.displayName, 
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
        showAlert("فشل إرسال الرسالة. حاول مرة أخرى.", 'error');
    }
});


// ** 7. دوال التحقق من المحتوى (الأمان والرقابة) **
const bannedTerms = [
    'www.', 'http', '.com', '.net', '.org', '.info', '.biz', 'tiktok', 'facebook', 'instagram', 
    'twitter', 'snapchat', 'porn', 'sex', 'fuck', 'shit', 'motherfucker', 'asshole', 'bitch',
    'كسمك', 'خول', 'شراميط', 'عرص', 'قحبة', 'نيك', 'احا', 'طيز', 'كس', 'زب'
    // يمكن إضافة المزيد من الكلمات والعبارات هنا
];

function validateMessage(text) {
    // التحويل إلى حروف صغيرة للتحقق السهل
    const lowerText = text.toLowerCase();

    // 1. منع الروابط وبعض الدومينات
    for (const term of ['.com', '.net', '.org', '.info', '.biz', 'www.', 'http']) {
        if (lowerText.includes(term)) {
            return { isValid: false, reason: 'يُمنع إرسال روابط الإنترنت.' };
        }
    }

    // 2. منع أدوات السوشيال ميديا التي لا علاقة لها بالتعليم
    for (const term of ['tiktok', 'facebook', 'instagram', 'twitter', 'snapchat']) {
        if (lowerText.includes(term)) {
            return { isValid: false, reason: 'يُمنع ذكر أدوات السوشيال ميديا غير التعليمية.' };
        }
    }

    // 3. منع تكرار الأرقام المتتالية (أكثر من ثلاث)
    if (/\d{3,}/.test(text)) {
        return { isValid: false, reason: 'يُمنع إرسال أكثر من ثلاث أرقام متتالية.' };
    }

    // 4. منع كلمات السب والجنسية والبذيئة
    for (const term of bannedTerms) {
        // نستخدم تعبير نمطي للبحث عن الكلمة سواء كانت جزء من كلمة أو كلمة منفردة
        const regex = new RegExp(`\\b${term}\\b|${term}`, 'i');
        if (regex.test(text)) {
             return { isValid: false, reason: 'يُمنع إرسال كلمات سب أو عبارات بذيئة.' };
        }
    }

    return { isValid: true };
}

// 8. منطق الحذف (Soft Delete)
async function deleteMessage(msgId) {
    if (confirm("هل أنت متأكد من أنك تريد حذف هذه الرسالة؟ سيبقى مكانها محفوظاً.")) {
        try {
            const msgRef = doc(db, CHAT_COLLECTION, msgId);
            await updateDoc(msgRef, {
                isDeleted: true,
                text: "تم حذف الرسالة بواسطة المستخدم." // نترك نصاً احتياطياً
            });
            showAlert("تم حذف الرسالة بنجاح.", 'success');
        } catch (error) {
            console.error("فشل الحذف:", error);
            showAlert("حدث خطأ أثناء الحذف", 'error');
        }
    }
}

// 9. منطق الرد
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

// 10. دوال مساعدة وشريط التنبيهات
function scrollToBottom() {
    elements.messagesList.scrollTop = elements.messagesList.scrollHeight;
}

window.scrollToMessage = function(msgId) {
    const el = document.getElementById(`msg-${msgId}`);
    if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.style.backgroundColor = 'rgba(74, 144, 226, 0.2)'; // ومضة بسيطة للتمييز
        setTimeout(() => el.style.backgroundColor = 'transparent', 1000);
    } else {
        showAlert("الرسالة الأصلية قديمة جداً ولم تعد ظاهرة في الشاشة الحالية", 'warning');
    }
};

let alertTimeout;
function showAlert(message, type = 'info') {
    elements.alertText.textContent = message;
    
    // إعادة تعيين الفئات
    elements.alertBar.className = 'alert-bar';
    elements.alertBar.classList.add(type);
    elements.alertBar.classList.add('visible');

    clearTimeout(alertTimeout);
    alertTimeout = setTimeout(() => {
        elements.alertBar.classList.remove('visible');
    }, 3000);
}

function sanitize(str) {
    if (!str) return '';
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}
