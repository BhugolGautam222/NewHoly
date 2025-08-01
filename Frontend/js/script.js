// Smooth scroll for nav links
document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.nav-scroll').forEach(function(link) {
        link.addEventListener('click', function(e) {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    // Optionally close mobile menu
                    const menu = document.getElementById('menu');
                    if (menu && menu.classList.contains('active')) menu.classList.remove('active');
                }
            }
        });
    });
});
function toggleMenu() {
    const menu = document.getElementById('menu');
    if (menu) {
        menu.classList.toggle('active');
    }
}

// --- Image Slider Logic (Smoother with requestAnimationFrame) ---
let slideIndex = 0;
let lastFrameTime = 0;
const slideInterval = 3000;

function animateSlider(currentTime) {
    if (!lastFrameTime) lastFrameTime = currentTime;
    const elapsed = currentTime - lastFrameTime;

    if (elapsed > slideInterval) {
        const slides = document.getElementById('slider');
        if (slides) {
            const images = slides.getElementsByTagName('img');
            if (images.length > 0) {
                slideIndex = (slideIndex + 1) % images.length;
                slides.style.transform = `translateX(${-slideIndex * 100}%)`;
            }
        }
        lastFrameTime = currentTime;
    }
    requestAnimationFrame(animateSlider);
}

// --- Data Loading from Backend API ---

// --- Horizontal Downloads Scroll Rendering with Animation ---
async function renderDownloadsPreview() {
    const container = document.getElementById('downloads-scroll-container');
    const leftBtn = document.getElementById('downloads-scroll-left');
    const rightBtn = document.getElementById('downloads-scroll-right');
    if (!container) return;
    try {
        const res = await fetch('/api/downloads');
        if (!res.ok) throw new Error('Failed to fetch downloads');
        const data = (await res.json()).data || [];
        if (data.length === 0) {
            container.innerHTML = `<div class="downloads-card no-data-card"><h3>No Downloads Yet</h3><p>Important documents and resources will appear here soon.</p></div>`;
            if (leftBtn) leftBtn.style.display = 'none';
            if (rightBtn) rightBtn.style.display = 'none';
            return;
        }
        container.innerHTML = data.slice(0, 8).map(dl => `
            <div class="downloads-card downloads-card-animate">
                ${dl.iconUrl ? `<img src="${dl.iconUrl}" class="downloads-card-img" alt="icon" loading="lazy" />` : `<img src="/Images/Logo.svg" class="downloads-card-img" alt="icon" loading="lazy" />`}
                <div class="downloads-card-title">${dl.title || 'Download'}</div>
                <div class="downloads-card-desc">${dl.description || ''}</div>
                <a href="${dl.url}" target="_blank" rel="noopener" class="downloads-card-btn">${dl.linkText || 'Download'}</a>
            </div>
        `).join('');
        // Arrow navigation
        if (leftBtn && rightBtn) {
            leftBtn.onclick = () => {
                container.scrollBy({ left: -container.offsetWidth * 0.8, behavior: 'smooth' });
            };
            rightBtn.onclick = () => {
                container.scrollBy({ left: container.offsetWidth * 0.8, behavior: 'smooth' });
            };
            // Show/hide arrows based on scroll position
            const checkScroll = () => {
                leftBtn.disabled = container.scrollLeft <= 0;
                rightBtn.disabled = container.scrollLeft >= container.scrollWidth - container.clientWidth - 2;
            };
            container.addEventListener('scroll', checkScroll);
            window.addEventListener('resize', checkScroll);
            setTimeout(checkScroll, 200);
        }
        // Animate cards in as they enter viewport horizontally
        const cards = container.querySelectorAll('.downloads-card-animate');
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.18, root: container });
        cards.forEach(card => observer.observe(card));
    } catch (e) {
        container.innerHTML = `<div class="downloads-card no-data-card"><h3>Downloads Loading Error</h3><p>Unable to load downloads at the moment. Please try again later.</p></div>`;
        if (leftBtn) leftBtn.style.display = 'none';
        if (rightBtn) rightBtn.style.display = 'none';
    }
}

// Helper function to fetch data from API
async function fetchData(endpoint) {
    try {
        const response = await fetch(endpoint);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data.data || []; // Assuming API returns { data: [...] }
    } catch (error) {
        console.error(`Error fetching data from ${endpoint}:`, error);
        return []; // Return empty array on error
    }
}

let programsData = [];
let newsEventsData = [];
let testimonialsData = [];
let facultyData = [];
let galleryData = [];
let quickLinksData = [];



// Function to load all frontend data from the backend
async function loadFrontendData() {
    programsData = await fetchData('/api/programs');
    newsEventsData = await fetchData('/api/newsEvents');
    testimonialsData = await fetchData('/api/testimonials');
    facultyData = await fetchData('/api/facultys');
    galleryData = await fetchData('/api/gallerys'); // This fetches our gallery data
    quickLinksData = await fetchData('/api/quickLinks');
}

// Render functions
function renderPrograms() {
    const container = document.getElementById('programs-grid');
    if (!container) return;
    container.innerHTML = '';
    if (programsData.length === 0) {
        container.innerHTML = '<p class="no-data-message">No academic programs available yet.</p>';
        return;
    }
    programsData.forEach(program => {
        const programCard = document.createElement('div');
        programCard.classList.add('program-card');
        programCard.innerHTML = `
            <div class="program-icon">${program.iconSvg || '<i class="fas fa-book"></i>'}</div>
            <h3>${program.title}</h3>
            <p>${program.description}</p>
        `;
        container.appendChild(programCard);
    });

    // Add View More button
    const viewMore = document.createElement('div');
    viewMore.className = 'section-view-more';
    viewMore.innerHTML = '<a href="programs.html" class="view-more-btn">View More</a>';
    container.parentElement.appendChild(viewMore);
}

function renderNewsEvents() {
    const container = document.getElementById('news-events-grid');
    if (!container) return;
    container.innerHTML = '';
    if (newsEventsData.length === 0) {
        container.innerHTML = '<p class="no-data-message">No news or events available yet.</p>';
        return;
    }
    newsEventsData.forEach(item => {
        const newsEventCard = document.createElement('div');
        newsEventCard.classList.add('news-event-card');
        newsEventCard.innerHTML = `
            ${item.imageUrl ? `<img src="${item.imageUrl}" alt="${item.title}" class="news-image" onerror="this.onerror=null;this.src='https://placehold.co/400x250/cccccc/000000?text=No+Image';" />` : ''}
            <div class="news-event-content">
                <div class="news-event-icon">${item.iconSvg || '<i class="fas fa-calendar-alt"></i>'}</div>
                <h3>${item.title} (${item.date})</h3>
                <p>${item.description}</p>
                ${item.link ? `<a href="${item.link}" class="read-more">Read More <i class="fas fa-arrow-right"></i></a>` : ''}
            </div>
        `;
        container.appendChild(newsEventCard);
    });

    // Add View More button
    const viewMore = document.createElement('div');
    viewMore.className = 'section-view-more';
    viewMore.innerHTML = '<a href="events.html" class="view-more-btn">View More</a>';
    container.parentElement.appendChild(viewMore);
}

// === Testimonials Section: Fetch and Render ===
async function renderTestimonials() {
    const container = document.getElementById('testimonials-container');
    if (!container) return;
    container.innerHTML = '<div class="testimonial-card loading"><div class="quote">Loading testimonials...</div></div>';
    try {
        const res = await fetch('/api/testimonials');
        const data = await res.json();
        if (!data.data || !Array.isArray(data.data) || data.data.length === 0) {
            container.innerHTML = '<div class="testimonial-card"><div class="quote">No testimonials yet.</div></div>';
            return;
        }
        // Render testimonials in a grid
        let html = '<div class="testimonials-grid">';
        data.data.slice(0, 6).forEach(t => {
            html += `
                <div class="testimonial-card">
                    <div class="quote-icon"><i class="fas fa-quote-left"></i></div>
                    <div class="quote">${t.quote ? t.quote : ''}</div>
                    <div class="author">${t.author || 'Anonymous'}</div>
                </div>
            `;
        });
        html += '</div>';
        container.innerHTML = html;
    } catch (e) {
        container.innerHTML = '<div class="testimonial-card error"><div class="quote">Failed to load testimonials.</div></div>';
    }
}
document.addEventListener('DOMContentLoaded', renderTestimonials);

const FACULTY_DISPLAY_LIMIT = 3; 
let facultyVisibleCount = FACULTY_DISPLAY_LIMIT;

function renderFaculty() {
    const container = document.getElementById('faculty-grid');
    const showMoreBtn = document.getElementById('showMoreFacultyBtn');
    const facultyDisplayContainer = document.getElementById('faculty-display-container');
    const facultyOverlay = document.getElementById('faculty-overlay');
    if (!container || !showMoreBtn || !facultyDisplayContainer || !facultyOverlay) return;
    container.innerHTML = '';
    if (facultyData.length === 0) {
        container.innerHTML = '<p class="no-data-message">No faculty members available yet.</p>';
        showMoreBtn.style.display = 'none';
        facultyOverlay.style.opacity = '0';
        facultyDisplayContainer.classList.remove('expanded');
        return;
    }
    facultyData.sort((a, b) => a.name.localeCompare(b.name));
    const facultyToDisplay = facultyData.slice(0, facultyVisibleCount);
    facultyToDisplay.forEach(member => {
        const facultyCard = document.createElement('div');
        facultyCard.classList.add('faculty-card');
        facultyCard.innerHTML = `
            <img src="${member.imageUrl || 'https://placehold.co/150x150/cccccc/000000?text=Faculty'}" alt="${member.name}" onerror="this.onerror=null;this.src='https://placehold.co/150x150/cccccc/000000?text=Faculty';" />
            <h3>${member.name}</h3>
            <p class="role">${member.role}</p>
            <p class="description">${member.description}</p>
        `;
        container.appendChild(facultyCard);
    });
    if (facultyData.length > FACULTY_DISPLAY_LIMIT) {
        showMoreBtn.style.display = 'block';
        if (facultyVisibleCount >= facultyData.length) {
            showMoreBtn.textContent = 'Show Less Faculty';
            facultyDisplayContainer.classList.add('expanded');
            facultyOverlay.style.opacity = '0';
        } else {
            showMoreBtn.textContent = 'Show More Faculty';
            facultyDisplayContainer.classList.remove('expanded');
            facultyOverlay.style.opacity = '1';
        }
    } else {
        showMoreBtn.style.display = 'none';
        facultyDisplayContainer.classList.add('expanded');
        facultyOverlay.style.opacity = '0';
    }
}

function toggleFacultyVisibility() {
    if (facultyVisibleCount >= facultyData.length) {
        facultyVisibleCount = FACULTY_DISPLAY_LIMIT;
    } else {
        facultyVisibleCount = facultyData.length;
    }
    renderFaculty();
}

// --- Hero Flex Gallery Rendering (Expanding Cards) ---
function renderGallery() {
    const container = document.getElementById('hero-flex-group');
    if (!container) return;
    container.innerHTML = '';

    if (galleryData.length === 0) {
        container.innerHTML = `
            <article class="relative w-full rounded-xl overflow-hidden min-h-[180px] flex items-center justify-center" style="background:#e0e7ef;">
                <span style="color:#64748b;font-size:1.1rem;">No gallery images available yet.</span>
            </article>
        `;
        return;
    }

    galleryData.forEach(item => {
        // Use item.imageUrl or item.url for image, item.caption or item.alt for title, item.link for button
        const article = document.createElement('article');
        article.className = 'group/article relative w-full rounded-xl overflow-hidden transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.15)]';
        article.tabIndex = 0;
        article.innerHTML = `
            <div class="absolute left-1/2 -translate-x-1/2 bottom-4 text-white z-10 p-3 flex flex-col gap-2 justify-end hero-flex-overlay">
                <h1 class="text-center md:text-[3vw] text-lg leading-[1.1] tracking-wider font-palker md:whitespace-nowrap md:truncate hero-flex-title">${item.caption || item.alt || ''}</h1>
                <span class="font-medium md:whitespace-nowrap md:truncate">
                    <a href="${item.link || 'gallery.html'}"><button class="md:px-8 px-6 py-2 rounded-lg hover:bg-primary-600 ease-in-out duration-300 bg-sky-500 text-white font-semibold md:text-base text-xs w-fit hero-flex-btn">View Gallery</button></a>
                </span>
            </div>
            <img alt="${item.caption || item.alt || 'Gallery Image'}" loading="lazy" decoding="async" class="object-cover h-40 md:h-[420px] w-full" src="${item.imageUrl || item.url}" onerror="this.onerror=null;this.src='https://placehold.co/400x300/cccccc/000000?text=No+Image';" style="color: transparent;">
        `;
        container.appendChild(article);
    });
}

// --- Gallery Horizontal Scrolling with Arrow Controls ---
function setupGallerySlider() {
    const container = document.getElementById('gallery-container');
    const leftBtn = document.getElementById('scroll-left');
    const rightBtn = document.getElementById('scroll-right');

    if (!container || !leftBtn || !rightBtn) return;

    // Calculate scroll amount based on visible items
    const getScrollAmount = () => {
        const item = container.querySelector('.gallery-item');
        if (!item) return 350;
        const style = window.getComputedStyle(item);
        const itemWidth = item.offsetWidth + parseInt(style.marginRight || 0);
        const visibleItems = Math.floor(container.clientWidth / itemWidth) || 1;
        return visibleItems * itemWidth;
    };

    // Check scroll position and update button states
    const checkScroll = () => {
        if (!container) return;
        // Disable left arrow if at the beginning
        leftBtn.disabled = container.scrollLeft <= 0;
        // Disable right arrow if at the end
        const maxScrollLeft = container.scrollWidth - container.clientWidth;
        rightBtn.disabled = container.scrollLeft >= maxScrollLeft - 2;
        // Add visual feedback
        leftBtn.style.opacity = leftBtn.disabled ? '0.3' : '1';
        rightBtn.style.opacity = rightBtn.disabled ? '0.3' : '1';
    };

    // Smooth scroll right
    rightBtn.addEventListener('click', () => {
        const scrollAmount = getScrollAmount();
        container.scrollBy({ 
            left: scrollAmount, 
            behavior: 'smooth' 
        });
        rightBtn.style.transform = 'translateY(-50%) scale(0.95)';
        setTimeout(() => {
            rightBtn.style.transform = 'translateY(-50%) scale(1)';
        }, 150);
    });

    // Smooth scroll left
    leftBtn.addEventListener('click', () => {
        const scrollAmount = getScrollAmount();
        container.scrollBy({ 
            left: -scrollAmount, 
            behavior: 'smooth' 
        });
        leftBtn.style.transform = 'translateY(-50%) scale(0.95)';
        setTimeout(() => {
            leftBtn.style.transform = 'translateY(-50%) scale(1)';
        }, 150);
    });

    // Update buttons on scroll and resize
    container.addEventListener('scroll', checkScroll);
    window.addEventListener('resize', checkScroll);
    setTimeout(checkScroll, 100);

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft' && !leftBtn.disabled) {
            leftBtn.click();
        } else if (e.key === 'ArrowRight' && !rightBtn.disabled) {
            rightBtn.click();
        }
    });
}

// Call setupGallerySlider after DOMContentLoaded and after renderGallery
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(setupGallerySlider, 500); // Delay to ensure gallery is rendered
});

function renderQuickLinks() {
    const container = document.getElementById('quick-links-grid');
    if (!container) return;
    container.innerHTML = '';
    if (quickLinksData.length === 0) {
        container.innerHTML = '<p class="no-data-message">No quick links available yet.</p>';
    } else {
        quickLinksData.forEach(link => {
            const quickLinkCard = document.createElement('a');
            quickLinkCard.href = link.url;
            quickLinkCard.classList.add('quick-link-card');
            quickLinkCard.innerHTML = `
                <div class="quick-link-icon">${link.iconSvg || '<i class="fas fa-link"></i>'}</div>
                <h3>${link.title}</h3>
                <p>${link.description}</p>
            `;
            container.appendChild(quickLinkCard);
        });
    }

    // Add View More button
    const viewMore = document.createElement('div');
    viewMore.className = 'section-view-more';
    viewMore.innerHTML = '<a href="downloads.html" class="view-more-btn">View More</a>';
    container.parentElement.appendChild(viewMore);
}

// --- Smooth Scrolling for Navigation Links ---
function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
                const menu = document.getElementById('menu');
                if (menu && menu.classList.contains('active')) {
                    menu.classList.remove('active');
                }
            }
        });
    });
}

// --- Counter Animation ---
function animateCounter(entry) {
    if (entry.isIntersecting) {
        const counterItems = entry.target.querySelectorAll('.counter-item');
        counterItems.forEach(item => {
            item.classList.add('animated');
            const countUpSpan = item.querySelector('.count-up');
            const target = parseInt(item.dataset.target);
            let current = 0;
            const duration = 2000;
            const startTimestamp = performance.now();
            const updateCount = (currentTime) => {
                const elapsed = currentTime - startTimestamp;
                const progress = Math.min(elapsed / duration, 1);
                current = progress * target;
                countUpSpan.textContent = Math.floor(current);
                if (progress < 1) {
                    requestAnimationFrame(updateCount);
                } else {
                    countUpSpan.textContent = target;
                }
            };
            requestAnimationFrame(updateCount);
        });
        counterObserver.unobserve(entry.target);
    }
}

const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => animateCounter(entry));
}, { threshold: 0.5 });

// --- DOM Content Loaded ---
document.addEventListener('DOMContentLoaded', async () => {
    const pageLoader = document.getElementById('page-loader');
    if (pageLoader) pageLoader.style.display = 'flex';

    await loadFrontendData();
    requestAnimationFrame(animateSlider);

    // Render all sections
    renderPrograms();
    renderNewsEvents();
    renderTestimonials();
    renderFaculty();
    renderGallery(); // Render the new gallery
    renderQuickLinks();
    renderFacilities();
    renderDownloadsPreview(); // Render the downloads section in place of Explore Our School
    
    // Setup interactive elements
    setupSmoothScrolling();
    setupStudentLifeAnimations(); // Setup enhanced student life animations

    const showMoreFacultyBtn = document.getElementById('showMoreFacultyBtn');
    if (showMoreFacultyBtn) {
        showMoreFacultyBtn.addEventListener('click', toggleFacultyVisibility);
    }
    const counterSection = document.getElementById('counter-section');
    if (counterSection) {
        counterObserver.observe(counterSection);
    }
    const currentYearSpan = document.getElementById('currentYear');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // --- Contact Form Submission ---
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async function (event) {
            event.preventDefault();
            const name = document.getElementById('contactName').value.trim();
            const email = document.getElementById('contactEmail').value.trim();
            const message = document.getElementById('contactMessage').value.trim();
            if (!name || !email || !message) {
                alert('Please fill in all fields.');
                return;
            }
            try {
                const response = await fetch('/submit-contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, message })
                });
                if (response.ok) {
                    alert('Thank you! Your message has been submitted successfully.');
                    contactForm.reset();
                } else {
                    const errorData = await response.json();
                    alert('Submission failed: ' + (errorData.error || 'Please try again later.'));
                }
            } catch (error) {
                alert('An error occurred. Please try again.');
            }
        });
    }

    // Fade-in animation observer
    const fadeEls = document.querySelectorAll('.fade-in');
    const observer = new IntersectionObserver(
        entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.15 }
    );
    fadeEls.forEach(el => observer.observe(el));

    if (pageLoader) pageLoader.style.display = 'none';
});

// --- Other existing functions (Principal card, scroll to top) ---
const principalCard = document.querySelector('.principal-message-card');
if (principalCard) {
    const observer = new IntersectionObserver(
        entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    principalCard.classList.add('visible');
                    observer.unobserve(principalCard);
                }
            });
        },
        { threshold: 0.4 }
    );
    observer.observe(principalCard);
}

const scrollToTopBtn = document.getElementById("scrollToTopBtn");
if (scrollToTopBtn) {
    window.addEventListener("scroll", () => {
        if (window.scrollY > 100) {
            scrollToTopBtn.style.display = "flex";
        } else {
            scrollToTopBtn.style.display = "none";
        }
    });
    scrollToTopBtn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}

// --- Enhanced Student Life Animations ---
function setupStudentLifeAnimations() {
    const studentLifeSection = document.getElementById('student-life-section');
    if (!studentLifeSection) return;

    // Intersection Observer for triggering animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add animation classes to columns
                const columns = entry.target.querySelectorAll('.student-life-column');
                columns.forEach((column, index) => {
                    setTimeout(() => {
                        column.style.animation = `slideInColumn 0.8s ease-out ${index * 0.2}s forwards`;
                    }, index * 200);
                });

                // Add animation classes to list items
                const listItems = entry.target.querySelectorAll('.student-life-list li');
                listItems.forEach((item, index) => {
                    setTimeout(() => {
                        item.style.animation = `slideInListItem 0.6s ease-out ${0.6 + (index * 0.1)}s forwards`;
                    }, 600 + (index * 100));
                });

                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    observer.observe(studentLifeSection);

    // Add hover effects for list items
    const listItems = studentLifeSection.querySelectorAll('.student-life-list li');
    listItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateX(8px) scale(1.02)';
            this.style.background = 'linear-gradient(135deg, rgba(224, 242, 254, 0.9), rgba(186, 230, 253, 0.9))';
            this.style.borderLeftColor = '#0284c7';
            this.style.boxShadow = '0 8px 20px rgba(14, 165, 233, 0.2)';
        });

        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateX(0) scale(1)';
            this.style.background = 'linear-gradient(135deg, rgba(240, 249, 255, 0.8), rgba(224, 242, 254, 0.8))';
            this.style.borderLeftColor = '#0ea5e9';
            this.style.boxShadow = 'none';
        });
    });

    // Add click effects for columns
    const columns = studentLifeSection.querySelectorAll('.student-life-column');
    columns.forEach(column => {
        column.addEventListener('click', function() {
            // Add a subtle click animation
            this.style.transform = 'translateY(-5px) scale(1.01)';
            setTimeout(() => {
                this.style.transform = 'translateY(-10px) scale(1.02)';
            }, 150);
        });
    });

    // Add floating animation to icons
    const icons = studentLifeSection.querySelectorAll('.icon-prefix');
    icons.forEach(icon => {
        icon.addEventListener('mouseenter', function() {
            this.style.animation = 'iconSpin 0.6s ease-out';
            this.style.color = '#0284c7';
        });

        icon.addEventListener('mouseleave', function() {
            this.style.animation = 'iconPulse 2s ease-in-out infinite';
            this.style.color = '#0ea5e9';
        });
    });
}

// Notification System
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    const notificationMessage = document.getElementById('notification-message');
    
    // Set message and type
    notificationMessage.textContent = message;
    notification.className = `notification ${type}`;
    
    // Show notification
    notification.style.display = 'block';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        hideNotification();
    }, 5000);
}

function hideNotification() {
    const notification = document.getElementById('notification');
    notification.classList.add('hide');
    
    // Remove from DOM after animation
    setTimeout(() => {
        notification.style.display = 'none';
        notification.classList.remove('hide');
    }, 300);
}

// Check for URL parameters on page load
function checkUrlParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');
    const message = urlParams.get('message');
    
    if (status && message) {
        showNotification(decodeURIComponent(message), status);
        
        // Clean up URL parameters
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
    }
}

// Initialize notification system
document.addEventListener('DOMContentLoaded', function() {
    // Check for URL parameters
    checkUrlParameters();
    
    // Add event listener for notification close button
    const closeButton = document.getElementById('notification-close');
    if (closeButton) {
        closeButton.addEventListener('click', hideNotification);
    }
});

// Render Facilities
async function renderFacilities() {
    const facilitiesGrid = document.getElementById('facilities-grid');
    if (!facilitiesGrid) return;

    try {
        const response = await fetch('/api/facilities');
        const data = await response.json();
        const facilities = data.data || [];

        facilitiesGrid.innerHTML = '';

        if (facilities.length === 0) {
            facilitiesGrid.innerHTML = `
                <div class="facility-card">
                    <div class="facility-icon">
                        <i class="fas fa-building"></i>
                    </div>
                    <h3>Modern Classrooms</h3>
                    <p>Well-equipped classrooms with modern teaching aids and comfortable learning environments.</p>
                    <ul class="facility-features">
                        <li>Smart boards and projectors</li>
                        <li>Comfortable seating arrangements</li>
                        <li>Proper ventilation and lighting</li>
                    </ul>
                </div>
                <div class="facility-card">
                    <div class="facility-icon">
                        <i class="fas fa-flask"></i>
                    </div>
                    <h3>Science Laboratories</h3>
                    <p>State-of-the-art laboratories for practical learning in Physics, Chemistry, and Biology.</p>
                    <ul class="facility-features">
                        <li>Modern equipment and apparatus</li>
                        <li>Safety measures and protocols</li>
                        <li>Experienced lab assistants</li>
                    </ul>
                </div>
                <div class="facility-card">
                    <div class="facility-icon">
                        <i class="fas fa-book"></i>
                    </div>
                    <h3>Library & Resource Center</h3>
                    <p>Extensive collection of books, digital resources, and study spaces for students.</p>
                    <ul class="facility-features">
                        <li>Wide range of books and journals</li>
                        <li>Digital learning resources</li>
                        <li>Quiet study areas</li>
                    </ul>
                </div>
            `;
            return;
        }

        facilities.forEach(facility => {
            const facilityCard = document.createElement('div');
            facilityCard.className = 'facility-card';
            
            let featuresHTML = '';
            if (facility.features && facility.features.length > 0) {
                featuresHTML = `
                    <ul class="facility-features">
                        ${facility.features.map(feature => `<li>${feature}</li>`).join('')}
                    </ul>
                `;
            }

            facilityCard.innerHTML = `
                ${facility.imageUrl ? `<img src="${facility.imageUrl}" alt="${facility.name}" class="facility-image" onerror="this.style.display='none';">` : ''}
                <div class="facility-icon">
                    ${facility.iconSvg || '<i class="fas fa-building"></i>'}
                </div>
                <h3>${facility.name}</h3>
                <p>${facility.description}</p>
                ${featuresHTML}
            `;
            
            facilitiesGrid.appendChild(facilityCard);
        });

    } catch (error) {
        console.error('Error loading facilities:', error);
        facilitiesGrid.innerHTML = `
            <div class="facility-card">
                <div class="facility-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h3>Facilities Loading Error</h3>
                <p>Unable to load facilities information at the moment. Please try again later.</p>
            </div>
        `;
    }
}

// Initialize all sections
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing website...');
    
    // Initialize all sections
    renderPrograms();
    renderNewsEvents();
    renderTestimonials();
    renderFaculty();
    renderGallery();
    renderQuickLinks();
    renderFacilities();
    
    // Initialize other features
    initializeCounters();
    initializeContactForm();
    initializeScrollToTop();
    initializeSmoothScrolling();
    initializeFadeInAnimations();
    
    renderStudentColumnsPreview();
    
    console.log('Website initialization complete');
});

// --- Floating Messenger Button ---
function createMessengerButton(messengerLink) {
    if (!messengerLink) return;
    const btn = document.createElement('button');
    btn.className = 'messenger-btn';
    btn.title = 'Message us on Facebook Messenger';
    btn.innerHTML = '<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="16" fill="#0084FF"/><path d="M8.5 21.5L13.5 16.5L16.5 19.5L21.5 14.5L18.5 17.5L15.5 14.5L10.5 19.5L8.5 21.5Z" fill="white"/></svg>';
    btn.onclick = function() {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        if (isMobile) {
            // Try to open Messenger app, fallback to web
            window.location.href = `fb-messenger://user-thread/${messengerLink}`;
            setTimeout(() => {
                window.open(`https://m.me/${messengerLink}`, '_blank');
            }, 500);
        } else {
            window.open(`https://m.me/${messengerLink}`, '_blank');
        }
    };
    document.body.appendChild(btn);
}

async function injectMessengerButton() {
    try {
        const res = await fetch('/api/client-config');
        if (!res.ok) return;
        const config = (await res.json()).data;
        if (config && config.messengerLink) {
            createMessengerButton(config.messengerLink);
        }
    } catch (e) { /* fail silently */ }
}

window.addEventListener('DOMContentLoaded', injectMessengerButton);

// --- Dynamic Content Loaders for New Pages ---
async function loadDynamicContent(page) {
    const clientId = window.CLIENT_ID || 'default';
    let url, targetSelector, renderFn;
    switch(page) {
        case 'about':
            url = `/api/client-config?clientId=${clientId}`;
            targetSelector = 'main';
            renderFn = (data) => {
                document.querySelector('.about-intro').textContent = data.intro || '';
                document.querySelector('.mission-vision p').textContent = data.missionVision || '';
                document.querySelector('.philosophy p').textContent = data.philosophy || '';
                document.querySelector('.principal-message p').textContent = data.principalMessage || '';
                const facilities = document.querySelector('.facilities ul');
                facilities.innerHTML = (data.facilities||[]).map(f=>`<li>${f}</li>`).join('');
            };
            break;
        case 'programs':
            url = `/api/programs?clientId=${clientId}`;
            targetSelector = '.programs-list';
            renderFn = (data) => {
                const list = document.querySelector(targetSelector);
                list.innerHTML = data.map(p => `<div class="program-card"><h2>${p.title}</h2><p>${p.description}</p></div>`).join('');
            };
            break;
        case 'student-columns':
            url = `/api/studentColumns?clientId=${clientId}`;
            targetSelector = '.student-columns-list';
            renderFn = (data) => {
                const list = document.querySelector(targetSelector);
                list.innerHTML = data.map(col => `<div class="student-column-card"><h2>${col.studentName}</h2><p>${col.title}</p><p>${col.excerpt}</p></div>`).join('');
            };
            break;
        case 'events':
            url = `/api/newsEvents?clientId=${clientId}`;
            targetSelector = '.events-list';
            renderFn = (data) => {
                const list = document.querySelector(targetSelector);
                list.innerHTML = data.map(ev => `<div class="event-card"><h2>${ev.title}</h2><p>${ev.date||''}</p><p>${ev.description}</p></div>`).join('');
            };
            break;
        case 'downloads':
            url = `/api/downloads?clientId=${clientId}`;
            targetSelector = '.downloads-list';
            renderFn = (data) => {
                const list = document.querySelector(targetSelector);
                list.innerHTML = data.map(dl => `<div class="download-card"><h2>${dl.title}</h2><a href="${dl.url}" download>${dl.linkText||'Download'}</a></div>`).join('');
            };
            break;
        case 'team':
            url = `/api/team?clientId=${clientId}`;
            targetSelector = '.team-list';
            renderFn = (data) => {
                const list = document.querySelector(targetSelector);
                list.innerHTML = data.map(tm => `<div class="team-card"><h2>${tm.name}</h2><p>${tm.position}</p><p>${tm.bio}</p></div>`).join('');
            };
            break;
        case 'faq':
            url = `/api/faq?clientId=${clientId}`;
            targetSelector = '.faq-list';
            renderFn = (data) => {
                const list = document.querySelector(targetSelector);
                list.innerHTML = data.map(fq => `<div class="faq-item"><h2>${fq.question}</h2><p>${fq.answer}</p></div>`).join('');
            };
            break;
        case 'contact':
            url = `/api/contactInfo?clientId=${clientId}`;
            targetSelector = '.contact-info';
            renderFn = (data) => {
                const info = document.querySelector(targetSelector);
                info.innerHTML = `<p><strong>Address:</strong> ${data.address||''}</p><p><strong>Phone:</strong> ${data.phone||''}</p><p><strong>Email:</strong> ${data.email||''}</p>`;
            };
            break;
        default: return;
    }
    try {
        const res = await fetch(url);
        if (!res.ok) return;
        const json = await res.json();
        if (Array.isArray(json.data)) {
            renderFn(json.data);
        } else {
            renderFn(json.data);
        }
    } catch (e) { /* fail silently */ }
}

// --- Page-specific loader triggers ---
const pageMap = {
    'about.html': 'about',
    'programs.html': 'programs',
    'student-columns.html': 'student-columns',
    'events.html': 'events',
    'downloads.html': 'downloads',
    'team.html': 'team',
    'faq.html': 'faq',
    'contact.html': 'contact',
};
window.addEventListener('DOMContentLoaded', () => {
    const page = pageMap[location.pathname.split('/').pop()];
    if (page) loadDynamicContent(page);
});

// --- Student Columns Preview for Homepage ---
async function renderStudentColumnsPreview() {
    try {
        const res = await fetch('/api/studentColumns?clientId=default');
        if (!res.ok) return;
        const data = (await res.json()).data || [];
        const container = document.querySelector('.student-columns-cards');
        if (!container) return;
        if (data.length === 0) {
            container.innerHTML = `<div class="student-column-card no-data-card">
                <h3>No Student Columns Yet</h3>
                <p class="student-column-excerpt">Student stories and creative works will appear here soon.</p>
            </div>`;
            return;
        }
        // Show up to 4 latest columns
        const preview = data.slice(0, 4);
        container.innerHTML = preview.map(col => `
            <div class="student-column-card">
                <h3>${col.title}</h3>
                <p class="student-column-excerpt">${col.content?.slice(0, 120) || ''}${col.content && col.content.length > 120 ? '...' : ''}</p>
                <div class="student-column-meta">By <strong>${col.author || 'Anonymous'}</strong></div>
            </div>
        `).join('');
    } catch (e) {
        // fail silently
    }
}

// Fade-in transitions for all major sections
function initializeFadeInAnimations() {
    const fadeEls = document.querySelectorAll('.fade-in');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });
    fadeEls.forEach(el => observer.observe(el));
}

// Smooth scrolling for anchor links
function initializeSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

// Polish forms for usability and style
function polishForms() {
    document.querySelectorAll('form').forEach(form => {
        form.setAttribute('autocomplete', 'off');
        form.querySelectorAll('input, textarea').forEach(input => {
            input.style.borderRadius = '6px';
            input.style.border = '1.5px solid #cbd5e1';
            input.style.padding = '0.6rem';
            input.style.fontSize = '1rem';
        });
    });
}

document.addEventListener('DOMContentLoaded', function() {
    // ... existing code ...
    polishForms();
    // ... existing code ...
});

// --- Full Student Columns Page ---
async function renderAllStudentColumns() {
    if (!document.querySelector('.student-columns-list')) return;
    try {
        const res = await fetch('/api/studentColumns?clientId=default');
        if (!res.ok) return;
        const data = (await res.json()).data || [];
        const container = document.querySelector('.student-columns-list');
        if (!container) return;
        if (data.length === 0) {
            container.innerHTML = `<div class="student-column-card no-data-card">
                <h3>No Student Columns Yet</h3>
                <p class="student-column-excerpt">Student stories and creative works will appear here soon.</p>
            </div>`;
            return;
        }
        container.innerHTML = data.map(col => `
            <div class="student-column-card fade-in">
                <h3>${col.title}</h3>
                <p class="student-column-excerpt">${col.content?.slice(0, 350) || ''}${col.content && col.content.length > 350 ? '...' : ''}</p>
                <div class="student-column-meta">By <strong>${col.author || 'Anonymous'}</strong></div>
            </div>
        `).join('');
    } catch (e) {
        // fail silently
    }
}

window.addEventListener('DOMContentLoaded', () => {
    // ... existing code ...
    if (location.pathname.endsWith('student-columns.html')) {
        renderAllStudentColumns();
    }
    // ... existing code ...
});

// --- Character-by-character scroll-in animation for section titles ---
function animateSectionTitles() {
  document.querySelectorAll('.section-title').forEach(el => {
    if (el.dataset.charsWrapped) return;
    el.dataset.charsWrapped = "true";
    const text = el.textContent;
    el.innerHTML = '';
    text.split('').forEach((char, i) => {
      const span = document.createElement('span');
      span.className = 'char';
      if (char === ' ') {
        span.innerHTML = '&nbsp;';
        span.style.width = '0.4em';
      } else {
        span.textContent = char;
      }
      span.style.transitionDelay = (i * 0.04) + 's';
      el.appendChild(span);
    });
  });

  // Intersection Observer
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  document.querySelectorAll('.section-title').forEach(el => observer.observe(el));
}

document.addEventListener('DOMContentLoaded', () => {
  animateSectionTitles();
});