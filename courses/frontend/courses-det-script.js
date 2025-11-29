document.addEventListener('DOMContentLoaded', async function() {
    // Firebase Configuration - KEEP AS IS
    const firebaseConfig = {
        apiKey: "AIzaSyBhCxGjQOQ88b2GynL515ZYQXqfiLPhjw4",
        authDomain: "edumates-983dd.firebaseapp.com",
        projectId: "edumates-983dd",
        storageBucket: "edumates-983dd.firebasestorage.app",
        messagingSenderId: "172548876353",
        appId: "1:172548876353:web:955b1f41283d26c44c3ec0",
        measurementId: "G-L1KCZTW8R9"
    };

    // Import Firebase libraries
    const { initializeApp } = await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js");
    const { getAuth, GoogleAuthProvider, signInWithPopup, signOut } = await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js");
    const { getAnalytics } = await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-analytics.js");
    const { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, limit, startAfter, where, getDocs } = await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js");

    // Initialize App
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const provider = new GoogleAuthProvider();
    const analytics = getAnalytics(app);
    const db = getFirestore(app);
    
    // DOM Elements
    const elements = {
        currentYear: document.querySelector('.current-year'),
        mobileMenuBtn: document.querySelector('.mobile-menu-btn'),
        navLinks: document.querySelector('.nav-links'),
        viewRoadmapBtn: document.querySelector('.view-roadmap-btn'),
        roadmapPopup: document.querySelector('#roadmapPopup'),
        closeRoadmap: document.querySelector('#closeRoadmap'),
        toggleFeatures: document.querySelectorAll('.toggle-features'),
        googleLoginBtn: document.getElementById('googleLoginBtn'),
        chatBtn: document.getElementById('chatBtn'),
        chatPopup: document.getElementById('chatPopup'),
        closeChat: document.getElementById('closeChat'),
        chatMessages: document.getElementById('chatMessages'),
        messageInput: document.getElementById('messageInput'),
        sendMessageBtn: document.getElementById('sendMessageBtn'),
        chatLoading: document.getElementById('chatLoading'),
        loadMoreBtn: document.getElementById('loadMoreBtn')
    };

    // Set current year
    if (elements.currentYear) {
        elements.currentYear.textContent = new Date().getFullYear();
    }

    // Check saved name on load
    const savedName = localStorage.getItem('chatUserName');
    if (savedName) {
        const nameField = document.getElementById('usernameInput');
        if (nameField) {
            nameField.value = savedName;
            nameField.style.display = 'none';
        }
    }

    // Update Exam Links (Preserved but logic might need checking if file names changed)
    function updateExamLinks() {
        const examLinks = [
            { text: 'HTML Quiz', href: 'exam-html.html' },
            { text: 'CSS Quiz', href: 'exam-css.html' },
            { text: 'JavaScript Quiz', href: 'exam-js.html' },
            { text: 'Git Quiz', href: 'exam-git.html' },
            { text: 'Frameworks Quiz', href: 'exam-frameworks.html' },
            { text: 'Tools Quiz', href: 'exam-tools.html' },
            { text: 'Design Quiz', href: 'exam-design.html' },
            { text: 'Performance Quiz', href: 'exam-performance.html' },
            { text: 'Accessibility Quiz', href: 'exam-accessibility.html' },
            { text: 'Testing Quiz', href: 'exam-testing.html' },
            { text: 'Deployment Quiz', href: 'exam-deployment.html' }
        ];

        document.querySelectorAll('.features-list a').forEach(link => {
            examLinks.forEach(exam => {
                if (link.textContent.trim() === exam.text) {
                    link.setAttribute('href', exam.href);
                }
            });
        });
    }

    updateExamLinks();

    // Page variables
    let lastVisible = null;
    let unsubscribeMessages = null;
    let unsubscribeRatings = {};

    setupEventListeners();

    // Mobile Menu
    function toggleMobileMenu() {
        if (!elements.navLinks) return;
        const isOpen = elements.navLinks.classList.contains('active');
        elements.navLinks.classList.toggle('active');
        elements.mobileMenuBtn.innerHTML = isOpen ?
            '<i class="fas fa-bars"></i>' :
            '<i class="fas fa-times"></i>';
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
            const isActive = elements.roadmapPopup.classList.toggle('active');
            elements.roadmapPopup.setAttribute('aria-hidden', !isActive);
        }
    }

    // Chat Popup
    function toggleChatPopup() {
        if (elements.chatPopup) {
            const isActive = elements.chatPopup.classList.toggle('active');
            elements.chatPopup.setAttribute('aria-hidden', !isActive);
            if (isActive) {
                elements.messageInput.focus();
                if (!elements.chatMessages.hasChildNodes()) {
                    loadMessages();
                }
                scrollChatToBottom();
            } else if (unsubscribeMessages) {
                unsubscribeMessages();
                unsubscribeMessages = null;
            }
        }
    }

    function scrollChatToBottom() {
        if (elements.chatMessages) {
            elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
        }
    }

    async function sendMessage() {
        const user = auth.currentUser;
        if (!user) {
            alert('Please login to send messages');
            return;
        }

        const messageText = elements.messageInput.value.trim();
        if (!messageText) {
            alert('Please enter a valid message');
            return;
        }

        if (messageText.length > 500) {
            alert('Message too long, max 500 characters');
            return;
        }

        try {
            elements.sendMessageBtn.disabled = true;
            elements.messageInput.disabled = true;

            const nameField = document.getElementById('usernameInput');
            const saveBtn = document.getElementById('saveUsernameBtn');
            let chatUserName =
                localStorage.getItem('chatUserName') ||
                nameField?.value.trim() ||
                user.displayName ||
                'User';

            if (nameField && nameField.value.trim() !== '') {
                localStorage.setItem('chatUserName', nameField.value.trim());
                nameField.style.display = 'none';
                if (saveBtn) saveBtn.style.display = 'none';
            }

            // Using 'frontend-chat' collection (Same as Arabic version to keep functionality)
            await addDoc(collection(db, 'frontend-chat'), {
                text: messageText,
                userId: user.uid,
                userName: chatUserName,
                userPhoto: user.photoURL || 'https://via.placeholder.com/30',
                timestamp: serverTimestamp()
            });

            elements.messageInput.value = '';
            
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Error sending message: ' + error.message);
        } finally {
            elements.sendMessageBtn.disabled = false;
            elements.messageInput.disabled = false;
            elements.messageInput.focus();
        }
    }

    function loadMessages() {
        elements.chatLoading.classList.add('active');
        
        let messagesQuery = query(
            collection(db, 'frontend-chat'),
            orderBy('timestamp', 'asc')
        );

        unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
            elements.chatMessages.innerHTML = '';
            
            if (snapshot.empty) {
                elements.chatLoading.classList.remove('active');
                return;
            }

            const messages = [];
            snapshot.forEach((doc) => {
                messages.push({ id: doc.id, ...doc.data() });
            });

            elements.chatLoading.classList.remove('active');

            messages.forEach((message) => {
                if (!message.text || !message.timestamp) return;
                
                const isCurrentUser = auth.currentUser && message.userId === auth.currentUser.uid;
                const messageElement = document.createElement('div');
                messageElement.className = `message ${isCurrentUser ? 'user-message' : ''}`;
                messageElement.innerHTML = `
                    <div class="message-header">
                        <img src="${message.userPhoto}" alt="${sanitizeHTML(message.userName)}" class="message-avatar">
                        <span class="message-sender">${sanitizeHTML(message.userName)}</span>
                        <span class="message-time">${
                            message.timestamp ? new Date(message.timestamp.toMillis()).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'Now'
                        }</span>
                    </div>
                    <p class="message-text">${sanitizeHTML(message.text)}</p>
                `;
                elements.chatMessages.appendChild(messageElement);
            });

            scrollChatToBottom();
        }, (error) => {
            console.error('Error loading messages:', error);
            elements.chatLoading.classList.remove('active');
        });
    }

    function sanitizeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str.replace(/[<>]/g, '');
        return div.innerHTML;
    }

    function toggleFeatures(event) {
        const toggle = event.currentTarget;
        const featuresList = toggle.nextElementSibling.nextElementSibling;
        const isActive = featuresList.classList.contains('active');

        document.querySelectorAll('.features-list').forEach(list => {
            list.classList.remove('active');
        });
        document.querySelectorAll('.toggle-features').forEach(t => {
            t.classList.remove('active');
        });

        if (!isActive) {
            featuresList.classList.add('active');
            toggle.classList.add('active');
        }
    }

    async function handleGoogleLogin() {
        try {
            elements.googleLoginBtn.disabled = true;
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            updateUIAfterLogin(user);
        } catch (error) {
            console.error('Login error:', error);
            alert('Error logging in: ' + error.message);
        } finally {
            elements.googleLoginBtn.disabled = false;
        }
    }

    function updateUIAfterLogin(user) {
        if (elements.googleLoginBtn) {
            elements.googleLoginBtn.innerHTML = `
                <img src="${user.photoURL || 'https://via.placeholder.com/30'}" 
                     alt="${sanitizeHTML(user.displayName || 'User')}" class="user-avatar">
                <span>${sanitizeHTML(user.displayName || 'User')}</span>
                <i class="fas fa-sign-out-alt logout-icon" aria-label="Logout"></i>
            `;
            
            const logoutIcon = elements.googleLoginBtn.querySelector('.logout-icon');
            if (logoutIcon) {
                logoutIcon.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    try {
                        await signOut(auth);
                        location.reload();
                    } catch (error) {
                        console.error('Logout error:', error);
                    }
                });
            }
        }
    }

    async function submitRating(linkId, rating) {
        const user = auth.currentUser;
        if (!user) {
            alert('Please login to rate');
            return;
        }

        try {
            const existingRatingQuery = query(
                collection(db, 'frontend-ratings'),
                where('linkId', '==', linkId),
                where('userId', '==', user.uid)
            );
            const existingRatingSnapshot = await getDocs(existingRatingQuery);

            if (!existingRatingSnapshot.empty) {
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
            alert('Error submitting rating: ' + error.message);
        }
    }

    function updateStarDisplay(starsContainer, rating, ratingCount, userRating = null) {
        const stars = starsContainer.querySelectorAll('i');
        stars.forEach(star => {
            const starValue = parseInt(star.getAttribute('data-value'));
            if (userRating && starValue <= userRating) {
                star.classList.add('rated');
                star.style.color = 'var(--accent-orange)';
            }
            else if (rating > 0 && starValue <= Math.floor(rating)) {
                star.classList.add('rated');
                star.style.color = 'var(--accent-orange)';
            }
            else {
                star.classList.remove('rated');
                star.style.color = 'var(--text-light)';
            }
        });
        const averageRatingElement = starsContainer.querySelector('.average-rating');
        const ratingCountElement = starsContainer.querySelector('.rating-count');
        averageRatingElement.textContent = rating ? rating.toFixed(1) : '0.0';
        ratingCountElement.textContent = `(${ratingCount} ratings)`;
    }

    async function loadRatings(linkId, starsContainer) {
        const ratingsQuery = query(
            collection(db, 'frontend-ratings'),
            where('linkId', '==', linkId)
        );

        unsubscribeRatings[linkId] = onSnapshot(ratingsQuery, async (snapshot) => {
            let totalRating = 0;
            let ratingCount = 0;
            let userRating = null;

            const user = auth.currentUser;
            if (user) {
                const userRatingQuery = query(
                    collection(db, 'frontend-ratings'),
                    where('linkId', '==', linkId),
                    where('userId', '==', user.uid)
                );
                const userRatingSnapshot = await getDocs(userRatingQuery);
                if (!userRatingSnapshot.empty) {
                    userRating = userRatingSnapshot.docs[0].data().rating;
                }
            }

            snapshot.forEach(doc => {
                totalRating += doc.data().rating;
                ratingCount++;
            });

            const averageRating = ratingCount > 0 ? totalRating / ratingCount : 0;
            updateStarDisplay(starsContainer, averageRating, ratingCount, userRating);
        }, (error) => {
            console.error('Error loading ratings:', error);
            updateStarDisplay(starsContainer, 0, 0);
        });
    }

    function setupEventListeners() {
        if (elements.mobileMenuBtn) {
            elements.mobileMenuBtn.addEventListener('click', () => {
                toggleMobileMenu();
            });
        }

        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', closeMobileMenu);
        });

        if (elements.viewRoadmapBtn) {
            elements.viewRoadmapBtn.addEventListener('click', () => {
                toggleRoadmapPopup();
            });
        }

        if (elements.closeRoadmap) {
            elements.closeRoadmap.addEventListener('click', () => {
                toggleRoadmapPopup();
            });
        }

        if (elements.chatBtn) {
            elements.chatBtn.addEventListener('click', () => {
                const user = auth.currentUser;
                if (!user) {
                    alert('Please login to open chat');
                    return;
                }
                toggleChatPopup();
            });
        }

        if (elements.closeChat) {
            elements.closeChat.addEventListener('click', () => {
                toggleChatPopup();
            });
        }

        if (elements.sendMessageBtn) {
            elements.sendMessageBtn.addEventListener('click', sendMessage);
        }

        if (elements.messageInput) {
            elements.messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                }
            });
        }

        elements.toggleFeatures.forEach(toggle => {
            toggle.addEventListener('click', toggleFeatures);
        });

        if (elements.googleLoginBtn) {
            elements.googleLoginBtn.addEventListener('click', handleGoogleLogin);
        }

        document.querySelectorAll('.rating-stars').forEach(starsContainer => {
            const linkId = starsContainer.parentElement.getAttribute('data-link-id');
            loadRatings(linkId, starsContainer);

            starsContainer.querySelectorAll('i').forEach(star => {
                star.addEventListener('click', () => {
                    const rating = parseInt(star.getAttribute('data-value'));
                    submitRating(linkId, rating);
                });
            });
        });
    }
 
    auth.onAuthStateChanged(user => {
        if (user) {
            updateUIAfterLogin(user);
            if (elements.chatPopup.classList.contains('active') && !unsubscribeMessages) {
                loadMessages();
            }
            document.querySelectorAll('.rating-stars').forEach(starsContainer => {
                const linkId = starsContainer.parentElement.getAttribute('data-link-id');
                loadRatings(linkId, starsContainer);
            });
        } else {
            elements.chatMessages.innerHTML = '';
            lastVisible = null;
            if (elements.loadMoreBtn) elements.loadMoreBtn.style.display = 'none';
            if (unsubscribeMessages) {
                unsubscribeMessages();
                unsubscribeMessages = null;
            }
            Object.values(unsubscribeRatings).forEach(unsubscribe => unsubscribe());
            unsubscribeRatings = {};
            document.querySelectorAll('.rating-stars').forEach(starsContainer => {
                const linkId = starsContainer.parentElement.getAttribute('data-link-id');
                loadRatings(linkId, starsContainer);
            });
        }
    });
});

// Roadmap Logic (English)
document.addEventListener('DOMContentLoaded', function () {
  const roadmapModal = document.getElementById('roadmapPopup');
  if (roadmapModal) {
    if (!roadmapModal.querySelector('.close-roadmap')) {
      const closeBtn = document.createElement('button');
      closeBtn.className = 'close-roadmap';
      closeBtn.innerHTML = '×';
      closeBtn.setAttribute('aria-label', 'Close Roadmap');
      closeBtn.style.position = 'absolute';
      closeBtn.style.top = '10px';
      closeBtn.style.right = '20px'; // Changed to right
      closeBtn.style.background = 'transparent';
      closeBtn.style.border = 'none';
      closeBtn.style.fontSize = '1.5rem';
      closeBtn.style.cursor = 'pointer';
      roadmapModal.prepend(closeBtn);
      closeBtn.addEventListener('click', function () {
        roadmapModal.classList.remove('active');
      });
    }
  }
});

function setupRoadmapChecks() {
  document.querySelectorAll('.roadmap-task').forEach(item => {
    // We assume the text content defines the skill, e.g., "HTML"
    const skillName = item.childNodes[0].textContent.trim();
    const checkBtn = item.querySelector('.mark-done');

    if (!skillName || !checkBtn) return;

    if (localStorage.getItem(`roadmap-${skillName}`) === 'completed') {
      item.classList.add('done');
      checkBtn.textContent = 'Done ✔';
    } else {
        checkBtn.textContent = 'Check';
    }

    checkBtn.addEventListener('click', () => {
      const isCompleted = item.classList.toggle('done');
      if (isCompleted) {
        localStorage.setItem(`roadmap-${skillName}`, 'completed');
        checkBtn.textContent = 'Done ✔';
      } else {
        localStorage.removeItem(`roadmap-${skillName}`);
        checkBtn.textContent = 'Check';
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', setupRoadmapChecks);