document.addEventListener('DOMContentLoaded', async function() {
    // Firebase Configuration
    const firebaseConfig = {
        apiKey: "AIzaSyBhCxGjQOQ88b2GynL515ZYQXqfiLPhjw4",
        authDomain: "edumates-983dd.firebaseapp.com",
        projectId: "edumates-983dd",
        storageBucket: "edumates-983dd.firebasestorage.app",
        messagingSenderId: "172548876353",
        appId: "1:172548876353:web:955b1f41283d26c44c3ec0",
        measurementId: "G-L1KCZTW8R9"
    };

    const { initializeApp } = await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js");
    const { getAuth, GoogleAuthProvider, signInWithPopup, signOut } = await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js");
    const { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, where, getDocs, doc, setDoc, getDoc } = await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js");

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const provider = new GoogleAuthProvider();
    const db = getFirestore(app);
    
    // DOM Elements
    const elements = {
        currentYear: document.querySelector('.current-year'),
        mobileMenuBtn: document.querySelector('.mobile-menu-btn'),
        navLinks: document.querySelector('.nav-links'),
        viewRoadmapBtn: document.querySelector('#viewRoadmapBtn'),
        roadmapPopup: document.querySelector('#roadmapModal'),
        closeRoadmap: document.querySelector('#closeRoadmap'),
        googleLoginBtn: document.getElementById('googleLoginBtn'),
        
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

    let unsubscribeMessages = null;
    let unsubscribeRatings = {};

    setupEventListeners();

    // Mobile Menu
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

    // Roadmap Popup
    function toggleRoadmapPopup() {
        if (elements.roadmapPopup) {
            elements.roadmapPopup.classList.toggle('active');
        }
    }

    // --- ROADMAP LOGIC (Updated for DB and Confirmation) ---
    async function setupRoadmapChecks() {
        const user = auth.currentUser;
        
        // Load status from DB if user is logged in
        let userRoadmapData = {};
        if (user) {
            try {
                const docRef = doc(db, 'user-profiles', user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists() && docSnap.data().roadmap) {
                    userRoadmapData = docSnap.data().roadmap;
                }
            } catch (error) {
                console.error("Error fetching roadmap:", error);
            }
        } else {
             // Fallback to localStorage if not logged in (optional, or just disable)
             // For this request, we prioritize DB, but we can keep local view for guests
             // Not strictly requested to kill localstorage logic for guests, but requested to clean it on logout.
        }

        document.querySelectorAll('.roadmap-task').forEach(item => {
            const skillName = item.childNodes[0].textContent.trim();
            const dataSkill = item.getAttribute('data-skill'); // Use ID for DB key
            const checkBtn = item.querySelector('.mark-done');

            if (!dataSkill || !checkBtn) return;

            // Initialize UI
            if (userRoadmapData[dataSkill] === true) {
                item.classList.add('done');
                checkBtn.textContent = 'Done ✔';
            } else {
                item.classList.remove('done');
                checkBtn.textContent = 'Check';
            }

            // Remove old listeners to prevent duplicates
            const newBtn = checkBtn.cloneNode(true);
            checkBtn.parentNode.replaceChild(newBtn, checkBtn);

            newBtn.addEventListener('click', async () => {
                const isCurrentlyDone = item.classList.contains('done');
                
                // If trying to mark as done
                if (!isCurrentlyDone) {
                    const confirmAction = confirm(`Have you finished learning ${skillName}?`);
                    if (confirmAction) {
                        item.classList.add('done');
                        newBtn.textContent = 'Done ✔';
                        await saveRoadmapStatus(dataSkill, true);
                    }
                } else {
                    // Unchecking
                    item.classList.remove('done');
                    newBtn.textContent = 'Check';
                    await saveRoadmapStatus(dataSkill, false);
                }
            });
        });
    }

    async function saveRoadmapStatus(skillId, isDone) {
        const user = auth.currentUser;
        if (!user) return; // Only save if logged in

        try {
            const userRef = doc(db, 'user-profiles', user.uid);
            // We use merge: true to update specific fields inside the map
            await setDoc(userRef, {
                roadmap: {
                    [skillId]: isDone
                }
            }, { merge: true });
        } catch (error) {
            console.error("Error saving roadmap:", error);
            alert("Failed to save progress. Check connection.");
        }
    }

    // --- CHAT & SURVEY ---
    function handleChatButtonClick() {
        const user = auth.currentUser;
        if (!user) {
            alert('Please login to use the chat.');
            return;
        }
        const savedName = localStorage.getItem('chatUserName');
        const termsAccepted = localStorage.getItem('chatTermsAccepted');

        if (savedName && termsAccepted === 'true') {
            toggleChatPopup();
        } else {
            openSurveyModal(user);
        }
    }

    function openSurveyModal(user) {
        if(elements.surveyModal) {
            elements.surveyModal.classList.add('active');
            if(user.displayName && elements.surveyNameInput && !elements.surveyNameInput.value) {
                elements.surveyNameInput.value = user.displayName;
            }
            validateSurveyForm();
        }
    }

    function closeSurveyModal() {
        if(elements.surveyModal) elements.surveyModal.classList.remove('active');
    }

    function validateSurveyForm() {
        if (!elements.startChattingBtn) return;
        const name = elements.surveyNameInput ? elements.surveyNameInput.value.trim() : '';
        const termsChecked = elements.surveyTermsCheck ? elements.surveyTermsCheck.checked : false;
        const conductChecked = elements.surveyConductCheck ? elements.surveyConductCheck.checked : false;

        if (name.length > 0 && termsChecked && conductChecked) {
            elements.startChattingBtn.disabled = false;
            elements.startChattingBtn.classList.add('ready');
        } else {
            elements.startChattingBtn.disabled = true;
            elements.startChattingBtn.classList.remove('ready');
        }
    }

    async function saveSurveyToDatabase(user, name) {
        if (!user) return;
        const surveyData = {
            userId: user.uid,
            userName: name,
            termsAccepted: elements.surveyTermsCheck.checked,
            conductPledge: elements.surveyConductCheck.checked,
            email: user.email
        };
        await setDoc(doc(db, 'user-profiles', user.uid), surveyData, { merge: true });
    }

    async function handleStartChatting() {
        const user = auth.currentUser;
        if (!user) return; 
        const name = elements.surveyNameInput.value.trim();
        
        if (name && elements.surveyTermsCheck.checked && elements.surveyConductCheck.checked) {
            elements.startChattingBtn.disabled = true;
            try {
                await saveSurveyToDatabase(user, name);
                localStorage.setItem('chatUserName', name);
                localStorage.setItem('chatTermsAccepted', 'true');
                closeSurveyModal();
                toggleChatPopup();
            } catch (error) {
                elements.startChattingBtn.disabled = false;
            }
        }
    }

    function toggleChatPopup() {
        if (elements.chatPopup) {
            const isActive = elements.chatPopup.classList.toggle('active');
            if (isActive) {
                elements.messageInput.focus();
                if (!elements.chatMessages.hasChildNodes()) loadMessages();
                scrollChatToBottom();
            } else if (unsubscribeMessages) {
                unsubscribeMessages();
                unsubscribeMessages = null;
            }
        }
    }

    function scrollChatToBottom() {
        if (elements.chatMessages) elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
    }

    async function sendMessage() {
        const user = auth.currentUser;
        if (!user) { alert('Please login'); return; }

        const messageText = elements.messageInput.value.trim();
        if (!messageText) return;

        try {
            elements.sendMessageBtn.disabled = true;
            const chatUserName = localStorage.getItem('chatUserName') || user.displayName || 'User';
            await addDoc(collection(db, 'frontend-chat'), {
                text: messageText,
                userId: user.uid,
                userName: chatUserName,
                userPhoto: user.photoURL || 'https://via.placeholder.com/30',
                timestamp: serverTimestamp()
            });
            elements.messageInput.value = '';
        } catch (error) {
            console.error(error);
        } finally {
            elements.sendMessageBtn.disabled = false;
            elements.messageInput.focus();
        }
    }

    function loadMessages() {
        elements.chatLoading.classList.add('active');
        const messagesQuery = query(collection(db, 'frontend-chat'), orderBy('timestamp', 'asc'));

        unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
            elements.chatMessages.innerHTML = '';
            elements.chatLoading.classList.remove('active');
            snapshot.forEach((doc) => {
                const message = doc.data();
                if (!message.text) return;
                const isCurrentUser = auth.currentUser && message.userId === auth.currentUser.uid;
                const div = document.createElement('div');
                div.className = `message ${isCurrentUser ? 'user-message' : ''}`;
                div.innerHTML = `
                    <div class="message-header">
                        <img src="${message.userPhoto}" class="message-avatar">
                        <span class="message-sender">${sanitizeHTML(message.userName)}</span>
                    </div>
                    <p class="message-text">${sanitizeHTML(message.text)}</p>
                `;
                elements.chatMessages.appendChild(div);
            });
            scrollChatToBottom();
        });
    }

    function sanitizeHTML(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // --- AUTHENTICATION ---
    async function handleGoogleLogin() {
        try {
            elements.googleLoginBtn.disabled = true;
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error(error);
            alert(error.message);
        } finally {
            elements.googleLoginBtn.disabled = false;
        }
    }

    function updateUIAfterLogin(user) {
        if (elements.googleLoginBtn) {
            elements.googleLoginBtn.innerHTML = `
                <img src="${user.photoURL || 'https://via.placeholder.com/30'}" class="user-avatar">
                <span>${sanitizeHTML(user.displayName || 'User')}</span>
                <i class="fas fa-sign-out-alt logout-icon" title="Logout"></i>
            `;
            const logoutIcon = elements.googleLoginBtn.querySelector('.logout-icon');
            if (logoutIcon) {
                logoutIcon.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    try {
                        // 2. CLEAR LOCALSTORAGE ON LOGOUT
                        localStorage.clear();
                        await signOut(auth);
                        location.reload();
                    } catch (error) {
                        console.error('Logout error:', error);
                    }
                });
            }
        }
        setupRoadmapChecks(); // Reload roadmap with DB data
    }

    // --- RATING SYSTEM (FIXED) ---
   // --- RATING SYSTEM (SECURE) ---
    async function submitRating(linkId, rating) {
        const user = auth.currentUser;
        if (!user) { alert('Please login to rate'); return; }

        // إنشاء معرف فريد يدمج بين المستخدم والرابط (UserUID_LinkID)
        const uniqueDocId = `${user.uid}_${linkId}`;
        const ratingDocRef = doc(db, 'frontend-ratings', uniqueDocId);

        try {
            // التحقق المباشر مما إذا كانت الوثيقة موجودة
            const docSnap = await getDoc(ratingDocRef);
            
            if (docSnap.exists()) { 
                alert('You have already rated this resource!'); 
                return; 
            }

            // الحفظ باستخدام setDoc ومعرف فريد لمنع التكرار نهائياً
            await setDoc(ratingDocRef, {
                linkId: linkId, 
                userId: user.uid, 
                rating: rating, 
                timestamp: serverTimestamp()
            });
            
            // تحديث الواجهة فورياً للمستخدم (اختياري، لتحسين التجربة)
            alert('Thanks for your rating!');

        } catch (error) {
            console.error("Error submitting rating:", error);
            alert('An error occurred. Please try again.');
        }
    }
    // 3. FIX: SEPARATE AVERAGE FROM USER SELECTION
    function updateStarDisplay(starsContainer, averageRating, count, userRating) {
        const stars = starsContainer.querySelectorAll('i');
        const avgDisplay = starsContainer.querySelector('.average-rating');
        
        avgDisplay.textContent = averageRating.toFixed(1);

        stars.forEach(star => {
            const val = parseInt(star.getAttribute('data-value'));
            star.classList.remove('rated', 'user-rated'); // Clear styles
            star.style.color = 'var(--text-light)'; // Reset color

            // Logic: 
            // If the USER rated it, highlight their rating with a specific class/color? 
            // Or just show the average? 
            // Standard UX: Show Average. If user rated, maybe make stars gold vs orange.
            // Requirement: "Don't color based on last person".
            
            // We show AVERAGE by default.
            if (val <= Math.round(averageRating)) {
                star.style.color = '#f97316'; // Orange for average
            }

            // OPTIONAL: If current user rated, maybe change style slightly?
            // For now, adhering to standard "Show Average" is safest.
        });
    }

    async function loadRatings(linkId, starsContainer) {
        const q = query(collection(db, 'frontend-ratings'), where('linkId', '==', linkId));
        
        unsubscribeRatings[linkId] = onSnapshot(q, (snapshot) => {
            let total = 0;
            let count = 0;
            let myRating = null;
            const user = auth.currentUser;

            snapshot.forEach(doc => {
                const data = doc.data();
                total += data.rating;
                count++;
                if (user && data.userId === user.uid) {
                    myRating = data.rating;
                }
            });

            const avg = count > 0 ? total / count : 0;
            updateStarDisplay(starsContainer, avg, count, myRating);
        });
    }

    // Initialize
    function setupEventListeners() {
        if (elements.mobileMenuBtn) elements.mobileMenuBtn.addEventListener('click', toggleMobileMenu);
        document.querySelectorAll('.nav-link').forEach(l => l.addEventListener('click', closeMobileMenu));
        if (elements.viewRoadmapBtn) elements.viewRoadmapBtn.addEventListener('click', toggleRoadmapPopup);
        if (elements.closeRoadmap) elements.closeRoadmap.addEventListener('click', toggleRoadmapPopup);
        if (elements.chatBtn) elements.chatBtn.addEventListener('click', handleChatButtonClick);
        if (elements.closeChat) elements.closeChat.addEventListener('click', toggleChatPopup);
        if (elements.closeSurvey) elements.closeSurvey.addEventListener('click', closeSurveyModal);
        if (elements.surveyNameInput) elements.surveyNameInput.addEventListener('input', validateSurveyForm);
        if (elements.surveyTermsCheck) elements.surveyTermsCheck.addEventListener('change', validateSurveyForm);
        if (elements.surveyConductCheck) elements.surveyConductCheck.addEventListener('change', validateSurveyForm);
        if (elements.startChattingBtn) elements.startChattingBtn.addEventListener('click', handleStartChatting);
        if (elements.sendMessageBtn) elements.sendMessageBtn.addEventListener('click', sendMessage);
        if (elements.messageInput) elements.messageInput.addEventListener('keypress', (e) => { if(e.key==='Enter') sendMessage(); });
        if (elements.googleLoginBtn) elements.googleLoginBtn.addEventListener('click', handleGoogleLogin);

        // Rating Stars Click
        document.querySelectorAll('.rating-stars').forEach(starsContainer => {
            const linkId = starsContainer.parentElement.getAttribute('data-link-id');
            loadRatings(linkId, starsContainer);
            starsContainer.querySelectorAll('i').forEach(star => {
                star.addEventListener('click', () => {
                    submitRating(linkId, parseInt(star.getAttribute('data-value')));
                });
            });
        });
    }

    auth.onAuthStateChanged(user => {
        if (user) {
            updateUIAfterLogin(user);
            // Refresh ratings to check if user rated
             document.querySelectorAll('.rating-stars').forEach(starsContainer => {
                const linkId = starsContainer.parentElement.getAttribute('data-link-id');
                // Unsubscribe old to prevent memory leaks if switching users (rare but safe)
                if(unsubscribeRatings[linkId]) unsubscribeRatings[linkId](); 
                loadRatings(linkId, starsContainer);
            });
        } else {
            elements.googleLoginBtn.innerHTML = '<i class="fab fa-google"></i> Sign in with Google';
            setupRoadmapChecks(); // Reset roadmap to empty/default
            // Reset Chat
            elements.chatMessages.innerHTML = '';
            if (unsubscribeMessages) { unsubscribeMessages(); unsubscribeMessages = null; }
        }
    });
});

