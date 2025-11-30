document.addEventListener('DOMContentLoaded', function() {
    // Main DOM Elements
    const elements = {
        startHereContainer: document.querySelector('#start-here-container'),
        specialtiesContainer: document.querySelector('#specialties-container'),
        mobileMenuBtn: document.querySelector('.mobile-menu-btn'),
        navLinks: document.querySelector('.nav-links'),
        currentYear: document.querySelector('.current-year')
    };

    // Check elements exist
    if (!elements.startHereContainer || !elements.specialtiesContainer) {
        console.error('Containers not found');
        return;
    }

    // Courses Data - Translated professionally
    const coursesData = [
        {
            id: 1,
            title: "Frontend Development",
            category: "Web Development",
            level: "Beginner",
            image: "../pic/courses-pic/frontend-pic.jpg",
            lessons: 24,
            price: "Free",
            description: "Master the fundamentals of web interface development using HTML and CSS to build stunning, interactive, and responsive websites.",
            link: "../courses/front-end/courses-det.html"
        },
        {
            id: 2,
            title: "Backend Development",
            category: "Web Development",
            level: "Beginner",
            image: "../pic/courses-pic/backend.jpg",
            lessons: 17,
            price: "Free",
            description: "Learn the core concepts of server-side programming using Node.js and Express to build robust and dynamic web applications.",
            link: "../courses/BackEnd/courses=det.html"
        },
        {
            id: 3,
            title: "Programming Basics",
            category: "Software Development",
            level: "Beginner",
            image: "../pic/courses-pic/programming-basics.png",
            lessons: 11,
            price: "Free",
            description: "Start your coding journey with Python. This course focuses on essential concepts like variables, loops, functions, and logic building.",
            link: "../courses/programing-basics/programing-basics.html"
        },
        {
            id: 4,
            title: "Data Analysis",
            category: "Data Science",
            level: "Beginner",
            image: "../pic/courses-pic/data-analysis.png",
            lessons: 18,
            price: "Free",
            description: "Dive into the world of data with Python and Pandas. Learn techniques for data cleaning, statistical analysis, and visual storytelling.",
            link: "../courses/data-analysis/data-analysis.html"
        }
    ];

    // App Logic
    const app = {
        init() {
            this.setupEventListeners();
            this.initSections();
            this.setCurrentYear();
        },

        setupEventListeners() {
            // Mobile Menu Toggle
            if (elements.mobileMenuBtn) {
                elements.mobileMenuBtn.addEventListener('click', this.toggleMobileMenu);
            }

            // Close menu when clicking a link
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

        // Display a section of courses
        displaySection(container, courses) {
            container.innerHTML = '';
            courses.forEach(course => {
                const courseElement = document.createElement('div');
                courseElement.classList.add('course-item');
                // Updated HTML structure with English text
                courseElement.innerHTML = `
                    <img src="${course.image}" alt="${course.title}" class="course-img">
                    <div class="course-info">
                        <h3 class="course-title">${course.title}</h3>
                        <div class="course-meta">
                            <span>${course.lessons} Lessons</span>
                            <span class="course-price ${course.price === 'Free' ? 'free' : ''}">${course.price}</span>
                        </div>
                        <a href="${course.link}" class="btn learn-btn">View Details</a>
                    </div>
                `;
                container.appendChild(courseElement);
            });
        },

        // Initialize separate sections
        initSections() {
            // "Start Here": Programming Basics only (id: 3)
            const startHereCourse = coursesData.find(course => course.id === 3);
            if (startHereCourse) {
                this.displaySection(elements.startHereContainer, [startHereCourse]);
            }

            // "Choose Your Path": All other courses (id: 1, 2, 4)
            const specialtiesCourses = coursesData.filter(course => course.id !== 3);
            this.displaySection(elements.specialtiesContainer, specialtiesCourses);
        }
    };

    // Start App
    app.init();

});
