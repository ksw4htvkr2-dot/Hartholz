// ── GALLERY TAB FILTER ──
document.querySelectorAll('.gallery-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.gallery-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const cat = tab.dataset.cat;
    document.querySelectorAll('#dynGallery .gi').forEach(item => {
      const show = cat === 'all' || item.dataset.cat === cat;
      item.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      item.style.opacity = show ? '1' : '0.15';
      item.style.transform = show ? 'scale(1)' : 'scale(0.97)';
      item.style.pointerEvents = show ? '' : 'none';
    });
  });
});

// ── SCROLL FADE: bidirectional, works up and down ──
const fadeEls = document.querySelectorAll('.si, .feat-card, .split-gap');
let ticking = false;

function applyFade() {
  const vh = window.innerHeight;
  fadeEls.forEach(el => {
    const rect = el.getBoundingClientRect();
    const center = rect.top + rect.height / 2;
    const distFromCenter = (center - vh / 2) / vh;
    const fadeDist = Math.max(0, Math.abs(distFromCenter) - 0.65);
    const opacity = Math.max(0.3, 1 - fadeDist * 1.2);
    const translateY = Math.min(12, fadeDist * 30);
    const dir = distFromCenter > 0 ? 1 : -1;
    el.style.opacity = opacity;
    el.style.transform = `translateY(${dir * translateY}px)`;
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  });
  ticking = false;
}

window.addEventListener('scroll', () => {
  if (!ticking) { requestAnimationFrame(applyFade); ticking = true; }
}, { passive: true });
applyFade();

(function() {
  const tabRow = document.querySelector('.saw-track');
  if (!tabRow) return;
  const tabs = tabRow.querySelectorAll('.gallery-tab');
  if (!tabs.length) return;

  const indicator = document.createElement('div');
  indicator.className = 'saw-indicator';
  tabRow.appendChild(indicator);

  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'saw-blade-svg');
  svg.setAttribute('viewBox', '0 0 22 22');

  const g = document.createElementNS(NS, 'g');
  g.innerHTML = `
    <circle cx="11" cy="11" r="8.5" fill="none" stroke="#C9A96E" stroke-width="1.5"/>
    <circle cx="11" cy="11" r="3.8" fill="#C9A96E"/>
    <polygon points="11,1 12.6,4 11,3.2 9.4,4" fill="#C9A96E"/>
    <polygon points="21,11 18,12.6 18.8,11 18,9.4" fill="#C9A96E"/>
    <polygon points="11,21 9.4,18 11,18.8 12.6,18" fill="#C9A96E"/>
    <polygon points="1,11 4,9.4 3.2,11 4,12.6" fill="#C9A96E"/>
    <polygon points="18.56,3.44 15.5,6.5 16.4,5.2 15.1,5.9" fill="#C9A96E"/>
    <polygon points="18.56,18.56 15.5,15.5 16.8,15.1 16.1,16.4" fill="#C9A96E"/>
    <polygon points="3.44,18.56 6.5,15.5 5.9,16.8 5.2,16.1" fill="#C9A96E"/>
    <polygon points="3.44,3.44 6.5,6.5 5.2,5.9 5.9,5.2" fill="#C9A96E"/>`;
  svg.appendChild(g);
  tabRow.appendChild(svg);

  let animFrame, curLeft = 0, curWidth = 0, rotation = 0;

  function setInstant(tab) {
    const rr = tabRow.getBoundingClientRect();
    const tr = tab.getBoundingClientRect();
    curLeft = tr.left - rr.left;
    curWidth = tr.width;
    indicator.style.cssText = `left:${curLeft}px;width:${curWidth}px;transition:none`;
    svg.style.left = (curLeft + curWidth / 2) + 'px';
  }

  function animateTo(tab) {
    const rr = tabRow.getBoundingClientRect();
    const tr = tab.getBoundingClientRect();
    const toLeft = tr.left - rr.left;
    const toWidth = tr.width;
    const fromLeft = curLeft, fromWidth = curWidth;
    const dist = Math.abs(toLeft - fromLeft);
    const duration = 420 + dist * 0.4;
    const start = performance.now();
    cancelAnimationFrame(animFrame);

    function step(now) {
      const t = Math.min(1, (now - start) / duration);
      const ease = t < 0.5 ? 2*t*t : -1+(4-2*t)*t;
      const cl = fromLeft + (toLeft - fromLeft) * ease;
      const cw = fromWidth + (toWidth - fromWidth) * ease;
      indicator.style.left = cl + 'px';
      indicator.style.width = cw + 'px';
      indicator.style.transition = 'none';
      svg.style.left = (cl + cw / 2) + 'px';
      rotation += (dist / duration) * 16;
      g.style.transform = `rotate(${rotation}deg)`;
      g.style.transformOrigin = '11px 11px';
      if (t < 1) { animFrame = requestAnimationFrame(step); }
      else { curLeft = toLeft; curWidth = toWidth; }
    }
    animFrame = requestAnimationFrame(step);
  }

  setTimeout(() => {
    setInstant(tabRow.querySelector('.gallery-tab.active') || tabs[0]);
  }, 80);

  tabs.forEach(tab => tab.addEventListener('click', () => animateTo(tab)));
})();

// ── MOBILE GALLERY SLIDER ──
(function() {
  const track = document.getElementById('sliderTrack');
  const dotsContainer = document.getElementById('sliderDots');
  if (!track) return;

  const slides = track.querySelectorAll('.gi');
  let current = 0;

  // Build dots
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', `Projekt ${i + 1} anzeigen`);
    dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => goTo(i));
    dotsContainer.appendChild(dot);
  });

  function goTo(idx) {
    current = (idx + slides.length) % slides.length;
    track.style.transform = `translateX(-${current * 100}%)`;
    slides.forEach((slide, i) => { slide.tabIndex = i === current ? 0 : -1; });
    dotsContainer.querySelectorAll('.slider-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === current);
      dot.setAttribute('aria-current', i === current ? 'true' : 'false');
    });
  }

  goTo(0);
  document.getElementById('sliderPrev').addEventListener('click', () => goTo(current - 1));
  document.getElementById('sliderNext').addEventListener('click', () => goTo(current + 1));

  // Touch swipe
  let startX = 0;
  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) goTo(diff > 0 ? current + 1 : current - 1);
  }, { passive: true });
})();

// ── COOKIE BAR ──
(function() {
  const bar = document.getElementById('cookieBar');
  if (!bar) return;
  if (localStorage.getItem('cookieChoice')) return;

  setTimeout(() => bar.classList.add('visible'), 1200);

  document.getElementById('cookieAccept').addEventListener('click', () => {
    localStorage.setItem('cookieChoice', 'accepted');
    bar.style.transform = 'translateY(100%)';
  });
  document.getElementById('cookieDecline').addEventListener('click', () => {
    localStorage.setItem('cookieChoice', 'declined');
    bar.style.transform = 'translateY(100%)';
  });
})();
