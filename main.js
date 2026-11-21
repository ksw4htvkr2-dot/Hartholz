// ─── NAV always white/beige ───

// ─── HAMBURGER ───
const hamburger = document.querySelector('.hamburger');
const mobileMenu = document.querySelector('.mobile-menu');
if (hamburger && mobileMenu) {
  function setMenuOpen(isOpen) {
    mobileMenu.classList.toggle('open', isOpen);
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
    hamburger.setAttribute('aria-label', isOpen ? 'Menü schließen' : 'Menü öffnen');
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  hamburger.addEventListener('click', () => setMenuOpen(!mobileMenu.classList.contains('open')));
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => setMenuOpen(false));
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && mobileMenu.classList.contains('open')) {
      setMenuOpen(false);
      hamburger.focus();
    }
  });
}

// ─── ACTIVE NAV LINK ───
const currentPage = window.location.pathname.split('/').filter(Boolean).pop() || 'index.html';
document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(a => {
  const href = a.getAttribute('href').split('/').pop();
  if (href === currentPage || (currentPage === '' && href === 'index.html')) {
    a.classList.add('active');
  }
});

// ─── SCROLL REVEAL ───
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), index * 80);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal').forEach(element => {
    element.classList.add('will-reveal');
    observer.observe(element);
  });
}

// ─── GALLERY TABS ───
const tabs = document.querySelectorAll('.gallery-tab');
const galleryItems = document.querySelectorAll('.gallery-item[data-cat]');
if (tabs.length) {
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const cat = tab.dataset.cat;
      galleryItems.forEach(item => {
        item.style.display = (cat === 'all' || item.dataset.cat === cat) ? '' : 'none';
      });
    });
  });
}
