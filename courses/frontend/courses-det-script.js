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
    const { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, where, getDocs, doc, setDoc, getDoc } = await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js");

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
    };

    if (elements.currentYear) elements.currentYear.textContent = new Date().getFullYear();

    // Global Unsubscribe functions (to stop listening when logged out)
    let unsubscribeRatings = {};

    // ---------------------------------------------------------
    // 3. Authentication Logic
    // ---------------------------------------------------------
    
    // Listen to Auth State Changes
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            console.log("User Logged In:", user.uid);
            updateUIAfterLogin(user);
            await loadUserProfileData(user); // Load Roadmap Profile
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
    // 5. Rating System (DB: frontend-ratings)
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
            
            // UI updates automatically via listener

        } catch (error) {
            console.error("Rating Error:", error);
        }
    }

    function refreshRatings() {
        // Re-attach listeners to ensure they have current user context if needed
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
    // 6. General UI & Helpers
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

    function sanitizeHTML(str) {
        if (!str) return '';
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    }

    // ---------------------------------------------------------
    // 7. Event Listeners Setup
    // ---------------------------------------------------------
    
    // Auth
    if (elements.googleLoginBtn) elements.googleLoginBtn.addEventListener('click', handleGoogleLogin);

    // Nav
    if (elements.mobileMenuBtn) elements.mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    document.querySelectorAll('.nav-link').forEach(l => l.addEventListener('click', closeMobileMenu));

    // Roadmap
    if (elements.viewRoadmapBtn) elements.viewRoadmapBtn.addEventListener('click', toggleRoadmapPopup);
    if (elements.closeRoadmap) elements.closeRoadmap.addEventListener('click', toggleRoadmapPopup);

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
