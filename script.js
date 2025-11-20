// Vanilla JavaScript implementations for interactive components
// Note: Some complex animations and behaviors have been simplified from the original React/Radix UI implementations

// Navigation - Mobile menu toggle
(function() {
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const mobileMenu = document.querySelector('.mobile-menu');
  
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', function() {
      mobileMenu.classList.toggle('open');
      const icon = mobileMenuBtn.querySelector('svg');
      if (icon) {
        // Toggle between menu and X icon
        if (mobileMenu.classList.contains('open')) {
          icon.innerHTML = '<path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
        } else {
          icon.innerHTML = '<path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
        }
      }
    });

    // Close mobile menu when clicking a link
    const mobileLinks = mobileMenu.querySelectorAll('.mobile-menu-link');
    mobileLinks.forEach(link => {
      link.addEventListener('click', function() {
        mobileMenu.classList.remove('open');
        const icon = mobileMenuBtn.querySelector('svg');
        if (icon) {
          icon.innerHTML = '<path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
        }
      });
    });
  }

  // Set active nav link based on current page
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-link, .mobile-menu-link');
  navLinks.forEach(link => {
    if (link.getAttribute('href') === currentPath || 
        (currentPath === '/' && link.getAttribute('href') === '/index.html')) {
      link.classList.add('active');
    }
  });
})();

// Accordion Component
(function() {
  const accordionTriggers = document.querySelectorAll('.accordion-trigger');
  
  accordionTriggers.forEach(trigger => {
    trigger.addEventListener('click', function() {
      const isExpanded = this.getAttribute('aria-expanded') === 'true';
      const content = this.nextElementSibling;
      
      // Close all other items in the same accordion (single mode)
      const accordion = this.closest('.accordion');
      if (accordion) {
        const allTriggers = accordion.querySelectorAll('.accordion-trigger');
        const allContents = accordion.querySelectorAll('.accordion-content');
        allTriggers.forEach(t => {
          if (t !== this) {
            t.setAttribute('aria-expanded', 'false');
          }
        });
        allContents.forEach(c => {
          if (c !== content) {
            c.setAttribute('aria-hidden', 'true');
            // Set height for smooth animation
            c.style.maxHeight = '0';
          }
        });
      }
      
      // Toggle current item
      if (isExpanded) {
        this.setAttribute('aria-expanded', 'false');
        content.setAttribute('aria-hidden', 'true');
        content.style.maxHeight = '0';
      } else {
        this.setAttribute('aria-expanded', 'true');
        content.setAttribute('aria-hidden', 'false');
        // Set height for smooth animation
        const height = content.scrollHeight;
        content.style.maxHeight = height + 'px';
      }
    });
  });
})();

// Carousel Component - Simplified from Embla Carousel
// Carousel Component — Option A (JS controls slide index only; CSS controls item widths)
(function() {
  const carousels = document.querySelectorAll('.carousel');

  carousels.forEach(carousel => {
    const track = carousel.querySelector('.carousel-track');
    const items = carousel.querySelectorAll('.carousel-item');
    const prevBtn = carousel.querySelector('.carousel-prev');
    const nextBtn = carousel.querySelector('.carousel-next');
    let dotsContainer = carousel.parentElement.querySelector('.carousel-dots');

    if (!track || items.length === 0) return;

    let currentIndex = 0; // index of first visible item
    let itemsPerView = getItemsPerView();
    let totalItems = items.length;
    let totalSlides = Math.ceil(totalItems / itemsPerView);

    function getItemsPerView() {
      if (window.innerWidth >= 1024) return 3;
      if (window.innerWidth >= 768) return 2;
      return 1;
    }

    function getCurrentSlide() {
      return Math.floor(currentIndex / itemsPerView);
    }

    function updateCarousel() {
      // recompute itemsPerView & slides (responsive)
      itemsPerView = getItemsPerView();
      totalSlides = Math.ceil(totalItems / itemsPerView);

      // clamp currentIndex so we don't overflow
      const maxIndex = Math.max(0, totalItems - itemsPerView);
      currentIndex = Math.min(currentIndex, maxIndex);

      // compute current slide (0,1,2...)
      const currentSlide = getCurrentSlide();

      // Move by slide * 100% — this aligns with CSS where each "slide" fills the viewport
      track.style.transform = `translateX(-${currentSlide * 100}%)`;
      track.style.transition = 'transform 0.35s ease';

      // Update dots: create if necessary
      if (!dotsContainer) {
        // Try to find a .carousel-dots sibling; if not present, create one
        dotsContainer = carousel.parentElement.querySelector('.carousel-dots');
      }
      if (dotsContainer) {
        // If not enough dots, regenerate
        const existingDots = dotsContainer.querySelectorAll('.carousel-dot');
        if (existingDots.length !== totalSlides) {
          dotsContainer.innerHTML = '';
          for (let i = 0; i < totalSlides; i++) {
            const btn = document.createElement('button');
            btn.className = 'carousel-dot';
            btn.setAttribute('aria-label', `Go to slide ${i+1}`);
            // First dot active by default
            if (i === currentSlide) btn.classList.add('active');
            dotsContainer.appendChild(btn);
            btn.addEventListener('click', () => goToSlide(i));
          }
        } else {
          // Toggle active state
          existingDots.forEach((d, i) => {
            if (i === currentSlide) d.classList.add('active'); else d.classList.remove('active');
            // hide dots beyond totalSlides (defensive)
            d.style.display = i >= totalSlides ? 'none' : '';
          });
        }
      }

      // Update prev/next buttons
      if (prevBtn) prevBtn.disabled = currentIndex === 0;
      if (nextBtn) nextBtn.disabled = currentIndex >= (totalItems - itemsPerView);
    }

    function goToSlide(slideIndex) {
      itemsPerView = getItemsPerView();
      const targetIndex = slideIndex * itemsPerView;
      const maxIndex = Math.max(0, totalItems - itemsPerView);
      currentIndex = Math.max(0, Math.min(targetIndex, maxIndex));
      updateCarousel();
    }

    function nextSlide() {
      itemsPerView = getItemsPerView();
      const maxIndex = Math.max(0, totalItems - itemsPerView);
      // move forward by one slide (itemsPerView)
      currentIndex = Math.min(currentIndex + itemsPerView, maxIndex);
      updateCarousel();
    }

    function prevSlide() {
      itemsPerView = getItemsPerView();
      currentIndex = Math.max(currentIndex - itemsPerView, 0);
      updateCarousel();
    }

    // Attach nav handlers
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);

    // On initialization, generate dots if container exists
    if (dotsContainer) {
      dotsContainer.innerHTML = '';
      for (let i = 0; i < totalSlides; i++) {
        const btn = document.createElement('button');
        btn.className = 'carousel-dot' + (i === 0 ? ' active' : '');
        btn.setAttribute('aria-label', `Go to slide ${i+1}`);
        dotsContainer.appendChild(btn);
        btn.addEventListener('click', () => goToSlide(i));
      }
    }

    // Responsive: recalc on resize and maintain visible slide
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const oldItemsPerView = itemsPerView;
        itemsPerView = getItemsPerView();
        if (oldItemsPerView !== itemsPerView) {
          // snap currentIndex to the start of the current slide after change
          const currentSlide = getCurrentSlide();
          currentIndex = currentSlide * itemsPerView;
          const maxIndex = Math.max(0, totalItems - itemsPerView);
          currentIndex = Math.min(currentIndex, maxIndex);
          updateCarousel();
        } else {
          // still update dots/controls if totalSlides changed due to rounding
          updateCarousel();
        }
      }, 150);
    });

    // init
        // --- Swipe / Drag Support ---
    let startX = 0;
    let currentX = 0;
    let isDragging = false;
    let hasMoved = false;

    function pointerDown(clientX) {
      startX = clientX;
      currentX = clientX;
      isDragging = true;
      hasMoved = false;
      track.style.transition = 'none'; // Disable animation while dragging
    }

    function pointerMove(clientX) {
      if (!isDragging) return;

      currentX = clientX;
      const dx = currentX - startX;

      if (Math.abs(dx) > 5) hasMoved = true;

      // Calculate drag offset relative to screen width
      const dragPercent = (dx / track.clientWidth) * 100;

      const currentSlide = getCurrentSlide();
      const targetX = -(currentSlide * 100) + dragPercent;

      track.style.transform = `translateX(${targetX}%)`;
    }

    function pointerUp() {
      if (!isDragging) return;
      isDragging = false;

      const dx = currentX - startX;

      const threshold = 50; // px needed for swipe

      // Restore animation
      track.style.transition = 'transform 0.35s ease';

      if (dx < -threshold) {
        nextSlide();
      } else if (dx > threshold) {
        prevSlide();
      } else {
        updateCarousel(); // snap back to current slide
      }
    }

    // Touch events
    track.addEventListener('touchstart', e => pointerDown(e.touches[0].clientX));
    track.addEventListener('touchmove', e => {
      pointerMove(e.touches[0].clientX);
    });
    track.addEventListener('touchend', pointerUp);

    // Mouse events
    track.addEventListener('mousedown', e => pointerDown(e.clientX));
    window.addEventListener('mousemove', e => pointerMove(e.clientX));
    window.addEventListener('mouseup', pointerUp);

    updateCarousel();
  });
})();


// Modal/Dialog Component - Simplified from Radix UI Dialog
(function() {
  const modalTriggers = document.querySelectorAll('[data-modal-trigger]');
  const modalOverlays = document.querySelectorAll('.modal-overlay');
  
  modalTriggers.forEach(trigger => {
    trigger.addEventListener('click', function(e) {
      e.preventDefault();
      const modalId = this.getAttribute('data-modal-trigger');
      const modal = document.querySelector(`[data-modal="${modalId}"]`);
      if (modal) {
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
      }
    });
  });
  
  modalOverlays.forEach(overlay => {
    // Close on overlay click
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) {
        overlay.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
    
    // Close button
    const closeBtn = overlay.querySelector('.modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', function() {
        overlay.classList.remove('open');
        document.body.style.overflow = '';
      });
    }
    
    // Close on Escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && overlay.classList.contains('open')) {
        overlay.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  });
})();

// Gallery Lightbox - Simplified modal for images
(function() {
  const galleryImages = document.querySelectorAll('[data-gallery-image]');
  
  galleryImages.forEach(image => {
    image.addEventListener('click', function() {
      const src = this.getAttribute('data-gallery-image');
      const alt = this.getAttribute('alt') || 'Gallery image';
      
      // Create modal if it doesn't exist
      let modal = document.getElementById('gallery-modal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'gallery-modal';
        modal.className = 'modal-overlay';
        modal.innerHTML = `
          <div class="modal-content" style="max-width: 90vw; max-height: 90vh; padding: 0; background: transparent; border: none;">
            <button class="modal-close" style="color: white; background: rgba(0,0,0,0.5); border-radius: 50%; width: 2rem; height: 2rem; display: flex; align-items: center; justify-content: center;">&times;</button>
            <img src="${src}" alt="${alt}" style="width: 100%; height: auto; border-radius: 0.5rem;">
          </div>
        `;
        document.body.appendChild(modal);
        
        // Add close handlers
        modal.addEventListener('click', function(e) {
          if (e.target === modal || e.target.classList.contains('modal-close')) {
            modal.classList.remove('open');
            document.body.style.overflow = '';
          }
        });
      } else {
        const img = modal.querySelector('img');
        if (img) {
          img.src = src;
          img.alt = alt;
        }
      }
      
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });
})();

// Form handling - Contact form
(function() {
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Simple form validation
      const name = this.querySelector('[name="name"]').value;
      const email = this.querySelector('[name="email"]').value;
      const message = this.querySelector('[name="message"]').value;
      
      if (!name || !email || !message) {
        alert('Please fill in all required fields.');
        return;
      }
      
      // Show success message (simplified - in production, this would submit to a server)
      alert('Thank you for contacting us! We\'ll get back to you soon.');
      this.reset();
    });
  }
  
  // Booking form - WhatsApp integration
  const bookingForm = document.getElementById('booking-form');
  if (bookingForm) {
    bookingForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const formData = new FormData(this);
      const name = formData.get('name');
      const email = formData.get('email');
      const phone = formData.get('phone');
      const date = formData.get('date');
      const time = formData.get('time');
      const service = formData.get('service');
      const notes = formData.get('notes') || 'None';
      
      // Format date
      const dateObj = new Date(date);
      const formattedDate = dateObj.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      
      // Create WhatsApp message
      const message = `Hello, I would like to book an appointment:\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nDate: ${formattedDate}\nTime: ${time}\nService: ${service}\nNotes: ${notes}`;
      
      const whatsappUrl = `https://wa.me/27677708227?text=${encodeURIComponent(message)}`;
      
      // Open WhatsApp
      window.open(whatsappUrl, '_blank');
      
      // Show notification (simplified)
      alert('Opening WhatsApp to confirm your appointment');
      
      // Reset form
      this.reset();
    });
  }
})();

// Smooth scroll for anchor links
(function() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href !== '#') {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    });
  });
})();

// Initialize animations on scroll (simplified intersection observer)
(function() {
  const animatedElements = document.querySelectorAll('.animate-fade-in, .animate-slide-up');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, {
    threshold: 0.1
  });
  
  animatedElements.forEach(el => {
    // Set initial state
    if (el.classList.contains('animate-fade-in')) {
      el.style.opacity = '0';
    }
    if (el.classList.contains('animate-slide-up')) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
    }
    el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    observer.observe(el);
  });
})();

// Service detail page - handle dynamic content loading
(function() {
  // This would be used if we're loading service details dynamically
  // For static HTML, this is not needed, but kept for potential future use
  const serviceId = new URLSearchParams(window.location.search).get('id');
  if (serviceId) {
    // Service detail pages are static HTML files, so this is just a placeholder
    console.log('Service ID:', serviceId);
  }
})();

