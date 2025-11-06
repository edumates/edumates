document.addEventListener('DOMContentLoaded', function() {
    // عناصر DOM الرئيسية
    const elements = {
        startHereContainer: document.querySelector('#start-here-container'),
        specialtiesContainer: document.querySelector('#specialties-container'),
        mobileMenuBtn: document.querySelector('.mobile-menu-btn'),
        navLinks: document.querySelector('.nav-links'),
        currentYear: document.querySelector('.current-year')
    };

    // التحقق من وجود العناصر
    if (!elements.startHereContainer || !elements.specialtiesContainer) {
        console.error('Containers not found');
        return;
    }

    // بيانات الكورسات
    const coursesData = [
        {
            id: 1,
            title: " frontend تطوير الواجهه الاماميه ",
            category: "تطوير الويب",
            level: "مبتدئ",
            image: "../pic/courses-pic/frontend-pic.jpg",
            lessons: 24,
            price: "مجاني",
            description: "هذا الكورس سيعلمك أساسيات تطوير الويب باستخدام HTML و CSS لبناء مواقع ويب جميلة وتفاعلية.",
            link: "../courses/front-end/courses=det.html"
        },
        {
            id: 2,
            title: "Back End تطوير الواجهه الخلفيه",
            category: "تطوير الويب",
            level: "مبتدئ",
            image: "../pic/courses-pic/backend.jpg",
            lessons: 17,
            price: "مجاني",
            description: "هذا الكورس سيعلمك أساسيات تطوير الـ Back End باستخدام Node.js وExpress لإنشاء تطبيقات ويب ديناميكية وقوية.",
            link: "../courses/BackEnd/courses=det.html"
        },
        {
            id: 3,
            title: "أساسيات البرمجة",
            category: "تطوير البرمجيات",
            level: "مبتدئ",
            image: "../pic/courses-pic/programming-basics.png",
            lessons: 11,
            price: "مجاني",
            description: "هذا الكورس سيعلمك أساسيات البرمجة باستخدام Python، مع التركيز على المفاهيم الأساسية مثل المتغيرات، الحلقات، والدوال.",
            link: "../courses/programing-basics/programing-basics.html"
        },
        {
            id: 4,
            title: "data analysis تحليل البيانات",
            category: "علوم البيانات",
            level: "مبتدئ",
            image: "../pic/courses-pic/data-analysis.png",
            lessons: 18,
            price: "مجاني",
            description: "هذا الكورس سيعلمك أساسيات تحليل البيانات باستخدام Python و Pandas، مع التركيز على التنظيف، التحليل، والتصور البياني للبيانات.",
            link: "../courses/J-data-analysis/data-analysis.html"
        }
    ];

    // تطبيق إدارة الكورسات
    const app = {
        init() {
            this.setupEventListeners();
            this.initSections();
            this.setCurrentYear();
        },

        setupEventListeners() {
            // القائمة المتنقلة
            if (elements.mobileMenuBtn) {
                elements.mobileMenuBtn.addEventListener('click', this.toggleMobileMenu);
            }

            // إغلاق القائمة عند النقر على رابط
            document.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', this.closeMobileMenu);
            });
        },

        setCurrentYear() {
            if (elements.currentYear) {
                elements.currentYear.textContent = new Date().getFullYear();
            }
        },

        toggleMobileMenu() {
            if (!elements.navLinks) return;
            const isOpen = elements.navLinks.style.display === 'flex';
            elements.navLinks.style.display = isOpen ? 'none' : 'flex';
            elements.mobileMenuBtn.innerHTML = isOpen ?
                '<i class="fas fa-bars"></i>' :
                '<i class="fas fa-times"></i>';
        },

        closeMobileMenu() {
            if (window.innerWidth <= 768 && elements.navLinks) {
                elements.navLinks.style.display = 'none';
                elements.mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
            }
        },

        // عرض قسم واحد من الكورسات
        displaySection(container, courses) {
            container.innerHTML = '';
            courses.forEach(course => {
                const courseElement = document.createElement('div');
                courseElement.classList.add('course-item');
                courseElement.innerHTML = `
                    <img src="${course.image}" alt="${course.title}" class="course-img">
                    <div class="course-info">
                        <h3 class="course-title">${course.title}</h3>
                        <div class="course-meta">
                            <span>${course.lessons} مصدر</span>
                            <span class="course-price ${course.price === 'مجاني' ? 'free' : ''}">${course.price}</span>
                        </div>
                        <a href="${course.link}" class="btn learn-btn">عرض التفاصيل</a>
                    </div>
                `;
                container.appendChild(courseElement);
            });
        },

        // تهيئة الأقسام المنفصلة
        initSections() {
            // قسم "ابدأ هنا": خطة أساسيات البرمجة فقط (id: 3)
            const startHereCourse = coursesData.find(course => course.id === 3);
            if (startHereCourse) {
                this.displaySection(elements.startHereContainer, [startHereCourse]);
            }

            // قسم "اختار تخصصك": باقي الخطط (id: 1, 2, 4)
            const specialtiesCourses = coursesData.filter(course => course.id !== 3);
            this.displaySection(elements.specialtiesContainer, specialtiesCourses);
        }
    };

    // بدء التطبيق
    app.init();

});
