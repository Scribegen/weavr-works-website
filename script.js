/* ═══════════════════════════════════════════════════
   WEAVR WORKS AI — Motion Engine
   IntersectionObserver reveals, magnetic hover,
   nav scroll effects, text scramble, smooth scroll
   ═══════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── Scroll Reveal (IntersectionObserver) ────── */
  const revealElements = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );
  revealElements.forEach((el) => revealObserver.observe(el));


  /* ── Navbar Scroll Effect ─────────────────────── */
  const navWrapper = document.getElementById('main-nav');
  let lastScroll = 0;
  const handleNavScroll = () => {
    const y = window.scrollY;
    if (y > 60) {
      navWrapper.classList.add('scrolled');
    } else {
      navWrapper.classList.remove('scrolled');
    }
    lastScroll = y;
  };
  window.addEventListener('scroll', handleNavScroll, { passive: true });


  /* ── Mobile Hamburger ─────────────────────────── */
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      mobileMenu.classList.toggle('active');
      document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    });

    // Close on link click (unless it's the services toggle)
    mobileMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', (e) => {
        if (link.id === 'mobile-services-toggle') {
          e.preventDefault();
          link.classList.toggle('active');
          const dropdown = document.getElementById('mobile-services-dropdown');
          if (dropdown) dropdown.classList.toggle('active');
          return;
        }
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }


  /* ── Smooth Scroll for Anchor Links ───────────── */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const id = anchor.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        const offset = 100;
        const y = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    });
  });


  /* ── Magnetic Button Hover ────────────────────── */
  const magneticBtns = document.querySelectorAll('.magnetic');

  magneticBtns.forEach((btn) => {
    let raf;

    btn.addEventListener('mousemove', (e) => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
      });
    });

    btn.addEventListener('mouseleave', () => {
      if (raf) cancelAnimationFrame(raf);
      btn.style.transform = 'translate(0, 0)';
      btn.style.transition = 'transform 600ms cubic-bezier(0.32, 0.72, 0, 1)';
      setTimeout(() => { btn.style.transition = ''; }, 600);
    });

    btn.addEventListener('mouseenter', () => {
      btn.style.transition = 'none';
    });
  });


  // Text scramble removed per user request


  /* ── Spotlight Border on Service Cards ─────────── */
  const cards = document.querySelectorAll('.service-card, .why-card');
  cards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--spotlight-x', `${x}px`);
      card.style.setProperty('--spotlight-y', `${y}px`);
      card.style.borderImage = 'none';
      card.style.borderColor = 'transparent';
      card.style.background = `radial-gradient(300px circle at ${x}px ${y}px, rgba(255,255,255,0.06), transparent 60%), var(--bg-card-outer)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.background = '';
      card.style.borderColor = '';
    });
  });


  /* ── Hero Video Loop Crossfade ─────────────────── */
  const heroVideo = document.querySelector('.hero-bg video');
  if (heroVideo) {
    heroVideo.playbackRate = 0.7;
    heroVideo.style.transition = 'opacity 0.5s ease';

    heroVideo.addEventListener('timeupdate', () => {
      // Fade out 0.6s before the video ends
      if (heroVideo.duration - heroVideo.currentTime <= 0.6) {
        heroVideo.style.opacity = '0';
      }
    });

    heroVideo.addEventListener('seeked', () => {
      // Fade back in when the loop restarts
      if (heroVideo.currentTime < 0.1) {
        requestAnimationFrame(() => {
          heroVideo.style.opacity = '0.4';
        });
      }
    });
  }

  /* ── Scroll-Driven Image Sequence ──────────────── */
  const seqFrame = document.getElementById('seq-frame');
  const seqSection = document.querySelector('.scroll-seq-section');
  const seqPanels = document.querySelectorAll('.scroll-text-panel');

  if (seqFrame && seqSection) {
    const TOTAL_FRAMES = 61;
    const framePaths = [];
    const preloaded = [];

    // Build paths & preload all images
    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const path = `frames/frame_${String(i).padStart(3, '0')}.jpg`;
      framePaths.push(path);
      const img = new Image();
      img.src = path;
      preloaded.push(img);
    }

    let sectionTop = 0;
    let sectionHeight = 0;
    let lastIndex = -1;
    let activePanel = -1;
    const panelCount = seqPanels.length;
    const panelDuration = 1 / panelCount;

    const measure = () => {
      const rect = seqSection.getBoundingClientRect();
      sectionTop = rect.top + window.scrollY;
      sectionHeight = seqSection.offsetHeight - window.innerHeight;
    };
    measure();
    window.addEventListener('resize', measure, { passive: true });

    const onScroll = () => {
      const scrolled = window.scrollY - sectionTop;
      const progress = Math.min(Math.max(scrolled / sectionHeight, 0), 1);

      // Swap frame image
      const index = Math.min(Math.floor(progress * TOTAL_FRAMES), TOTAL_FRAMES - 1);
      if (index !== lastIndex) {
        seqFrame.src = framePaths[index];
        lastIndex = index;
      }

      // Text panels
      let newActive = -1;
      for (let i = 0; i < panelCount; i++) {
        const fadeIn  = i * panelDuration + panelDuration * 0.1;
        const fadeOut = (i + 1) * panelDuration - panelDuration * 0.1;
        if (progress >= fadeIn && progress <= fadeOut) {
          newActive = i;
          break;
        }
      }
      if (newActive !== activePanel) {
        if (activePanel >= 0) seqPanels[activePanel].classList.remove('active');
        if (newActive >= 0)   seqPanels[newActive].classList.add('active');
        activePanel = newActive;
      }
    };

    let scheduled = false;
    window.addEventListener('scroll', () => {
      if (!scheduled) {
        scheduled = true;
        requestAnimationFrame(() => {
          onScroll();
          scheduled = false;
        });
      }
    }, { passive: true });

    onScroll();
  }

})();
