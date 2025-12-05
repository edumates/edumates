// script.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
import { 
    getFirestore, collection, addDoc, onSnapshot, query, orderBy, 
    serverTimestamp, updateDoc, doc, getDoc, setDoc, 
    arrayUnion, arrayRemove, increment, runTransaction 
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";

// --- Configuration ---
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

// --- Security Constants ---
// 1. Language Enforcement (Accepts Latin, Numbers, Common Punctuation)
const NON_ENGLISH_REGEX = /[^\x00-\x7F\u2000-\u206F\u00A0-\u00FF]/g; 
// 2. Anti-Spam (Links & Socials)
const URL_PATTERN = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/i;
const SOCIAL_MEDIA_PATTERN = /(@|fb\.com|t\.me|whatsapp)/i;
const PROFANITY_LIST = ["fuck", "shit", "bitch", "asshole", "dick"]; 

// --- DOM Elements ---
const el = {
    themeBtn: document.getElementById('themeToggle'),
    loginBtn: document.getElementById('loginBtn'),
    userInfo: document.getElementById('userInfo'),
    avatar: document.getElementById('userAvatar'),
    userName: document.getElementById('userName'),
    msgList: document.getElementById('messagesList'),
    form: document.getElementById('messageForm'),
    input: document.getElementById('msgInput'),
    sendBtn: document.getElementById('sendBtn'),
    replyPreview: document.getElementById('replyPreview'),
    securityAlert: document.getElementById('securityAlert'),
    alertMsg: document.getElementById('alertMessage'),
    setupModal: document.getElementById('setupModal'),
    setupName: document.getElementById('setupDisplayName'),
    setupBtn: document.getElementById('completeSetupBtn'),
    checkboxes: document.querySelectorAll('.setup-checkbox')
};

// State
let currentUserData = null;
let replyContext = null;
let lastSentTime = 0; // Rate limiting

// --- Theme Logic ---
function initTheme() {
    const theme = localStorage.getItem('chatTheme') || 'dark';
    if(theme === 'light') document.body.classList.add('light-mode');
    updateThemeIcon();
}
function updateThemeIcon() {
    const isLight = document.body.classList.contains('light-mode');
    el.themeBtn.innerHTML = isLight ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
}
el.themeBtn.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    localStorage.setItem('chatTheme', document.body.classList.contains('light-mode') ? 'light' : 'dark');
    updateThemeIcon();
});
initTheme();

// --- Auth & Profile ---
onAuthStateChanged(auth, async (user) => {
    if (user) {
        el.loginBtn.classList.add('hidden');
        el.userInfo.classList.remove('hidden');
        el.avatar.src = user.photoURL;
        
        // Load Profile
        const profile = await getDoc(doc(db, 'user-profiles', user.uid));
        if (profile.exists() && profile.data().chatInfo) {
            currentUserData = profile.data();
            el.userName.textContent = currentUserData.chatInfo.displayName;
            enableChat();
        } else {
            el.setupModal.classList.remove('hidden');
        }
    } else {
        disableChat();
    }
});

el.loginBtn.onclick = () => signInWithPopup(auth, new GoogleAuthProvider());
document.getElementById('logoutBtn').onclick = () => signOut(auth);

// --- Setup Form ---
function checkSetupValidity() {
    const nameValid = el.setupName.value.trim().length >= 3;
    const checksValid = Array.from(el.checkboxes).every(cb => cb.checked);
    el.setupBtn.disabled = !(nameValid && checksValid);
}
el.setupName.addEventListener('input', checkSetupValidity);
el.checkboxes.forEach(cb => cb.addEventListener('change', checkSetupValidity));

el.setupBtn.onclick = async () => {
    const user = auth.currentUser;
    if(!user) return;
    
    // Enforce English Name
    if(NON_ENGLISH_REGEX.test(el.setupName.value)) {
        alert("Please use an English display name.");
        return;
    }

    const name = el.setupName.value.trim();
    await setDoc(doc(db, 'user-profiles', user.uid), {
        chatInfo: { displayName: name, joined: serverTimestamp() },
        totalLikes: 0
    }, { merge: true });
    
    el.setupModal.classList.add('hidden');
    el.userName.textContent = name;
    enableChat();
};

// --- Chat Functionality ---
function enableChat() {
    el.input.disabled = false;
    el.sendBtn.disabled = false;
    el.msgList.innerHTML = ''; // Clear loading
    
    // Realtime Listener
    onSnapshot(query(collection(db, CHAT_COLLECTION), orderBy('timestamp', 'asc')), (snap) => {
        el.msgList.innerHTML = '';
        snap.forEach(doc => renderMessage(doc));
        el.msgList.scrollTop = el.msgList.scrollHeight;
    });
}

function disableChat() {
    el.input.disabled = true;
    el.loginBtn.classList.remove('hidden');
    el.userInfo.classList.add('hidden');
    el.msgList.innerHTML = '<div style="text-align:center; padding:20px; opacity:0.6">Please sign in to view the English Class Chat.</div>';
}

// --- Sending Messages (With Security Checks) ---
el.form.onsubmit = async (e) => {
    e.preventDefault();
    const text = el.input.value.trim();
    if(!text) return;

    // 1. Rate Limiting (1 message per second)
    const now = Date.now();
    if (now - lastSentTime < 1000) {
        showAlert("Please slow down!");
        return;
    }
    lastSentTime = now;

    // 2. Language Check (English Only)
    // Counts non-English characters. If user types Arabic, it gets flagged.
    if (NON_ENGLISH_REGEX.test(text)) {
        showAlert("English Only! 🇺🇸 Please write in English.");
        return;
    }

    // 3. Content Safety
    if (URL_PATTERN.test(text) || SOCIAL_MEDIA_PATTERN.test(text)) {
        showAlert("Links and social handles are prohibited.");
        return;
    }
    if (PROFANITY_LIST.some(word => text.toLowerCase().includes(word))) {
        showAlert("Please maintain academic language.");
        return;
    }

    // Send to Firebase
    try {
        const user = auth.currentUser;
        await addDoc(collection(db, CHAT_COLLECTION), {
            text: text,
            userId: user.uid,
            userName: el.userName.textContent,
            userPhoto: user.photoURL,
            timestamp: serverTimestamp(),
            likes: 0,
            likedBy: [],
            replyTo: replyContext
        });
        
        el.input.value = '';
        cancelReply();
    } catch(err) {
        console.error("Send Error:", err);
    }
};

// --- Rendering ---
function renderMessage(docItem) {
    const msg = docItem.data();
    const id = docItem.id;
    const isMe = auth.currentUser && msg.userId === auth.currentUser.uid;
    
    if(msg.isDeleted) return; 

    const div = document.createElement('div');
    div.className = `message ${isMe ? 'me' : 'others'}`;
    
    // Reply HTML
    let replyHtml = '';
    if(msg.replyTo) {
        replyHtml = `<div class="reply-context"><small><b>${sanitize(msg.replyTo.name)}</b>: ${sanitize(msg.replyTo.text.substring(0,30))}...</small></div>`;
    }

    // Badge Logic
    let badge = '';
    if(msg.likes > 10) badge = `<span class="user-badge"><i class="fas fa-star"></i> Top</span>`;

    div.innerHTML = `
        ${!isMe ? `<div class="msg-header"><img src="${msg.userPhoto}" class="msg-avatar-small"> ${sanitize(msg.userName)} ${badge}</div>` : ''}
        <div class="msg-content">
            ${replyHtml}
            ${sanitize(msg.text)}
            <div class="msg-footer">
                <span>${formatTime(msg.timestamp)}</span>
                ${!isMe ? `
                <div style="display:flex; align-items:center; gap:5px;">
                    <span>${msg.likes || 0}</span>
                    <button class="like-btn ${msg.likedBy?.includes(auth.currentUser?.uid) ? 'liked' : ''}" onclick="toggleLike('${id}')">
                        <i class="${msg.likedBy?.includes(auth.currentUser?.uid) ? 'fas' : 'far'} fa-heart"></i>
                    </button>
                    <i class="fas fa-reply" style="cursor:pointer; margin-left:5px;" onclick="setReply('${id}', '${sanitize(msg.userName)}', '${sanitize(msg.text)}')"></i>
                </div>` : ''}
            </div>
        </div>
    `;
    el.msgList.appendChild(div);
}

// --- Helpers ---
window.toggleLike = async (msgId) => {
    if(!auth.currentUser) return;
    const ref = doc(db, CHAT_COLLECTION, msgId);
    const snap = await getDoc(ref);
    if(!snap.exists()) return;
    
    const data = snap.data();
    const uid = auth.currentUser.uid;
    if(data.userId === uid) return; // Can't like own msg

    const isLiked = data.likedBy && data.likedBy.includes(uid);
    updateDoc(ref, {
        likes: increment(isLiked ? -1 : 1),
        likedBy: isLiked ? arrayRemove(uid) : arrayUnion(uid)
    });
};

window.setReply = (id, name, text) => {
    replyContext = { id, name, text };
    el.replyPreview.classList.remove('hidden');
    document.getElementById('replyToUser').textContent = name;
    el.input.focus();
};

function cancelReply() {
    replyContext = null;
    el.replyPreview.classList.add('hidden');
}
document.getElementById('cancelReplyBtn').onclick = cancelReply;

function sanitize(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}

function formatTime(ts) {
    if(!ts) return '...';
    return ts.toDate().toLocaleTimeString('en-US', {hour:'2-digit', minute:'2-digit'});
}

function showAlert(msg) {
    el.alertMsg.textContent = msg;
    el.securityAlert.classList.add('show');
    setTimeout(() => el.securityAlert.classList.remove('show'), 3000);
}
