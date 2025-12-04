// 1. Firebase Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, updateDoc, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";

// 2. Firebase Configuration (Kept the same)
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

// 3. Profanity List and Regex (English Focus)
// This list is illustrative. For a truly robust app, use an external library.
const PROFANITY_LIST = [
    "asshole", "bitch", "cunt", "damn", "fuck", "hell", "shit", "wank", "pussy", 
    "dick", "cock", "vagina", "retard", "spastic", "nigger", "kike", // Strong profanity/slurs
    "whore", "slut", "jerkoff", "motherfucker", "fucker", "bastard"
];

// URLs and Social Media Handles (Blocking common links and non-educational platforms)
const URL_PATTERN = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|(\.[a-z]{2,}(\/|\s|$))/i;
const NUMBER_PATTERN = /\d{5,}/; // Blocking 5 or more consecutive digits (stricter than 3)
const SOCIAL_MEDIA_PATTERN = /(facebook|instagram|tiktok|snapchat|twitter|whatsapp|tele\s*gram)/i; 


// 4. DOM Elements (Updated for English Text)
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
    cancelReplyBtn: document.getElementById('cancelReplyBtn'),

    securityAlert: document.getElementById('securityAlert'),
    alertMessage: document.getElementById('alertMessage'),
    
    setupModal: document.getElementById('setupModal'),
    setupDisplayName: document.getElementById('setupDisplayName'),
    checkAge: document.getElementById('checkAge'),
    checkTerms: document.getElementById('checkTerms'),
    checkConduct: document.getElementById('checkConduct'),
    completeSetupBtn: document.getElementById('completeSetupBtn')
};

let currentReplyTo = null;
let chatDisplayName = null; 
let unsubscribeChat = null; 

// --- 5. Authentication and Setup Logic (Similar to before) ---

onAuthStateChanged(auth, async (user) => {
    if (user) {
        elements.loginBtn.classList.add('hidden');
        elements.userInfo.classList.remove('hidden');
        elements.userAvatar.src = user.photoURL || 'https://via.placeholder.com/35';
        await checkUserProfile(user);
    } else {
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
    elements.messagesList.innerHTML = '<div class="loading-spinner">Please Sign In to View the Chat</div>';
    elements.msgInput.disabled = true;
    elements.sendBtn.disabled = true;
    elements.setupModal.classList.add('hidden');
    if (unsubscribeChat) {
        unsubscribeChat();
        unsubscribeChat = null;
    }
}

async function checkUserProfile(user) {
    try {
        const docRef = doc(db, 'user-profiles', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists() && docSnap.data().chatInfo) {
            const data = docSnap.data().chatInfo;
            chatDisplayName = data.displayName;
            elements.userName.textContent = chatDisplayName;
            enableChat();
        } else {
            elements.setupDisplayName.value = user.displayName || '';
            elements.setupModal.classList.remove('hidden');
        }
    } catch (error) {
        console.error("Profile Error:", error);
        alert("An error occurred while loading your profile.");
    }
}

// Setup Modal Logic
function validateSetupForm() {
    const name = elements.setupDisplayName.value.trim();
    const isAge = elements.checkAge.checked;
    const isTerms = elements.checkTerms.checked;
    const isConduct = elements.checkConduct.checked;

    elements.completeSetupBtn.disabled = !(name.length >= 3 && isAge && isTerms && isConduct);
}

[elements.setupDisplayName, elements.checkAge, elements.checkTerms, elements.checkConduct].forEach(el => {
    el.addEventListener('input', validateSetupForm);
    el.addEventListener('change', validateSetupForm);
});

elements.completeSetupBtn.addEventListener('click', async () => {
    const user = auth.currentUser;
    if (!user) return;

    elements.completeSetupBtn.textContent = "Saving...";
    const name = elements.setupDisplayName.value.trim();

    try {
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
        alert("Failed to save profile data.");
    }
});

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

// --- 6. Advanced Filtering Logic (English Profanity) ---

function containsForbiddenContent(text) {
    const lowerText = text.toLowerCase();
    
    // 1. Check for URLs
    if (URL_PATTERN.test(lowerText)) return "Links are not allowed in this chat.";
    
    // 2. Check for Social Media and Non-Educational Keywords
    if (SOCIAL_MEDIA_PATTERN.test(lowerText)) return "Social media names and non-educational terms are prohibited.";
    
    // 3. Check for 5+ Consecutive Numbers (Phone numbers)
    if (NUMBER_PATTERN.test(lowerText)) return "Using too many consecutive numbers is prohibited (e.g., phone numbers).";

    // 4. Check for Profanity
    for (let word of PROFANITY_LIST) {
        // Use a regex to check for the whole word or common variations (e.g., f**k)
        const wordRegex = new RegExp(`\\b${word}\\b|${word.replace(/(\w)/g, '$1\\*?')}`, 'i');
        if (wordRegex.test(lowerText)) return "Profanity and sexually explicit words are strictly forbidden.";
    }

    return null; // Safe
}

function showSecurityAlert(message) {
    elements.alertMessage.textContent = message;
    elements.securityAlert.classList.remove('hidden');
    
    setTimeout(() => {
        elements.securityAlert.classList.add('hidden');
    }, 3000);
}

// --- 7. Sending Message ---
elements.messageForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = elements.msgInput.value.trim();
    if (!text) return;

    const violation = containsForbiddenContent(text);
    if (violation) {
        showSecurityAlert(violation);
        elements.msgInput.value = ''; // Clear input on failure
        return; 
    }

    const user = auth.currentUser;
    
    try {
        const messageData = {
            text: text,
            userId: user.uid,
            userName: chatDisplayName || user.displayName,
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

// --- 8. Rendering Messages (Same as before) ---
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
        timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    let contentHTML = '';
    if (isDeleted) {
        contentHTML = `<div class="msg-content deleted"><i class="fas fa-ban"></i> This message has been deleted by the user.</div>`;
    } else {
        let replyHTML = '';
        if (msg.replyTo) {
            replyHTML = `
                <div class="reply-context" onclick="scrollToMessage('${msg.replyTo.id}')">
                    <small>Replying to <b>${sanitize(msg.replyTo.name)}</b></small><br>
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

    let actionsHTML = '';
    if (!isDeleted) {
        actionsHTML = `
            <div class="msg-actions">
                <button class="action-btn reply-btn" title="Reply"><i class="fas fa-reply"></i></button>
                ${isMe ? `<button class="action-btn delete-btn" title="Delete"><i class="fas fa-trash"></i></button>` : ''}
            </div>
        `;
    }

    div.innerHTML = `
        ${!isMe ? `<div class="msg-header"><img src="${msg.userPhoto}" class="msg-avatar"> <span>${sanitize(msg.userName)}</span></div>` : ''}
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

// --- 9. Utility Functions (Reply, Delete, Scroll, Sanitize) ---

async function deleteMessage(msgId) {
    if (confirm("Are you sure you want to delete this message?")) {
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

// Ensure elements are available when script runs
document.addEventListener('DOMContentLoaded', () => {
    // Initial UI text setup (English)
    elements.loginBtn.innerHTML = '<i class="fab fa-google"></i> Sign in with Google';
    elements.messagesList.innerHTML = '<div class="loading-spinner">Checking Security and Loading Chat...</div>';
    if(elements.msgInput) elements.msgInput.placeholder = 'Type your message here...';
    
    // Update Modal text to English
    if(elements.setupModal) {
        elements.setupModal.querySelector('h2').innerHTML = '<i class="fas fa-shield-alt"></i> Secure Entry Setup';
        elements.setupModal.querySelector('.modal-desc').textContent = 'To ensure a safe educational environment, please complete your profile and accept the terms.';
        elements.setupDisplayName.previousElementSibling.textContent = 'Display Name in Chat:';
        
        elements.checkAge.nextElementSibling.textContent = 'I confirm that I am at least 13 years old.';
        elements.checkTerms.nextElementSibling.textContent = 'I agree to the Privacy Policy and Terms of Use.';
        elements.checkConduct.nextElementSibling.textContent = 'I pledge to use this chat for educational purposes only.';
        
        elements.completeSetupBtn.textContent = 'Accept and Enter';
    }
});
