document.addEventListener('DOMContentLoaded', async function() {
    // ---------------------------------------------------------
    // 1. Firebase Configuration & Imports
    // ---------------------------------------------------------
    const firebaseConfig = {
        apiKey: "AIzaSyBhCxGjQOQ88b2GynL515ZYQXqfiLPhjw4",
        authDomain: "edumates-983dd.firebaseapp.com",
        projectId: "edumates-983dd",
        storageBucket: "edumates-983dd.firebasestorage.app",
        messagingSenderId: "172548876353",
        appId: "1:172548876353:web:955b1f41283d26c44c3ec0",
        measurementId: "G-L1KCZTW8R9"
    };

    // Dynamic Imports
    const { initializeApp } = await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js");
    const { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } = await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js");
    const { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, where, getDocs, doc, setDoc, getDoc, updateDoc } = await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js");

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const provider = new GoogleAuthProvider();
    const db = getFirestore(app);

    // ---------------------------------------------------------
    // 2. DOM Elements
    // ---------------------------------------------------------
    const elements = {
        currentYear: document.querySelector('.current-year'),
        mobileMenuBtn: document.querySelector('.mobile-menu-btn'),
        navLinks: document.querySelector('.nav-links'),
        googleLoginBtn: document.getElementById('googleLoginBtn'),
        
        // Roadmap
        viewRoadmapBtn: document.querySelector('#viewRoadmapBtn'),
        roadmapPopup: document.querySelector('#roadmapModal'),
        closeRoadmap: document.querySelector('#closeRoadmap'),
        roadmapTasks: document.querySelectorAll('.roadmap-task'),
        
        // Chat
        chatBtn: document.getElementById('chatBtn'),
        chatPopup: document.getElementById('chatPopup'),
        closeChat: document.getElementById('closeChat'),
        chatMessages: document.getElementById('chatMessages'),
        messageInput: document.getElementById('messageInput'),
        sendMessageBtn: document.getElementById('sendMessageBtn'),
        chatLoading: document.getElementById('chatLoading'),

        // Survey
        surveyModal: document.getElementById('surveyModal'),
        closeSurvey: document.getElementById('closeSurvey'),
        surveyNameInput: document.getElementById('surveyNameInput'),
        surveyTermsCheck: document.getElementById('surveyTermsCheck'),
        surveyConductCheck: document.getElementById('surveyConductCheck'),
        startChattingBtn: document.getElementById('startChattingBtn')
    };

    if (elements.currentYear) elements.currentYear.textContent = new Date().getFullYear();

    // Global Unsubscribe functions (to stop listening when logged out)
    let unsubscribeMessages = null;
    let unsubscribeRatings = {};

    // ---------------------------------------------------------
    // 3. Authentication Logic
    // ---------------------------------------------------------
    
    // Listen to Auth State Changes
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            console.log("User Logged In:", user.uid);
            updateUIAfterLogin(user);
            await loadUserProfileData(user); // Load Roadmap & Chat Profile
            refreshRatings(user); // Load User Ratings
        } else {
            console.log("User Logged Out");
            updateUIAfterLogout();
        }
    });

    async function handleGoogleLogin() {
        try {
            elements.googleLoginBtn.disabled = true;
            await signInWithPopup(auth, provider);
            // Page will react to onAuthStateChanged
        } catch (error) {
            console.error("Login Error:", error);
            alert("Login failed: " + error.message);
        } finally {
            elements.googleLoginBtn.disabled = false;
        }
    }

    async function handleLogout() {
        try {
            await signOut(auth);
            // Page will react to onAuthStateChanged
        } catch (error) {
            console.error("Logout Error:", error);
        }
    }

    function updateUIAfterLogin(user) {
        if (elements.googleLoginBtn) {
            elements.googleLoginBtn.innerHTML = `
                <img src="${user.photoURL || 'https://via.placeholder.com/30'}" class="user-avatar" style="border-radius:50%; width:25px; margin-right:5px;">
                <span>${sanitizeHTML(user.displayName || 'User')}</span>
                <i class="fas fa-sign-out-alt logout-icon" title="Logout" style="margin-left:10px; cursor:pointer;"></i>
            `;
            // Add Logout Event
            const logoutIcon = elements.googleLoginBtn.querySelector('.logout-icon');
            if (logoutIcon) {
                logoutIcon.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const confirmLogout = confirm("Are you sure you want to logout?");
                    if (confirmLogout) handleLogout();
                });
            }
            // Remove default click from main button to prevent re-login trigger on container
            elements.googleLoginBtn.onclick = null; 
        }
    }

    function updateUIAfterLogout() {
        if (elements.googleLoginBtn) {
            elements.googleLoginBtn.innerHTML = '<i class="fab fa-google"></i> Sign in with Google';
            elements.googleLoginBtn.addEventListener('click', handleGoogleLogin);
        }
        
        // Reset Roadmap UI
        document.querySelectorAll('.roadmap-task').forEach(item => {
            item.classList.remove('done');
            const btn = item.querySelector('.mark-done');
            if(btn) btn.textContent = 'Check';
        });

        // Clear Chat
        if (elements.chatMessages) elements.chatMessages.innerHTML = '';
        if (unsubscribeMessages) { unsubscribeMessages(); unsubscribeMessages = null; }
    }

    // ---------------------------------------------------------
    // 4. User Profile & Roadmap Logic (DB: user-profiles)
    // ---------------------------------------------------------

    async function loadUserProfileData(user) {
        try {
            const docRef = doc(db, 'user-profiles', user.uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                
                // 1. Apply Roadmap Status
                if (data.roadmap) {
                    applyRoadmapUI(data.roadmap);
                }
                
                // 2. Check Chat Profile (Stored for later use)
                // We don't open chat automatically, but we know if they registered
            }
        } catch (error) {
            console.error("Error fetching user profile:", error);
        }
    }

    function applyRoadmapUI(roadmapData) {
        document.querySelectorAll('.roadmap-task').forEach(item => {
            const skillKey = item.getAttribute('data-skill');
            const checkBtn = item.querySelector('.mark-done');
            
            if (roadmapData[skillKey] === true) {
                item.classList.add('done');
                if(checkBtn) checkBtn.textContent = 'Done ✔';
            } else {
                item.classList.remove('done');
                if(checkBtn) checkBtn.textContent = 'Check';
            }
        });
    }

    // Attach Listeners to Roadmap Buttons
    document.querySelectorAll('.roadmap-task').forEach(item => {
        const checkBtn = item.querySelector('.mark-done');
        if (!checkBtn) return;

        // Clone to remove old listeners
        const newBtn = checkBtn.cloneNode(true);
        checkBtn.parentNode.replaceChild(newBtn, checkBtn);

        newBtn.addEventListener('click', async () => {
            const user = auth.currentUser;
            
            // SECURITY CHECK: Must be logged in
            if (!user) {
                alert("Please login first to save your progress!");
                return;
            }

            const skillName = item.childNodes[0].textContent.trim();
            const skillKey = item.getAttribute('data-skill');
            const isDone = item.classList.contains('done');

            if (!isDone) {
                // Mark as Done
                const confirmAction = confirm(`Have you finished learning ${skillName}?`);
                if (confirmAction) {
                    item.classList.add('done');
                    newBtn.textContent = 'Done ✔';
                    await saveRoadmapToDB(user.uid, skillKey, true);
                }
            } else {
                // Uncheck
                item.classList.remove('done');
                newBtn.textContent = 'Check';
                await saveRoadmapToDB(user.uid, skillKey, false);
            }
        });
    });

    async function saveRoadmapToDB(uid, skillKey, status) {
        const userRef = doc(db, 'user-profiles', uid);
        try {
            // Merge allows updating just the specific skill in the map
            await setDoc(userRef, {
                roadmap: {
                    [skillKey]: status
                }
            }, { merge: true });
        } catch (error) {
            console.error("Error saving roadmap:", error);
            alert("Failed to save progress to database. Check connection.");
        }
    }

    // ---------------------------------------------------------
    // 5. Chat System & Survey Logic (DB: user-profiles & frontend-chat)
    // ---------------------------------------------------------

    async function handleChatButtonClick() {
        const user = auth.currentUser;
        
        // SECURITY CHECK
        if (!user) {
            alert("Please login first to join the community chat!");
            return;
        }

        // Check DB if user has filled survey
        try {
            const docRef = doc(db, 'user-profiles', user.uid);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists() && docSnap.data().chatInfo) {
                // User already registered for chat
                openChatPopup();
            } else {
                // First time -> Open Survey
                openSurveyModal(user);
            }
        } catch (error) {
            console.error("Error checking chat profile:", error);
            // Fallback: Open survey if error
            openSurveyModal(user);
        }
    }

    function openSurveyModal(user) {
        if(elements.surveyModal) {
            elements.surveyModal.classList.add('active');
            if(elements.surveyNameInput && !elements.surveyNameInput.value) {
                elements.surveyNameInput.value = user.displayName || '';
            }
            validateSurveyForm();
        }
    }

    async function handleStartChatting() {
        const user = auth.currentUser;
        if (!user) return;

        const name = elements.surveyNameInput.value.trim();
        const terms = elements.surveyTermsCheck.checked;
        const conduct = elements.surveyConductCheck.checked;

        if (name && terms && conduct) {
            elements.startChattingBtn.disabled = true;
            elements.startChattingBtn.textContent = "Saving...";

            try {
                // SAVE TO USER PROFILE
                await setDoc(doc(db, 'user-profiles', user.uid), {
                    chatInfo: {
                        displayName: name,
                        termsAccepted: true,
                        joinedAt: serverTimestamp()
                    }
                }, { merge: true });

                closeSurveyModal();
                openChatPopup();
            } catch (error) {
                console.error("Error saving chat profile:", error);
                alert("Error saving profile. Please try again.");
            } finally {
                elements.startChattingBtn.disabled = false;
                elements.startChattingBtn.textContent = "Agree & Start Chatting";
            }
        }
    }

    function openChatPopup() {
        if (elements.chatPopup) {
            elements.chatPopup.classList.add('active');
            loadChatMessages();
            elements.messageInput.focus();
        }
    }

    function loadChatMessages() {
        if (unsubscribeMessages) return; // Already listening

        elements.chatLoading.classList.add('active');
        const q = query(collection(db, 'frontend-chat'), orderBy('timestamp', 'asc'));

        unsubscribeMessages = onSnapshot(q, (snapshot) => {
            elements.chatMessages.innerHTML = '';
            elements.chatLoading.classList.remove('active');
            
            snapshot.forEach((docSnap) => {
                const msg = docSnap.data();
                renderMessage(msg);
            });
            scrollToBottom();
        });
    }

    function renderMessage(msg) {
        if (!msg.text) return;
        const isMe = auth.currentUser && msg.userId === auth.currentUser.uid;
        
        const div = document.createElement('div');
        div.className = `message ${isMe ? 'user-message' : ''}`;
        div.innerHTML = `
            <div class="message-header">
                <img src="${msg.userPhoto}" class="message-avatar">
                <span class="message-sender">${sanitizeHTML(msg.userName)}</span>
            </div>
            <p class="message-text">${sanitizeHTML(msg.text)}</p>
        `;
        elements.chatMessages.appendChild(div);
    }

    async function sendMessage() {
        const user = auth.currentUser;
        if (!user) return;

        const text = elements.messageInput.value.trim();
        if (!text) return;

        try {
            // Get user custom name from profile, fallback to auth name
            let chatName = user.displayName;
            const profileSnap = await getDoc(doc(db, 'user-profiles', user.uid));
            if (profileSnap.exists() && profileSnap.data().chatInfo) {
                chatName = profileSnap.data().chatInfo.displayName;
            }

            await addDoc(collection(db, 'frontend-chat'), {
                text: text,
                userId: user.uid,
                userName: chatName,
                userPhoto: user.photoURL || 'https://via.placeholder.com/30',
                timestamp: serverTimestamp()
            });
            elements.messageInput.value = '';
        } catch (error) {
            console.error("Send Error:", error);
        }
    }

    // ---------------------------------------------------------
    // 6. Rating System (DB: frontend-ratings)
    // ---------------------------------------------------------

    async function submitRating(linkId, ratingValue) {
        const user = auth.currentUser;
        
        // SECURITY CHECK
        if (!user) {
            alert("Please login to rate this resource.");
            return;
        }

        try {
            // Check if user already rated this specific link
            const q = query(
                collection(db, 'frontend-ratings'), 
                where('linkId', '==', linkId), 
                where('userId', '==', user.uid)
            );
            
            const snapshot = await getDocs(q);
            
            if (!snapshot.empty) {
                alert("You have already rated this resource!");
                return;
            }

            // Save new rating
            await addDoc(collection(db, 'frontend-ratings'), {
                linkId: linkId,
                userId: user.uid,
                rating: ratingValue,
                timestamp: serverTimestamp()
            });
            
            // Optional: Provide feedback (e.g., toast message)
            // UI updates automatically via listener

        } catch (error) {
            console.error("Rating Error:", error);
        }
    }

    function refreshRatings(user) {
        // Re-attach listeners to ensure they have current user context if needed
        // mainly to update the stars visual immediately if we wanted to
        document.querySelectorAll('.rating-stars').forEach(container => {
            const linkId = container.parentElement.getAttribute('data-link-id');
            setupRatingListener(linkId, container);
        });
    }

    function setupRatingListener(linkId, container) {
        if (unsubscribeRatings[linkId]) unsubscribeRatings[linkId](); // Clear old listener

        const q = query(collection(db, 'frontend-ratings'), where('linkId', '==', linkId));
        
        unsubscribeRatings[linkId] = onSnapshot(q, (snapshot) => {
            let total = 0;
            let count = 0;
            let userRatedValue = null;
            const currentUser = auth.currentUser;

            snapshot.forEach(doc => {
                const data = doc.data();
                total += data.rating;
                count++;
                if (currentUser && data.userId === currentUser.uid) {
                    userRatedValue = data.rating;
                }
            });

            const avg = count > 0 ? (total / count).toFixed(1) : "0.0";
            updateStarsUI(container, avg, userRatedValue);
        });
    }

    function updateStarsUI(container, average, userRating) {
        const avgDisplay = container.querySelector('.average-rating');
        if(avgDisplay) avgDisplay.textContent = average;

        const stars = container.querySelectorAll('i');
        stars.forEach(star => {
            const val = parseInt(star.getAttribute('data-value'));
            
            // Reset
            star.style.color = 'var(--text-light)'; 
            star.classList.remove('fas', 'far');
            star.classList.add('fas'); // Solid star

            // Coloring Logic:
            // If user has rated, color GOLD up to their rating
            // If not, color ORANGE up to average
            
            if (userRating) {
                if (val <= userRating) {
                    star.style.color = '#FFD700'; // Gold for "My Rating"
                }
            } else {
                if (val <= Math.round(average)) {
                    star.style.color = '#f97316'; // Orange for "Average"
                }
            }
        });
    }

    // ---------------------------------------------------------
    // 7. General UI & Helpers
    // ---------------------------------------------------------

    function toggleMobileMenu() {
        if (!elements.navLinks) return;
        const isOpen = elements.navLinks.classList.contains('active');
        elements.navLinks.classList.toggle('active');
        elements.mobileMenuBtn.innerHTML = isOpen ? '<i class="fas fa-bars"></i>' : '<i class="fas fa-times"></i>';
    }

    function closeMobileMenu() {
        if (window.innerWidth <= 768 && elements.navLinks) {
            elements.navLinks.classList.remove('active');
            elements.mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
        }
    }

    function toggleRoadmapPopup() {
        if (elements.roadmapPopup) elements.roadmapPopup.classList.toggle('active');
    }

    function closeSurveyModal() {
        if (elements.surveyModal) elements.surveyModal.classList.remove('active');
    }

    function validateSurveyForm() {
        if (!elements.startChattingBtn) return;
        const name = elements.surveyNameInput ? elements.surveyNameInput.value.trim() : '';
        const terms = elements.surveyTermsCheck ? elements.surveyTermsCheck.checked : false;
        const conduct = elements.surveyConductCheck ? elements.surveyConductCheck.checked : false;

        if (name && terms && conduct) {
            elements.startChattingBtn.disabled = false;
            elements.startChattingBtn.classList.add('ready');
        } else {
            elements.startChattingBtn.disabled = true;
            elements.startChattingBtn.classList.remove('ready');
        }
    }

    function scrollToBottom() {
        if (elements.chatMessages) elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
    }

    function sanitizeHTML(str) {
        if (!str) return '';
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    }

    // ---------------------------------------------------------
    // 8. Event Listeners Setup
    // ---------------------------------------------------------
    
    // Auth
    if (elements.googleLoginBtn) elements.googleLoginBtn.addEventListener('click', handleGoogleLogin);

    // Nav
    if (elements.mobileMenuBtn) elements.mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    document.querySelectorAll('.nav-link').forEach(l => l.addEventListener('click', closeMobileMenu));

    // Roadmap
    if (elements.viewRoadmapBtn) elements.viewRoadmapBtn.addEventListener('click', toggleRoadmapPopup);
    if (elements.closeRoadmap) elements.closeRoadmap.addEventListener('click', toggleRoadmapPopup);

    // Chat
    if (elements.chatBtn) elements.chatBtn.addEventListener('click', handleChatButtonClick);
    if (elements.closeChat) elements.closeChat.addEventListener('click', () => elements.chatPopup.classList.remove('active'));
    if (elements.sendMessageBtn) elements.sendMessageBtn.addEventListener('click', sendMessage);
    if (elements.messageInput) elements.messageInput.addEventListener('keypress', (e) => { if(e.key==='Enter') sendMessage(); });

    // Survey
    if (elements.closeSurvey) elements.closeSurvey.addEventListener('click', closeSurveyModal);
    if (elements.surveyNameInput) elements.surveyNameInput.addEventListener('input', validateSurveyForm);
    if (elements.surveyTermsCheck) elements.surveyTermsCheck.addEventListener('change', validateSurveyForm);
    if (elements.surveyConductCheck) elements.surveyConductCheck.addEventListener('change', validateSurveyForm);
    if (elements.startChattingBtn) elements.startChattingBtn.addEventListener('click', handleStartChatting);

    // Initial Ratings Load
    document.querySelectorAll('.rating-stars').forEach(starsContainer => {
        const linkId = starsContainer.parentElement.getAttribute('data-link-id');
        
        // 1. Listen for updates (Average)
        setupRatingListener(linkId, starsContainer);

        // 2. Click events for voting
        starsContainer.querySelectorAll('i').forEach(star => {
            star.addEventListener('click', () => {
                submitRating(linkId, parseInt(star.getAttribute('data-value')));
            });
        });
    });
});
