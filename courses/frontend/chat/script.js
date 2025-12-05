// 1. Firebase Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
import { 
    getFirestore, collection, addDoc, onSnapshot, query, orderBy, 
    serverTimestamp, updateDoc, doc, getDoc, setDoc, 
    arrayUnion, arrayRemove, increment, runTransaction 
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";

// --- استيراد مكتبة فلترة الكلمات البذيئة (احترافي) ---
import Filter from 'https://cdn.skypack.dev/bad-words';

// 2. Firebase Configuration
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

const CHAT_COLLECTION = 'frontend-chat'; 

// 3. Security Constants & Configuration
const filter = new Filter();

// إضافة قائمة كلمات عربية وإنجليزية مخصصة للحظر (يمكنك زيادة هذه القائمة)
const CUSTOM_BAD_WORDS = ["احمق", "غبي", "حيوان", "كلب", "زباله", "سافل", "حقير", "sexy", "porn", "xxx"];
filter.addWords(...CUSTOM_BAD_WORDS);

// منع الروابط بجميع أشكالها (com, net, org, http, www, etc)
const LINK_REGEX = /((https?:\/\/)|(www\.))|(\.[a-z]{2,3}(\/|\s|$))/i;
const DOMAIN_EXTENSIONS = /\.(com|net|org|edu|gov|io|co|biz|info|me)\b/i;

// منع الأرقام (أكثر من 3 أرقام متتالية - مثل أرقام الهواتف)
const PHONE_NUMBER_REGEX = /\d{4,}/; 

// 4. DOM Elements
const elements = {
    themeToggle: document.getElementById('themeToggle'),
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
    cancelReplyBtn: document.getElementById('cancelReplyBtn'),
    securityAlert: document.getElementById('securityAlert'),
    alertMessage: document.getElementById('alertMessage'),
    setupModal: document.getElementById('setupModal'),
    setupDisplayName: document.getElementById('setupDisplayName'),
    checkAge: document.getElementById('checkAge'),
    checkTerms: document.getElementById('checkTerms'),
    checkConduct: document.getElementById('checkConduct'),
    completeSetupBtn: document.getElementById('completeSetupBtn'),
    activeUsersBar: document.getElementById('activeUsersBar'),
    activeCount: document.getElementById('activeCount')
};

let currentReplyTo = null;
let chatDisplayName = null; 
let unsubscribeChat = null; 
let unsubscribeUsers = null;
let usersCache = {}; 

// --- Theme Logic ---
function initTheme() {
    const savedTheme = localStorage.getItem('chatTheme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        elements.themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        elements.themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }
}

elements.themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    const isLight = document.body.classList.contains('light-mode');
    elements.themeToggle.innerHTML = isLight ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    localStorage.setItem('chatTheme', isLight ? 'light' : 'dark');
});
initTheme();

// --- Auth & Setup ---
onAuthStateChanged(auth, async (user) => {
    if (user) {
        elements.loginBtn.classList.add('hidden');
        elements.userInfo.classList.remove('hidden');
        elements.userAvatar.src = user.photoURL || 'https://via.placeholder.com/32';
        await checkUserProfile(user);
    } else {
        handleLogoutUI();
    }
});

elements.loginBtn.addEventListener('click', async () => {
    try { await signInWithPopup(auth, new GoogleAuthProvider()); } catch (error) { console.error(error); }
});

elements.logoutBtn.addEventListener('click', () => signOut(auth));

function handleLogoutUI() {
    elements.loginBtn.classList.remove('hidden');
    elements.userInfo.classList.add('hidden');
    elements.messagesList.innerHTML = '<div class="loading-spinner">Please Sign In to Join</div>';
    elements.msgInput.disabled = true;
    elements.sendBtn.disabled = true;
    elements.setupModal.classList.add('hidden');
    elements.activeUsersBar.classList.add('hidden');
    if (unsubscribeChat) unsubscribeChat();
    if (unsubscribeUsers) unsubscribeUsers();
}

async function checkUserProfile(user) {
    try {
        const docRef = doc(db, 'user-profiles', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists() && docSnap.data().chatInfo) {
            chatDisplayName = docSnap.data().chatInfo.displayName;
            elements.userName.textContent = chatDisplayName;
            enableChat();
        } else {
            elements.setupDisplayName.value = user.displayName || '';
            elements.setupModal.classList.remove('hidden');
        }
    } catch (e) { console.error(e); }
}

// Setup Form
function validateSetup() {
    // Check profanity in username too
    const name = elements.setupDisplayName.value.trim();
    if(filter.isProfane(name)) {
        elements.setupDisplayName.style.borderColor = 'red';
        return;
    } else {
        elements.setupDisplayName.style.borderColor = '';
    }

    const valid = name.length >= 3 && 
                 elements.checkAge.checked && elements.checkTerms.checked && elements.checkConduct.checked;
    elements.completeSetupBtn.disabled = !valid;
}
[elements.setupDisplayName, elements.checkAge, elements.checkTerms, elements.checkConduct].forEach(el => {
    if(el) el.addEventListener('change', validateSetup);
});
if(elements.setupDisplayName) elements.setupDisplayName.addEventListener('input', validateSetup);

if(elements.completeSetupBtn) {
    elements.completeSetupBtn.addEventListener('click', async () => {
        const user = auth.currentUser;
        if (!user) return;
        const name = elements.setupDisplayName.value.trim();
        
        if (filter.isProfane(name)) {
            alert("Please choose a respectful display name.");
            return;
        }

        try {
            await setDoc(doc(db, 'user-profiles', user.uid), {
                chatInfo: { displayName: name, joinedAt: serverTimestamp() },
                totalLikes: 0,
                lastActive: serverTimestamp()
            }, { merge: true });
            
            elements.setupModal.classList.add('hidden');
            chatDisplayName = name;
            elements.userName.textContent = chatDisplayName;
            enableChat();
        } catch (e) { alert("Error saving profile"); }
    });
}

function enableChat() {
    elements.msgInput.disabled = false;
    elements.sendBtn.disabled = false;
    loadMessages();
    trackActiveUsers();
}

// --- Active Users ---
function trackActiveUsers() {
    const user = auth.currentUser;
    if (user) {
        const update = () => updateDoc(doc(db, 'user-profiles', user.uid), { lastActive: serverTimestamp() }).catch(()=>{});
        update();
        setInterval(update, 60000);
    }

    const q = query(collection(db, 'user-profiles'));
    unsubscribeUsers = onSnapshot(q, (snapshot) => {
        let count = 0;
        const cutoff = new Date(Date.now() - 5 * 60000); 
        snapshot.forEach(d => {
            const data = d.data();
            usersCache[d.id] = data.totalLikes || 0;
            if (data.lastActive) {
                const last = data.lastActive.toDate ? data.lastActive.toDate() : new Date(data.lastActive);
                if (last > cutoff) count++;
            }
        });
        elements.activeUsersBar.classList.remove('hidden');
        elements.activeCount.textContent = count;
    });
}

// --- Chat Logic ---
function loadMessages() {
    const q = query(collection(db, CHAT_COLLECTION), orderBy('timestamp', 'asc'));
    unsubscribeChat = onSnapshot(q, (snapshot) => {
        elements.messagesList.innerHTML = '';
        snapshot.forEach(doc => renderMessage({ ...doc.data(), id: doc.id }));
        scrollToBottom();
    });
}

// *** SECURITY & SENDING LOGIC ***
elements.messageForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    let text = elements.msgInput.value.trim();
    if (!text) return;

    // 1. Check for Profanity (Using Library)
    if (filter.isProfane(text)) {
        showSecurityAlert("Respectful language is required. Bad words detected.");
        return;
    }

    // 2. Check for Links & Domains
    if (LINK_REGEX.test(text) || DOMAIN_EXTENSIONS.test(text)) {
        showSecurityAlert("Links (URLs) are not allowed for security reasons.");
        return;
    }

    // 3. Check for Long Numbers (Phone numbers/IDs)
    if (PHONE_NUMBER_REGEX.test(text)) {
        showSecurityAlert("Sharing phone numbers or long IDs is strictly prohibited.");
        return;
    }

    const user = auth.currentUser;
    try {
        const payload = {
            text, // Text is now clean
            userId: user.uid, 
            userName: chatDisplayName, 
            userPhoto: user.photoURL,
            timestamp: serverTimestamp(), 
            isDeleted: false, 
            likes: 0, 
            likedBy: []
        };
        if (currentReplyTo) {
            payload.replyTo = { id: currentReplyTo.id, name: currentReplyTo.userName, text: currentReplyTo.text };
        }
        await addDoc(collection(db, CHAT_COLLECTION), payload);
        elements.msgInput.value = '';
        cancelReply();
    } catch (e) { console.error(e); }
});

function renderMessage(msg) {
    const isMe = auth.currentUser && msg.userId === auth.currentUser.uid;
    const div = document.createElement('div');
    div.className = `message ${isMe ? 'me' : 'others'}`;
    div.id = `msg-${msg.id}`;
    
    if (msg.isDeleted) {
        div.innerHTML = `<div class="msg-content deleted"><small>Deleted Message</small></div>`;
        elements.messagesList.appendChild(div);
        return;
    }

    const likes = msg.likes || 0;
    const isLiked = auth.currentUser && msg.likedBy && msg.likedBy.includes(auth.currentUser.uid);
    const badgeHTML = getBadge(usersCache[msg.userId] || 0);

    let replyHTML = '';
    if (msg.replyTo) {
        replyHTML = `<div class="reply-context" onclick="scrollToMsg('${msg.replyTo.id}')">
            <small>Reply to: <b>${sanitize(msg.replyTo.name)}</b></small>
            <div style="opacity:0.7; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:200px;">${sanitize(msg.replyTo.text)}</div>
        </div>`;
    }

    div.innerHTML = `
        ${!isMe ? `<div class="msg-header"><img src="${msg.userPhoto}" class="msg-avatar"> <b>${sanitize(msg.userName)}</b> ${badgeHTML}</div>` : ''}
        <div class="msg-content">
            ${replyHTML}
            ${sanitize(msg.text)}
            <div style="display:flex; justify-content:space-between; margin-top:5px; font-size:0.7rem; opacity:0.6; align-items:center;">
                <span>${msg.timestamp ? msg.timestamp.toDate().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : '...'}</span>
                <div class="like-container">
                    <span>${likes || ''}</span>
                    <button class="like-btn ${isLiked ? 'liked' : ''}"><i class="${isLiked ? 'fas' : 'far'} fa-heart"></i></button>
                </div>
            </div>
        </div>
        <div class="msg-actions">
            <button class="action-btn reply-btn"><i class="fas fa-reply"></i></button>
            ${isMe ? `<button class="action-btn delete-btn"><i class="fas fa-trash"></i></button>` : ''}
        </div>
    `;

    div.querySelector('.reply-btn').onclick = () => initiateReply(msg);
    if(isMe) div.querySelector('.delete-btn').onclick = () => deleteMsg(msg.id);
    const likeBtn = div.querySelector('.like-btn');
    if(!isMe) likeBtn.onclick = () => toggleLike(msg);

    elements.messagesList.appendChild(div);
}

function getBadge(likes) {
    if (likes > 500) return '<span class="user-badge badge-helper"><i class="fas fa-crown"></i> Expert</span>';
    if (likes > 100) return '<span class="user-badge badge-helper"><i class="fas fa-star"></i> Active</span>';
    return '';
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
if(elements.cancelReplyBtn) elements.cancelReplyBtn.onclick = cancelReply;

async function toggleLike(msg) {
    const user = auth.currentUser;
    if(!user || user.uid === msg.userId) return;
    const ref = doc(db, CHAT_COLLECTION, msg.id);
    const profileRef = doc(db, 'user-profiles', msg.userId);
    const isLiked = msg.likedBy && msg.likedBy.includes(user.uid);

    try {
        await runTransaction(db, async (t) => {
            t.update(ref, {
                likes: increment(isLiked ? -1 : 1),
                likedBy: isLiked ? arrayRemove(user.uid) : arrayUnion(user.uid)
            });
            t.update(profileRef, { totalLikes: increment(isLiked ? -1 : 1) });
        });
    } catch(e) { console.error(e); }
}

async function deleteMsg(id) {
    if(confirm("Delete this message?")) {
        await updateDoc(doc(db, CHAT_COLLECTION, id), { isDeleted: true, text: '', likes: 0 });
    }
}

function showSecurityAlert(msg) {
    elements.alertMessage.textContent = msg;
    elements.securityAlert.classList.remove('hidden');
    setTimeout(() => elements.securityAlert.classList.add('hidden'), 3000);
}

function scrollToBottom() { elements.messagesList.scrollTop = elements.messagesList.scrollHeight; }

window.scrollToMsg = (id) => {
    const el = document.getElementById(`msg-${id}`);
    if(el) el.scrollIntoView({behavior: "smooth", block: "center"});
};

function sanitize(str) {
    const d = document.createElement('div'); d.textContent = str; return d.innerHTML;
}
