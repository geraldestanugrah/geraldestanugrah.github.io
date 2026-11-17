(() => {
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.getElementById('primary-nav');
  if (menuButton && nav) {
    menuButton.addEventListener('click', () => {
      const open = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!open));
      menuButton.setAttribute('aria-label', open ? 'Open navigation' : 'Close navigation');
      nav.classList.toggle('open', !open);
    });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      nav.classList.remove('open');
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-label', 'Open navigation');
    }));
  }

  const filters = [...document.querySelectorAll('.filter-button[data-filter]')];
  const cards = [...document.querySelectorAll('.project-card[data-categories]')];
  function applyFilter(value) {
    filters.forEach(button => {
      const active = button.dataset.filter === value;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    cards.forEach(card => {
      const cats = (card.dataset.categories || '').split(/\s+/);
      const show = value === 'all' || cats.includes(value) || (value === 'operations' && cats.includes('operations'));
      card.classList.toggle('is-hidden', !show);
    });
  }
  filters.forEach(button => button.addEventListener('click', () => applyFilter(button.dataset.filter)));
  document.querySelectorAll('[data-jump-filter]').forEach(link => link.addEventListener('click', () => {
    const value = link.dataset.jumpFilter;
    const target = document.querySelector(`.filter-button[data-filter="${value}"]`);
    if (target) applyFilter(value);
  }));

  const progress = document.getElementById('reading-progress');
  const updateProgress = () => {
    if (!progress) return;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = `${scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0}%`;
  };
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  const revealTargets = document.querySelectorAll('.hero-copy,.hero-visual,.hero-bottom,.section-kicker,.pathway-heading,.section-heading-row,.pathway-card,.metric-cell,.metrics-intro,.project-card,.capability-card,.timeline-item,.leadership-grid article,.cert-card,.tool-item,.about-copy,.contact-panel');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    }), { threshold: .08, rootMargin: '0px 0px -35px 0px' });
    revealTargets.forEach(el => el.classList.add('reveal'));
    revealTargets.forEach(el => observer.observe(el));
  }

  const dialog = document.getElementById('image-lightbox');
  const lightboxImage = document.getElementById('lightbox-image');
  const lightboxCaption = document.getElementById('lightbox-caption');
  if (dialog && lightboxImage) {
    document.querySelectorAll('[data-lightbox]').forEach(trigger => trigger.addEventListener('click', event => {
      // Image triggers may sit inside a project-card link. Prevent that link from
      // navigating so a direct image click consistently opens the lightbox.
      const img = trigger.matches('img') ? trigger : trigger.querySelector('img');
      if (!img) return;
      event.preventDefault();
      event.stopPropagation();
      lightboxImage.src = img.currentSrc || img.src;
      lightboxImage.alt = img.alt || 'Project image';
      if (lightboxCaption) lightboxCaption.textContent = trigger.dataset.caption || img.alt || 'Project image';
      if (!dialog.open) dialog.showModal();
    }));
    const close = dialog.querySelector('.lightbox-close');
    if (close) close.addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
    dialog.addEventListener('close', () => { lightboxImage.removeAttribute('src'); });
  }

  // Keep the disclosure label and its plus/minus state consistent.
  document.querySelectorAll('.project-details').forEach(details => {
    const summary = details.querySelector('summary');
    if (!summary) return;
    const labelNode = [...summary.childNodes].find(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim());
    if (!labelNode) return;
    const closedLabel = labelNode.textContent.trim();
    const openLabel = closedLabel.replace(/^View\b/i, 'Hide');
    const syncDisclosure = () => {
      labelNode.textContent = details.open ? ` ${openLabel} ` : ` ${closedLabel} `;
      summary.setAttribute('aria-expanded', String(details.open));
    };
    details.addEventListener('toggle', syncDisclosure);
    syncDisclosure();
  });

  // V5.2: gentle pointer parallax for the hero composition (fine pointers only).
  const heroVisual = document.querySelector('.hero-visual-v52');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (heroVisual && finePointer && !reduceMotion) {
    let pointerFrame = 0;
    heroVisual.addEventListener('pointermove', event => {
      const rect = heroVisual.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      cancelAnimationFrame(pointerFrame);
      pointerFrame = requestAnimationFrame(() => {
        heroVisual.style.setProperty('--map-x', `${x * -10}px`);
        heroVisual.style.setProperty('--map-y', `${y * -8}px`);
        heroVisual.style.setProperty('--portrait-x', `${x * 8}px`);
        heroVisual.style.setProperty('--portrait-y', `${y * 6}px`);
        heroVisual.style.setProperty('--spot-x', `${(x + 0.5) * 100}%`);
        heroVisual.style.setProperty('--spot-y', `${(y + 0.5) * 100}%`);
      });
    }, { passive: true });
    heroVisual.addEventListener('pointerleave', () => {
      heroVisual.style.setProperty('--map-x', '0px');
      heroVisual.style.setProperty('--map-y', '0px');
      heroVisual.style.setProperty('--portrait-x', '0px');
      heroVisual.style.setProperty('--portrait-y', '0px');
      heroVisual.style.setProperty('--spot-x', '70%');
      heroVisual.style.setProperty('--spot-y', '40%');
    }, { passive: true });
  }

  // Apply the pointer offsets without changing the composition's base rotations.
  const heroMapCard = document.querySelector('.hero-visual-v52 .hero-map-card');
  const heroPortrait = document.querySelector('.hero-visual-v52 .hero-portrait-card');
  if (heroMapCard) heroMapCard.style.transform = 'translate3d(var(--map-x, 0px), var(--map-y, 0px), 0) rotate(-4deg)';
  if (heroPortrait) heroPortrait.style.transform = 'translate3d(var(--portrait-x, 0px), var(--portrait-y, 0px), 0)';

  // Count selected evidence metrics once when they enter the viewport.
  const countTargets = [...document.querySelectorAll('[data-count]')];
  const formatCount = (value, decimals, suffix) => {
    const fixed = Number(value).toFixed(decimals);
    const [whole, fraction] = fixed.split('.');
    const grouped = Number(whole).toLocaleString('en-US');
    return `${grouped}${fraction ? `.${fraction}` : ''}${suffix || ''}`;
  };
  const runCounter = element => {
    if (element.dataset.counted === 'true') return;
    element.dataset.counted = 'true';
    const target = Number(element.dataset.count);
    const decimals = Number(element.dataset.decimals || 0);
    const suffix = element.dataset.suffix || '';
    const suffixNode = element.querySelector('span');
    const suffixMarkup = suffixNode ? suffixNode.outerHTML : '';
    if (reduceMotion || !Number.isFinite(target)) {
      element.innerHTML = `${formatCount(target, decimals, suffix)}${suffixMarkup}`;
      return;
    }
    const duration = 1250;
    const start = performance.now();
    const tick = now => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = target * eased;
      const formatted = formatCount(current, decimals, suffix);
      element.innerHTML = `${formatted}${suffixMarkup}`;
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if (countTargets.length && 'IntersectionObserver' in window) {
    const countObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        runCounter(entry.target);
        countObserver.unobserve(entry.target);
      }
    }), { threshold: .55 });
    countTargets.forEach(element => countObserver.observe(element));
  } else {
    countTargets.forEach(runCounter);
  }


  // Keep the active navigation item aligned with the section currently in view.
  const navLinks = [...document.querySelectorAll('.primary-nav a[href^="#"], .primary-nav a[href*="#"]')];
  const navTargets = navLinks.map(link => {
    const hash = new URL(link.href, window.location.href).hash;
    return hash ? document.querySelector(hash) : null;
  }).filter(Boolean);
  if ('IntersectionObserver' in window && navTargets.length) {
    const navObserver = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      navLinks.forEach(link => {
        const hash = new URL(link.href, window.location.href).hash;
        if (hash === `#${visible.target.id}`) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }, { rootMargin: '-25% 0px -60% 0px', threshold: [0, .15, .35, .6] });
    [...new Set(navTargets)].forEach(target => navObserver.observe(target));
  }

  // A restrained cursor tilt on project cards; never enabled on touch or reduced-motion devices.
  if (finePointer && !reduceMotion) {
    document.querySelectorAll('.project-card').forEach(card => {
      card.addEventListener('pointermove', event => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - .5;
        const y = (event.clientY - rect.top) / rect.height - .5;
        card.style.setProperty('--card-tilt-x', `${x * 1.3}deg`);
        card.style.setProperty('--card-tilt-y', `${y * -1.1}deg`);
        card.classList.add('is-tilting');
      }, { passive: true });
      card.addEventListener('pointerleave', () => {
        card.style.setProperty('--card-tilt-x', '0deg');
        card.style.setProperty('--card-tilt-y', '0deg');
        card.classList.remove('is-tilting');
      }, { passive: true });
    });
  }

})();
