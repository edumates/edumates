// popup-rating.js
// Displays a popup after 90 seconds to collect rating + comment and save to Firestore collection "feedback"

(async function () {
  // ====== Firebase Init ======
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
  const { getFirestore, collection, addDoc, serverTimestamp } =
    await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js");

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  let rating = 0;
  
  // New: LocalStorage Key for frequency control
  const FEEDBACK_SHOWN_KEY = 'edumates_feedback_shown';

  function createStyles() {
    const css = `
      .sr-overlay {
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        transition: opacity 0.3s;
        opacity: 0;
      }
      .sr-overlay.visible {
        opacity: 1;
      }
      .sr-modal {
        background: white;
        padding: 30px;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
        max-width: 400px;
        width: 90%;
        text-align: center;
        transform: scale(0.8);
        transition: transform 0.3s ease-out;
      }
      .sr-overlay.visible .sr-modal {
        transform: scale(1);
      }
      .sr-close {
        position: absolute;
        top: 10px;
        right: 15px;
        font-size: 1.5rem;
        cursor: pointer;
        color: #999;
      }
      .sr-star-rating {
        margin: 15px 0 20px;
        display: flex;
        justify-content: center;
      }
      .sr-star {
        font-size: 30px;
        color: #ccc;
        cursor: pointer;
        margin: 0 5px;
        transition: color 0.2s;
      }
      .sr-star.filled {
        color: #ffc107; /* Gold */
      }
      .sr-star.empty {
        color: #ccc;
      }
      .sr-comment-area {
        width: 100%;
        min-height: 80px;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 6px;
        margin-bottom: 20px;
        resize: vertical;
        font-family: inherit;
      }
      .sr-submit-btn {
        background-color: #1e3a8a;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 6px;
        cursor: pointer;
        font-weight: bold;
        transition: background-color 0.2s;
        width: 100%;
      }
      .sr-submit-btn:hover {
        background-color: #2563eb;
      }
      .sr-modal h3 {
          margin-top: 0;
          color: #1e3a8a;
      }
    `;
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
  }

  function createPopup() {
    const overlay = document.createElement('div');
    overlay.className = 'sr-overlay';

    const modal = document.createElement('div');
    modal.className = 'sr-modal';
    modal.innerHTML = `
      <span class="sr-close" aria-label="Close">&times;</span>
      <h3>How would you rate your experience?</h3>
      <div class="sr-star-rating">
        <i class="sr-star empty" data-value="1">&#9733;</i>
        <i class="sr-star empty" data-value="2">&#9733;</i>
        <i class="sr-star empty" data-value="3">&#9733;</i>
        <i class="sr-star empty" data-value="4">&#9733;</i>
        <i class="sr-star empty" data-value="5">&#9733;</i>
      </div>
      <textarea class="sr-comment-area" placeholder="Any suggestions or comments? (Optional)"></textarea>
      <button class="sr-submit-btn">Submit Feedback</button>
    `;
    overlay.appendChild(modal);

    // Event Listeners
    modal.querySelector('.sr-close').addEventListener('click', () => {
      document.body.removeChild(overlay);
    });

    modal.querySelectorAll('.sr-star').forEach(star => {
      star.addEventListener('click', onStarClick);
    });

    modal.querySelector('.sr-submit-btn').addEventListener('click', async () => {
      const commentArea = modal.querySelector('.sr-comment-area');
      const comment = commentArea.value.trim();
      await submitFeedback(rating, comment);
      document.body.removeChild(overlay);
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) document.body.removeChild(overlay);
    });

    // Animate in
    setTimeout(() => overlay.classList.add('visible'), 10);

    return overlay;
  }

  function onStarClick(e) {
    const val = Number(this.getAttribute('data-value'));
    rating = val;
    const stars = this.parentElement.querySelectorAll('.sr-star');
    stars.forEach((el) => {
      const v = Number(el.getAttribute('data-value'));
      if (v <= val) {
        el.classList.add('filled'); el.classList.remove('empty');
      } else {
        el.classList.add('empty'); el.classList.remove('filled');
      }
    });
  }

  async function submitFeedback(ratingValue, comment) {
    try {
      await addDoc(collection(db, "feedback"), {
        rating: ratingValue || 0,
        comment: comment || '',
        pageUrl: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: serverTimestamp()
      });
      console.info("✅ Feedback successfully saved to Firestore");
    } catch (e) {
      console.error("❌ Error while saving feedback:", e);
    }
  }

  function init() {
    createStyles();
    
    // Check if the form has already been shown to this user
    if (localStorage.getItem(FEEDBACK_SHOWN_KEY) === 'true') {
        console.log("Feedback form previously shown. Skipping.");
        return;
    }

    // 1. Update timeout to 90 seconds (1 minute 30 seconds)
    setTimeout(() => {
      
      // 2. Set the flag in localStorage immediately before displaying
      localStorage.setItem(FEEDBACK_SHOWN_KEY, 'true');
      
      document.body.appendChild(createPopup());
    }, 90000); // 90 seconds
  }

  init();
})();
