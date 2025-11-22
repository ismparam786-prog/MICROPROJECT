// js/main.js — WalkSmart interactions (fixed & optimised)

// Helpers
const $ = (sel, ctx=document) => ctx.querySelector(sel);
const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));

/* -----------------------------------
   Set current year
----------------------------------- */
$$('[id^="year"]').forEach(el => el.textContent = new Date().getFullYear());

/* -----------------------------------
   Mobile Menu Toggle
----------------------------------- */
const menuToggle = $('#menuToggle');
const nav = $('.nav');

if (menuToggle && nav) {
  menuToggle.addEventListener('click', () => {
    const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!expanded));
    nav.classList.toggle('nav-open');
  });
}

/* -----------------------------------
   MODAL SYSTEM
----------------------------------- */
const modal = $('#modal');
const modalTitle = $('#modalTitle');
const modalBody = $('#modalBody');
const modalClose = $('#modalClose');

function openModal(title, html) {
  if (!modal) return;
  modalTitle.textContent = title;
  modalBody.innerHTML = html;
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  if (!modal) return;
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

if (modalClose) modalClose.addEventListener('click', closeModal);

if (modal) {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
}

document.addEventListener('keydown', (e) => {
  if (e.key === "Escape" && modal.getAttribute("aria-hidden") === "false") {
    closeModal();
  }
});

/* -----------------------------------
   "More" Button / Read More Modal Data
----------------------------------- */
const details = {
  m1: {
    title: 'Connected Streets',
    body: `<p>Connected street networks allow shorter, more direct walking routes. Add pedestrian shortcuts and raised crossings to slow vehicles.</p>`
  },
  m2: {
    title: 'Safety & Lighting',
    body: `<p>Reduce speeds, improve lighting, and design active frontages to increase "eyes on the street".</p>`
  },
  m3: {
    title: 'Local Amenities',
    body: `<p>Mixed-use development places daily needs within a short walk — groceries, schools and transit stops.</p>`
  },
  m4: {
    title: 'Green & Shade',
    body: `<p>Street trees, bioswales and pocket parks add shade, store runoff and make walking pleasant.</p>`
  }
};

$$('.read-more').forEach(btn => {
  btn.addEventListener('click', () => {
    const d = details[btn.dataset.id];
    if (d) openModal(d.title, d.body);
  });
});

/* -----------------------------------
   Filter Cards
----------------------------------- */
const filterSelect = $('#filterSelect');

if (filterSelect) {
  filterSelect.addEventListener('change', () => {
    const val = filterSelect.value;

    $$('.card').forEach(card => {
      const cat = card.dataset.category;
      card.style.display = (val === 'all' || val === cat) ? 'block' : 'none';
    });
  });
}

/* -----------------------------------
   Stats Animation
----------------------------------- */
function animateStat(id, target, ms = 900) {
  const el = document.getElementById(id);
  if (!el) return;

  let start = 0;
  const steps = Math.floor(ms / 30);
  const step = Math.ceil(target / steps);

  const iv = setInterval(() => {
    start += step;
    if (start >= target) {
      start = target;
      clearInterval(iv);
    }
    el.textContent = id === 'stat2' ? `${start}%` : start;
  }, 30);
}

animateStat('stat1', 12);
animateStat('stat2', 76);
animateStat('stat3', 64);

/* -----------------------------------
   Scroll Reveal
----------------------------------- */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.18 });

$$('.reveal').forEach(el => revealObserver.observe(el));

/* -----------------------------------
   Contact Form Validation
----------------------------------- */
const contactForm = $('#contactForm');

if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = $('#name').value.trim();
    const email = $('#email').value.trim();
    const message = $('#message').value.trim();
    const msgEl = $('#formMsg');
    msgEl.textContent = '';

    if (name.length < 2) return msgEl.textContent = 'Please enter a valid name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return msgEl.textContent = 'Enter a valid email.';
    if (message.length < 8) return msgEl.textContent = 'Message is too short.';

    msgEl.textContent = 'Message received!';
    contactForm.reset();
    setTimeout(() => msgEl.textContent = '', 4000);
  });
}

/* -----------------------------------
   Keyboard Outline
----------------------------------- */
document.addEventListener('keydown', e => {
  if (e.key === 'Tab') document.body.classList.add('show-focus');
});
