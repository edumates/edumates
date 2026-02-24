// script.js

// تهيئة التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // تحديث السنة الحالية في حقوق النشر
    updateCopyrightYear();
    
    // تهيئة القائمة المتنقلة للموبايل
    initMobileMenu();
    
    // إضافة تأثيرات تفاعلية للبطاقات
    initCardInteractions();
    
    // إضافة تأثيرات التمرير السلس
    initSmoothScrolling();
    
    // تتبع الأحداث لتحليلات جوجل
    initAnalyticsTracking();
});

// تحديث السنة في حقوق النشر
function updateCopyrightYear() {
    const yearElements = document.querySelectorAll('.current-year');
    const currentYear = new Date().getFullYear();
    
    yearElements.forEach(element => {
        element.textContent = currentYear;
    });
}

// تهيئة القائمة المتنقلة للموبايل
function initMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    const authButtons = document.querySelector('.auth-buttons');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            const isNavVisible = navLinks.style.display === 'flex';
            const isAuthVisible = authButtons.style.display === 'flex';
            
            // تبديل عرض القوائم
            navLinks.style.display = isNavVisible ? 'none' : 'flex';
            authButtons.style.display = isAuthVisible ? 'none' : 'flex';
            
            // تغيير أيقونة القائمة
            this.classList.toggle('active');
        });
    }
}

// تأثيرات تفاعلية للبطاقات
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

// التمرير السلس للروابط الداخلية
function initSmoothScrolling() {
    const internalLinks = document.querySelectorAll('a[href^="#"]');
    
    internalLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 80; // تعويض لشريط التنقل
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
                
                // إغلاق القائمة المتنقلة إذا كانت مفتوحة
                closeMobileMenu();
            }
        });
    });
}

// إغلاق القائمة المتنقلة
function closeMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    const authButtons = document.querySelector('.auth-buttons');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    
    if (navLinks && window.innerWidth <= 768) {
        navLinks.style.display = 'none';
        authButtons.style.display = 'none';
        
        if (mobileMenuBtn) {
            mobileMenuBtn.classList.remove('active');
        }
    }
}

// تتبع الأحداث لتحليلات جوجل
function initAnalyticsTracking() {
    // تتبع النقر على الروابط الاجتماعية
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
    
    // تتبع النقر على أزرار الدعوة للإجراء (CTA)
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
    
    // تتبع التفاعل مع البطاقات
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

// إدارة حالة التحميل
function showLoading() {
    const loadingElement = document.createElement('div');
    loadingElement.id = 'loading-overlay';
    loadingElement.innerHTML = `
        <div class="loading-spinner">
            <i class="fas fa-spinner fa-spin"></i>
            <p>جاري التحميل...</p>
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
        font-family: 'Tajawal', sans-serif;
    `;
    
    document.body.appendChild(loadingElement);
}

function hideLoading() {
    const loadingElement = document.getElementById('loading-overlay');
    if (loadingElement) {
        loadingElement.remove();
    }
}

// إدارة النمط المرئي بناءً على تفضيلات المستخدم
function initVisualPreferences() {
    // الكشف عن تفضيلات النظام للوضع الداكن
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    // إضافة فئة للجسم إذا كان المستخدم يفضل الوضع الداكن
    if (prefersDarkScheme.matches) {
        document.body.classList.add('dark-mode-preference');
    }
    
    // الاستماع للتغيرات في تفضيلات النظام
    prefersDarkScheme.addEventListener('change', (e) => {
        if (e.matches) {
            document.body.classList.add('dark-mode-preference');
        } else {
            document.body.classList.remove('dark-mode-preference');
        }
    });
}

// التحقق من دعم المتصفح للخصائص الحديثة
function checkBrowserSupport() {
    const supportsFlexGap = CSS.supports('gap', '1rem');
    const supportsSticky = CSS.supports('position', 'sticky');
    
    if (!supportsFlexGap || !supportsSticky) {
        console.warn('بعض خصائص CSS غير مدعومة في هذا المتصفح');
        // يمكن إضافة polyfills هنا إذا لزم الأمر
    }
}

// إدارة حالة التنقل النشط
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

// تهيئة جميع الوظائف
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

// تشغيل التهيئة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', initAll);

// إضافة بعض الأنماط الإضافية عبر JavaScript
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
        .nav-links.show,
        .auth-buttons.show {
            display: flex !important;
        }
    }
`;

// إضافة الأنماط الإضافية للصفحة
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);