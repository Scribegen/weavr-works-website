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


  /* ── Magnetic Button Hover (Removed per user request) ── */


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

  /* ── Blog Pagination ────────────────────────────── */
  const currentPath = window.location.pathname;
  if (currentPath.includes('blog.html') || currentPath.endsWith('blog')) {
    const blogArticles = document.querySelectorAll('main .container article.service-card');
    if (blogArticles.length > 0) {
      const perPage = 6;
      let currentPage = 1;
      const totalPages = Math.ceil(blogArticles.length / perPage);

      const renderPage = (page) => {
        currentPage = page;
        blogArticles.forEach((article, index) => {
          if (index >= (page - 1) * perPage && index < page * perPage) {
            article.style.display = 'flex';
            setTimeout(() => article.classList.add('visible'), 50);
          } else {
            article.style.display = 'none';
          }
        });

        renderControls();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      };

      const renderControls = () => {
        let controlsDiv = document.getElementById('pagination-controls');
        if (!controlsDiv) {
          controlsDiv = document.createElement('div');
          controlsDiv.id = 'pagination-controls';
          controlsDiv.style.display = 'flex';
          controlsDiv.style.justifyContent = 'center';
          controlsDiv.style.gap = '0.5rem';
          controlsDiv.style.marginTop = '4rem';
          controlsDiv.style.alignItems = 'center';
          const gridParent = blogArticles[0].parentElement;
          gridParent.insertAdjacentElement('afterend', controlsDiv);
        }
        
        controlsDiv.innerHTML = '';
        if (totalPages <= 1) return;

        const createBtn = (text, pageNum, disabled) => {
          const btn = document.createElement('button');
          btn.textContent = text;
          btn.style.padding = '0.5rem 1rem';
          btn.style.borderRadius = 'var(--radius-pill)';
          btn.style.border = '1px solid var(--border-accent)';
          btn.style.background = pageNum === currentPage ? 'var(--accent)' : 'transparent';
          btn.style.color = pageNum === currentPage ? '#000' : 'var(--text-primary)';
          btn.style.cursor = disabled ? 'not-allowed' : 'pointer';
          btn.style.opacity = disabled ? '0.5' : '1';
          btn.style.fontWeight = 'bold';
          btn.style.fontFamily = 'var(--font-mono)';
          btn.style.transition = 'all 0.3s';
          
          if (!disabled && pageNum !== currentPage) {
            btn.onmouseover = () => btn.style.background = 'rgba(16,185,129,0.1)';
            btn.onmouseleave = () => btn.style.background = 'transparent';
          }

          if (!disabled) {
            btn.addEventListener('click', () => {
              renderPage(pageNum);
            });
          }
          controlsDiv.appendChild(btn);
        };

        createBtn('Prev', currentPage - 1, currentPage === 1);
        for (let i = 1; i <= totalPages; i++) {
          createBtn(i, i, false);
        }
        createBtn('Next', currentPage + 1, currentPage === totalPages);
      };

      renderPage(1);
    }
  }

})();
