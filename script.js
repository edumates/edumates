// script.js

// Initialize app when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    // Update copyright year
    updateCopyrightYear();
    
    // Initialize mobile menu
    initMobileMenu();
    
    // Initialize card interactions
    initCardInteractions();
    
    // Initialize smooth scrolling
    initSmoothScrolling();
    
    // Initialize Google Analytics tracking
    initAnalyticsTracking();
});

// Update Copyright Year
function updateCopyrightYear() {
    const yearElements = document.querySelectorAll('.current-year');
    const currentYear = new Date().getFullYear();
    
    yearElements.forEach(element => {
        element.textContent = currentYear;
    });
}

// Initialize Mobile Menu
function initMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    const authButtons = document.querySelector('.auth-buttons');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            // Toggle 'show' class instead of inline styles for cleaner handling
            navLinks.classList.toggle('show');
            if(authButtons) authButtons.classList.toggle('show');
            
            // Toggle icon active state
            this.classList.toggle('active');
        });
    }
}

// Card Interactions
function initCardInteractions() {
    const cards = document.querySelectorAll('.feature-card, .course-card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
            this.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.15)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
        });
        
        card.addEventListener('focus', function() {
            this.style.outline = '2px solid var(--primary-blue)';
            this.style.outlineOffset = '2px';
        });
        
        card.addEventListener('blur', function() {
            this.style.outline = 'none';
        });
    });
}

// Smooth Scrolling
function initSmoothScrolling() {
    const internalLinks = document.querySelectorAll('a[href^="#"]');
    
    internalLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 80; // Navbar offset
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                closeMobileMenu();
            }
        });
    });
}

// Close Mobile Menu
function closeMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    
    if (navLinks && window.innerWidth <= 768) {
        navLinks.classList.remove('show');
        
        if (mobileMenuBtn) {
            mobileMenuBtn.classList.remove('active');
        }
    }
}

// Google Analytics Tracking
function initAnalyticsTracking() {
    // Track social link clicks
    const socialLinks = document.querySelectorAll('.social-link');
    socialLinks.forEach(link => {
        link.addEventListener('click', function() {
            const platform = this.querySelector('i').className.split(' ')[1];
            gtag('event', 'social_click', {
                'event_category': 'Social Media',
                'event_label': platform,
                'platform': platform
            });
        });
    });
    
    // Track CTA button clicks
    const ctaButtons = document.querySelectorAll('.primary-btn, .register-btn');
    ctaButtons.forEach(button => {
        button.addEventListener('click', function() {
            const buttonText = this.textContent.trim();
            gtag('event', 'cta_click', {
                'event_category': 'Conversion',
                'event_label': buttonText,
                'button_type': this.classList.contains('primary-btn') ? 'primary' : 'register'
            });
        });
    });
    
    // Track Feature Card Interaction
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach((card, index) => {
        card.addEventListener('click', function() {
            const featureTitle = this.querySelector('.feature-title').textContent;
            gtag('event', 'feature_interaction', {
                'event_category': 'Features',
                'event_label': featureTitle,
                'feature_index': index + 1
            });
        });
    });
}

// Loading State Management (Translated)
function showLoading() {
    const loadingElement = document.createElement('div');
    loadingElement.id = 'loading-overlay';
    loadingElement.innerHTML = `
        <div class="loading-spinner">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Loading...</p>
        </div>
    `;
    loadingElement.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(255, 255, 255, 0.9);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        font-family: 'Poppins', sans-serif;
    `;
    
    document.body.appendChild(loadingElement);
}

function hideLoading() {
    const loadingElement = document.getElementById('loading-overlay');
    if (loadingElement) {
        loadingElement.remove();
    }
}

// Visual Preferences
function initVisualPreferences() {
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    if (prefersDarkScheme.matches) {
        document.body.classList.add('dark-mode-preference');
    }
    
    prefersDarkScheme.addEventListener('change', (e) => {
        if (e.matches) {
            document.body.classList.add('dark-mode-preference');
        } else {
            document.body.classList.remove('dark-mode-preference');
        }
    });
}

// Check Browser Support (Translated)
function checkBrowserSupport() {
    const supportsFlexGap = CSS.supports('gap', '1rem');
    const supportsSticky = CSS.supports('position', 'sticky');
    
    if (!supportsFlexGap || !supportsSticky) {
        console.warn('Some CSS properties are not supported in this browser');
    }
}

// Active Nav Link State
function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    window.addEventListener('scroll', function() {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.clientHeight;
            
            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

// Init All
function initAll() {
    updateCopyrightYear();
    initMobileMenu();
    initCardInteractions();
    initSmoothScrolling();
    initAnalyticsTracking();
    initVisualPreferences();
    checkBrowserSupport();
    updateActiveNavLink();
}

// Start on Load
document.addEventListener('DOMContentLoaded', initAll);

// Additional dynamic styles
const additionalStyles = `
    .dark-mode-preference {
        filter: invert(1) hue-rotate(180deg);
    }
    
    .loading-spinner {
        text-align: center;
        color: var(--primary-blue);
    }
    
    .loading-spinner i {
        font-size: 2rem;
        margin-bottom: 1rem;
    }
    
    .mobile-menu-btn.active {
        color: var(--primary-dark);
    }
    
    @media (max-width: 768px) {
        .nav-links.show {
            display: flex !important;
        }
    }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);