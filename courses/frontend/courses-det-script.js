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

    // Imports (Ensure these match your version needs)
    const { initializeApp } = await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js");
    const { getAuth, GoogleAuthProvider, signInWithPopup, signOut } = await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js");
    const { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, where, getDocs, doc, setDoc, getDoc, updateDoc } = await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js");

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const provider = new GoogleAuthProvider();
    const db = getFirestore(app);
    
    // DOM Elements
    const elements = {
        currentYear: document.querySelector('.current-year'),
        mobileMenuBtn: document.querySelector('.mobile-menu-btn'),
        navLinks: document.querySelector('.nav-links'),
        viewRoadmapBtn: document.querySelector('.view-roadmap-btn'),
        roadmapPopup: document.querySelector('#roadmapPopup'),
        closeRoadmap: document.querySelector('#closeRoadmap'),
        roadmapList: document.querySelector('#roadmapList'),
        toggleFeatures: document.querySelectorAll('.toggle-features'),
        googleLoginBtn: document.getElementById('googleLoginBtn'),
        
        // Chat & Survey
        chatBtn: document.getElementById('chatBtn'),
        chatPopup: document.getElementById('chatPopup'),
        closeChat: document.getElementById('closeChat'),
        chatMessages: document.getElementById('chatMessages'),
        messageInput: document.getElementById('messageInput'),
        sendMessageBtn: document.getElementById('sendMessageBtn'),
        chatLoading: document.getElementById('chatLoading'),
        
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

    // --- Data Definitions for Roadmap ---
    const roadmapData = {
        beginner: [
            "HTML", "CSS", "Responsive Design", "JavaScript", 
            "Git & GitHub", "UI/UX Basics", "Figma"
        ],
        intermediate: [
            "REST APIs & HTTP", "Frontend Framework", "State Management", 
            "Build Tools", "Performance", "Security", "Web APIs"
        ]
    };

    // --- INITIALIZATION ---
    setupEventListeners();
    renderRoadmap(); // Render initial list (unchecked)

    // --- ROADMAP LOGIC ---

    function renderRoadmap() {
        if(!elements.roadmapList) return;
        elements.roadmapList.innerHTML = '';
        
        const createSection = (title, skills) => {
            const h4 = document.createElement('h4');
            h4.textContent = title;
            h4.style.color = '#1e3a8a'; 
            h4.style.marginTop = '15px';
            elements.roadmapList.appendChild(h4);

            skills.forEach(skill => {
                const div = document.createElement('div');
                div.className = 'roadmap-task';
                div.innerHTML = `
                    <span>${skill}</span>
                    <button class="mark-done-btn btn-sm" data-skill="${skill}">Check</button>
                `;
                elements.roadmapList.appendChild(div);
            });
        };

        createSection('Beginner', roadmapData.beginner);
        createSection('Intermediate', roadmapData.intermediate);

        // Add Listeners to buttons
        document.querySelectorAll('.mark-done-btn').forEach(btn => {
            btn.addEventListener('click', handleRoadmapCheck);
        });
    }

    async function handleRoadmapCheck(e) {
        const btn = e.target;
        const skill = btn.getAttribute('data-skill');
        const user = auth.currentUser;
        const taskRow = btn.closest('.roadmap-task');
        const isCurrentlyDone = taskRow.classList.contains('completed');

        // Logic 1: Confirmation
        if (!isCurrentlyDone) {
            const confirmed = confirm(`Have you finished learning ${skill}?`);
            if (!confirmed) return; // Cancel if no
        }

        // Optimistic UI Update
        toggleTaskUI(taskRow, btn, !isCurrentlyDone);

        // Logic 2: Save to Firestore
        if (user) {
            try {
                const userProfileRef = doc(db, 'user-profiles', user.uid);
                // Create object like: { "roadmap.HTML": true } or delete field
                // Easier: Just update the full roadmap map
                
                // First get current data to ensure we merge correctly inside the map
                // But Firestore dot notation helps update nested fields
                await setDoc(userProfileRef, {
                    roadmap: {
                        [skill]: !isCurrentlyDone // toggle
                    }
                }, { merge: true });

            } catch (error) {
                console.error("Error saving roadmap:", error);
                // Revert UI if failed
                toggleTaskUI(taskRow, btn, isCurrentlyDone);
                alert("Failed to save progress. Check connection.");
            }
        } else {
            // Fallback to LocalStorage if not logged in (optional, or force login)
            // User asked specifically for user-profiles, assuming logged in for that feature.
            // But we can keep LS for guest users.
            if(!isCurrentlyDone) localStorage.setItem(`roadmap-${skill}`, 'done');
            else localStorage.removeItem(`roadmap-${skill}`);
        }
    }

    function toggleTaskUI(row, btn, isDone) {
        if (isDone) {
            row.classList.add('completed');
            btn.textContent = 'Done ✔';
            btn.style.background = '#16a34a';
        } else {
            row.classList.remove('completed');
            btn.textContent = 'Check';
            btn.style.background = ''; // reset to default css
        }
    }

    async function loadUserRoadmap(user) {
        // Reset all first
        document.querySelectorAll('.roadmap-task').forEach(r => {
            toggleTaskUI(r, r.querySelector('button'), false);
        });

        if (!user) return;

        try {
            const docRef = doc(db, 'user-profiles', user.uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.roadmap) {
                    Object.entries(data.roadmap).forEach(([skill, isDone]) => {
                        if (isDone) {
                            // Find the button with this skill
                            const btn = document.querySelector(`.mark-done-btn[data-skill="${skill}"]`);
                            if (btn) toggleTaskUI(btn.closest('.roadmap-task'), btn, true);
                        }
                    });
                }
            }
        } catch (error) {
            console.error("Error loading roadmap:", error);
        }
    }


    // --- AUTH & CLEANUP LOGIC ---

    async function handleGoogleLogin() {
        try {
            elements.googleLoginBtn.disabled = true;
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error('Login error:', error);
            alert('Error logging in: ' + error.message);
        } finally {
            elements.googleLoginBtn.disabled = false;
        }
    }

    async function handleLogout(e) {
        e.stopPropagation();
        try {
            await signOut(auth);
            
            // Logic 3: Clear LocalStorage specific items on logout
            localStorage.removeItem('chatUserName');
            localStorage.removeItem('chatTermsAccepted');
            // Also clear generic roadmap items if we used them for guests
            roadmapData.beginner.concat(roadmapData.intermediate).forEach(skill => {
                localStorage.removeItem(`roadmap-${skill}`);
            });

            location.reload();
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    auth.onAuthStateChanged(user => {
        if (user) {
            updateUIAfterLogin(user);
            loadUserRoadmap(user); // Load roadmap from DB
            
            // Re-load ratings to ensure User's rating is highlighted
            document.querySelectorAll('.rating-stars').forEach(container => {
                const linkId = container.parentElement.getAttribute('data-link-id');
                loadRatings(linkId, container);
            });
        } else {
            updateUIAfterLogout();
            renderRoadmap(); // Reset visual roadmap to clean state
        }
    });

    function updateUIAfterLogin(user) {
        if (elements.googleLoginBtn) {
            elements.googleLoginBtn.innerHTML = `
                <img src="${user.photoURL || 'https://via.placeholder.com/30'}" class="user-avatar">
                <span>${user.displayName || 'User'}</span>
                <i class="fas fa-sign-out-alt logout-icon" title="Logout"></i>
            `;
            const logoutIcon = elements.googleLoginBtn.querySelector('.logout-icon');
            if (logoutIcon) logoutIcon.addEventListener('click', handleLogout);
        }
    }

    function updateUIAfterLogout() {
         if (elements.googleLoginBtn) {
            elements.googleLoginBtn.innerHTML = `<i class="fab fa-google"></i> Sign in with Google`;
            // Remove old listener not needed as we replace innerHTML
        }
    }

    // --- RATINGS LOGIC ---

    // Logic 4: Star Display Fix
    // We want: Average rating is Yellow. User's rating is Orange (or distinct).
    // If User hasn't rated, show Average in Yellow.
    // If User has rated, highlight their stars.
    
    async function submitRating(linkId, rating) {
        const user = auth.currentUser;
        if (!user) {
            alert('Please login to rate');
            return;
        }

        try {
            // Check if user already rated
            const q = query(collection(db, 'frontend-ratings'), where('linkId', '==', linkId), where('userId', '==', user.uid));
            const snap = await getDocs(q);

            if (!snap.empty) {
                // Optional: Allow update? For now, alert as per request
                alert('You have already rated this link');
                return;
            }

            await addDoc(collection(db, 'frontend-ratings'), {
                linkId: linkId,
                userId: user.uid,
                rating: rating,
                timestamp: serverTimestamp()
            });
        } catch (error) {
            console.error('Rating error:', error);
        }
    }

    async function loadRatings(linkId, starsContainer) {
        const ratingsQuery = query(collection(db, 'frontend-ratings'), where('linkId', '==', linkId));

        unsubscribeRatings[linkId] = onSnapshot(ratingsQuery, async (snapshot) => {
            let totalRating = 0;
            let count = 0;
            let currentUserRating = 0;
            const user = auth.currentUser;

            snapshot.forEach(doc => {
                const d = doc.data();
                totalRating += d.rating;
                count++;
                if (user && d.userId === user.uid) {
                    currentUserRating = d.rating;
                }
            });

            const avg = count > 0 ? (totalRating / count) : 0;
            
            // Pass both Average and User Rating
            updateStarDisplay(starsContainer, avg, count, currentUserRating);
            
        });
    }

    function updateStarDisplay(container, average, count, userRating) {
        const stars = container.querySelectorAll('i');
        const avgText = container.querySelector('.average-rating');
        const countText = container.querySelector('.rating-count');

        avgText.textContent = average.toFixed(1);
        countText.textContent = `(${count})`;

        stars.forEach(star => {
            const val = parseInt(star.getAttribute('data-value'));
            
            // Reset styles
            star.style.color = 'var(--text-light)';
            star.className = 'fas fa-star'; // Base class

            // Priority: User Rating -> Average Rating
            if (userRating > 0) {
                // Show user rating (maybe Gold/Orange)
                if (val <= userRating) {
                    star.style.color = '#f97316'; // Deep Orange for MY rating
                }
            } else {
                // Show Average (Yellow/Gold)
                if (val <= Math.round(average)) {
                    star.style.color = '#fbbf24'; // Lighter Yellow for Average
                }
            }
        });
    }


    // --- GENERAL EVENT LISTENERS ---

    function setupEventListeners() {
        if(elements.mobileMenuBtn) elements.mobileMenuBtn.addEventListener('click', toggleMobileMenu);
        document.querySelectorAll('.nav-link').forEach(l => l.addEventListener('click', closeMobileMenu));
        
        // Roadmap Popup
        if(elements.viewRoadmapBtn) elements.viewRoadmapBtn.addEventListener('click', () => togglePopup(elements.roadmapPopup));
        if(elements.closeRoadmap) elements.closeRoadmap.addEventListener('click', () => togglePopup(elements.roadmapPopup));

        // Chat & Survey
        if(elements.chatBtn) elements.chatBtn.addEventListener('click', handleChatBtn);
        if(elements.closeChat) elements.closeChat.addEventListener('click', () => togglePopup(elements.chatPopup));
        if(elements.closeSurvey) elements.closeSurvey.addEventListener('click', () => elements.surveyModal.classList.remove('active'));
        
        if(elements.startChattingBtn) elements.startChattingBtn.addEventListener('click', handleStartChatting);
        if(elements.surveyNameInput) elements.surveyNameInput.addEventListener('input', validateSurvey);
        if(elements.surveyTermsCheck) elements.surveyTermsCheck.addEventListener('change', validateSurvey);
        if(elements.surveyConductCheck) elements.surveyConductCheck.addEventListener('change', validateSurvey);

        if(elements.sendMessageBtn) elements.sendMessageBtn.addEventListener('click', sendMessage);
        if(elements.messageInput) elements.messageInput.addEventListener('keypress', (e) => {
            if(e.key === 'Enter') sendMessage();
        });

        if(elements.googleLoginBtn) elements.googleLoginBtn.addEventListener('click', handleGoogleLogin);

        // Toggle Lists Features
        elements.toggleFeatures.forEach(t => t.addEventListener('click', toggleFeatures));
        
        // Setup Stars Click
        document.querySelectorAll('.rating-stars').forEach(container => {
            const linkId = container.parentElement.getAttribute('data-link-id');
            // Initial load
            loadRatings(linkId, container);
            
            container.querySelectorAll('i').forEach(star => {
                star.addEventListener('click', () => {
                   submitRating(linkId, parseInt(star.getAttribute('data-value')));
                });
            });
        });
    }

    // --- Helper Functions ---
    function toggleMobileMenu() {
        elements.navLinks.classList.toggle('active');
        elements.mobileMenuBtn.innerHTML = elements.navLinks.classList.contains('active') ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
    }
    function closeMobileMenu() { elements.navLinks.classList.remove('active'); }
    function togglePopup(modal) { if(modal) modal.classList.toggle('active'); }
    function toggleFeatures(e) {
        // Your existing toggle logic
        const toggle = e.currentTarget;
        const list = toggle.nextElementSibling.nextElementSibling; // Adjust based on DOM
        // Simplified for this context:
        if(list) list.classList.toggle('active');
        toggle.classList.toggle('active');
    }

    // --- CHAT IMPLEMENTATION (Simplified for brevity as logic is similar to before but with survey fix) ---
    function handleChatBtn() {
        if(!auth.currentUser) return alert("Login required");
        // Check local storage OR User profile in DB. 
        // For speed, check LocalStorage first.
        if(localStorage.getItem('chatTermsAccepted')) {
            togglePopup(elements.chatPopup);
            if(!elements.chatMessages.hasChildNodes()) loadMessages();
        } else {
            elements.surveyModal.classList.add('active');
            if(auth.currentUser.displayName) elements.surveyNameInput.value = auth.currentUser.displayName;
        }
    }

    function validateSurvey() {
        const valid = elements.surveyNameInput.value.trim() && elements.surveyTermsCheck.checked && elements.surveyConductCheck.checked;
        elements.startChattingBtn.disabled = !valid;
        if(valid) elements.startChattingBtn.classList.add('ready');
        else elements.startChattingBtn.classList.remove('ready');
    }

    async function handleStartChatting() {
        const name = elements.surveyNameInput.value.trim();
        const user = auth.currentUser;
        
        elements.startChattingBtn.textContent = "Saving...";
        
        try {
            await setDoc(doc(db, 'user-profiles', user.uid), {
                chatProfile: {
                    name: name,
                    termsAccepted: true,
                    joinedAt: serverTimestamp()
                }
            }, { merge: true });

            localStorage.setItem('chatUserName', name);
            localStorage.setItem('chatTermsAccepted', 'true');
            
            elements.surveyModal.classList.remove('active');
            togglePopup(elements.chatPopup);
            loadMessages();
        } catch(e) {
            console.error(e);
            alert("Error creating profile");
        } finally {
            elements.startChattingBtn.textContent = "Agree & Start Chatting";
        }
    }
    
    // ... (sendMessage and loadMessages remain largely the same as your original file, just ensure correct collection 'frontend-chat') ...
    
    function loadMessages() {
        elements.chatLoading.classList.add('active');
        const q = query(collection(db, 'frontend-chat'), orderBy('timestamp', 'asc'));
        unsubscribeMessages = onSnapshot(q, (snap) => {
            elements.chatMessages.innerHTML = '';
            snap.forEach(doc => {
                const msg = doc.data();
                const div = document.createElement('div');
                div.className = `message ${auth.currentUser && msg.userId === auth.currentUser.uid ? 'user-message' : ''}`;
                div.innerHTML = `
                    <div class="message-header">
                        <span class="message-sender">${msg.userName}</span>
                    </div>
                    <p class="message-text">${msg.text}</p>
                `;
                elements.chatMessages.appendChild(div);
            });
            elements.chatLoading.classList.remove('active');
            elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
        });
    }

    async function sendMessage() {
        const text = elements.messageInput.value.trim();
        if(!text) return;
        
        const user = auth.currentUser;
        const name = localStorage.getItem('chatUserName') || user.displayName;
        
        elements.messageInput.value = '';
        await addDoc(collection(db, 'frontend-chat'), {
            text, userId: user.uid, userName: name, userPhoto: user.photoURL, timestamp: serverTimestamp()
        });
    }
});
