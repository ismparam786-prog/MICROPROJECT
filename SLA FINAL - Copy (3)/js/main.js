// js/main.js — WalkSmart interactions (updated; defensive & scoped)
// Helpers
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from((ctx || document).querySelectorAll(sel));

/* --------------------
   Set current year (supports multiple year spans)
-------------------- */
$$('[id^="year"]').forEach(el => el.textContent = new Date().getFullYear());

/* --------------------
   Mobile Menu Toggle (works across pages; requires #menuToggle)
-------------------- */
const menuToggle = $('#menuToggle');
const nav = document.querySelector('.nav');
if (menuToggle && nav) {
  menuToggle.addEventListener('click', () => {
    const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!expanded));
    nav.classList.toggle('nav-open');
  });
}

/* --------------------
   Shared Modal System (modal exists in pages)
-------------------- */
const modal = $('#modal');
const modalTitle = $('#modalTitle');
const modalBody = $('#modalBody');
const modalClose = $('#modalClose');

function openModal(title, html) {
  if (!modal) return;
  if (modalTitle) modalTitle.textContent = title || '';
  if (modalBody) modalBody.innerHTML = html || '';
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
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') closeModal();
  });
}

/* --------------------
   "More" Button content (used on multiple pages)
   - details keyed by dataset id
-------------------- */
const details = {
  m1: {
    title: 'Connected Streets',
    body: `<p>Well-connected street networks improve walkability by minimizing detours and increasing route options. Short block lengths and intersection density reduce walking distances and enhance accessibility.</p>`
  },
  m2: {
    title: 'Safety & Lighting',
    body: `<p>Traffic calming, clearly marked crossings and consistent lighting improve perceived and real safety for pedestrians.</p>`
  },
  m3: {
    title: 'Local Amenities',
    body: `<p>Nearby shops, transit and parks within walking distance encourage everyday walking and reduce car dependency.</p>`
  },
  m4: {
    title: 'Green & Shade',
    body: `<p>Trees, seating and shade increase thermal comfort and make streets more pleasant to walk.</p>`
  }
};

// Attach read-more if present (works for cards on index & walkability)
$$('.read-more').forEach(btn => {
  if (!btn.dataset) return;
  btn.addEventListener('click', () => {
    const key = btn.dataset.id;
    const d = details[key];
    if (d) openModal(d.title, d.body);
  });
});

/* --------------------
   Filter Cards (index page filter; safe to leave)
-------------------- */
const filterSelect = $('#filterSelect');
if (filterSelect) {
  filterSelect.addEventListener('change', () => {
    const val = filterSelect.value;
    $$('.card').forEach(card => {
      const cat = card.dataset.category;
      card.style.display = (val === 'all' || val === cat) ? '' : 'none';
    });
  });
}

/* --------------------
   Stats animation (only runs if those ids exist)
-------------------- */
function animateStat(id, target, ms = 900, showPlus = false) {
  const el = document.getElementById(id);
  if (!el) return;
  let start = 0;
  const steps = Math.max(1, Math.floor(ms / 30));
  const step = Math.max(1, Math.ceil(target / steps));
  const iv = setInterval(() => {
    start += step;
    if (start >= target) { start = target; clearInterval(iv); }
    const value = showPlus ? `+${start}` : (id === 'stat2' ? `${start}%` : start);
    el.textContent = value;
  }, 30);
}

// Example targets (will only animate where the IDs exist)
animateStat('stat1', 12);
animateStat('stat2', 76);
animateStat('stat3', 64);
animateStat('stat4', 42, 900, true);
animateStat('stat5', 35, 900, true);

/* --------------------
   Scroll reveal (applies to elements with .reveal)
-------------------- */
if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.18 });
  $$('.reveal').forEach(el => revealObserver.observe(el));
} else {
  // fallback: reveal immediately
  $$('.reveal').forEach(el => el.classList.add('active'));
}

/* --------------------
   Walkability page specific interactions:
   - accordion
   - demo (fake analysis)
   - quiz
   - checklist toggles + download + copy summary + reset
-------------------- */
(function walkabilityEnhancements() {
  // accordion
  $$('.acc-head').forEach(head => {
    head.addEventListener('click', () => {
      const body = head.nextElementSibling;
      if (!body) return;
      const active = body.classList.contains('active');
      // close all then toggle current
      document.querySelectorAll('.acc-body').forEach(b => b.classList.remove('active'));
      body.classList.toggle('active', !active);
    });
    head.addEventListener('keypress', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); head.click(); }
    });
  });

  // demo run (fake but useful for class demo)
  const runDemo = $('#runDemo');
  const resetDemo = $('#resetDemo');
  const demoOutput = $('#demoOutput');
  if (runDemo && demoOutput) {
    runDemo.addEventListener('click', () => {
      demoOutput.textContent = 'Scanning…';
      // small animation then show results
      setTimeout(() => {
        demoOutput.innerHTML = 'Sidewalk width: <strong>1.8 m</strong> • Crossings: <strong>2</strong> • Amenities within 500m: <strong>6</strong>';
      }, 700);
      // animate meter visuals if present
      $$('.meas-card .meter > i').forEach(i => {
        const w = i.getAttribute('data-demo') || i.style.width || '60%';
        i.style.width = w;
      });
    });
  }
  if (resetDemo && demoOutput) {
    resetDemo.addEventListener('click', () => demoOutput.textContent = '');
  }

  // quiz
  const quizSubmit = $('#quizSubmit');
  if (quizSubmit) {
    quizSubmit.addEventListener('click', () => {
      const answers = ['q1', 'q2', 'q3'].map(n => document.querySelector(`input[name="${n}"]:checked`));
      const score = answers.filter(Boolean).length;
      const out = $('#quizResult');
      if (!out) return;
      if (score >= 2) out.textContent = 'This street appears walkable based on your answers.';
      else out.textContent = 'There may be improvements needed to make this street more walkable.';
    });
  }

  // checklist toggles
  const auditList = $('#auditChecklist');
  if (auditList) {
    auditList.querySelectorAll('li').forEach(li => {
      // convert plain li into interactive line if there's no toggle
      let toggle = li.querySelector('.check-toggle');
      const textSpan = li.querySelector('.check-text') || (function () {
        const span = document.createElement('span');
        span.className = 'check-text';
        span.textContent = li.textContent.trim();
        li.textContent = '';
        li.appendChild(span);
        return span;
      })();

      if (!toggle) {
        // create toggle element at beginning
        toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.className = 'check-toggle';
        toggle.setAttribute('aria-pressed', 'false');
        li.insertBefore(toggle, li.firstChild);
        // ensure the text is wrapped
        if (!textSpan.parentElement.classList.contains('check-text')) {
          // already set above
        }
      }

      // attach click handler
      toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        const pressed = toggle.classList.contains('active');
        toggle.setAttribute('aria-pressed', String(pressed));
      });
    });
  }

  // download checklist
  const downloadBtn = $('#downloadChecklist');
  if (downloadBtn && auditList) {
    downloadBtn.addEventListener('click', () => {
      const lines = $$('#auditChecklist li').map(li => {
        const done = !!li.querySelector('.check-toggle')?.classList.contains('active');
        const text = (li.querySelector('.check-text') || li).textContent.trim();
        return `${done ? '[x]' : '[ ]'} ${text}`;
      });
      const content = `Walk Audit Checklist\n\n${lines.join('\n')}\n`;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'walk-audit-checklist.txt';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    });
  }

  // copy/share summary
  const shareBtn = $('#shareChecklist');
  if (shareBtn && auditList) {
    shareBtn.addEventListener('click', () => {
      const lines = $$('#auditChecklist li').map(li => {
        const done = !!li.querySelector('.check-toggle')?.classList.contains('active');
        const text = (li.querySelector('.check-text') || li).textContent.trim();
        return `${done ? '[x]' : '[ ]'} ${text}`;
      });
      const summary = `Walk Audit Summary:\n${lines.join('\n')}`;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(summary).then(() => alert('Checklist copied to clipboard'));
      } else {
        // fallback: show prompt to copy
        prompt('Copy this text', summary);
      }
    });
  }

  // reset selections
  const resetBtn = $('#resetChecklist');
  if (resetBtn && auditList) {
    resetBtn.addEventListener('click', () => {
      $$('#auditChecklist .check-toggle').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
    });
  }

  // make sure meter bars animate to their inline width on page load (smooth)
  window.requestAnimationFrame(() => {
    $$('.meter > i').forEach(i => {
      const inline = i.style.width || i.getAttribute('data-width');
      if (inline) i.style.width = inline;
    });
  });
})(); // end walkabilityEnhancements

/* --------------------
   Contact form (keeps original behavior if present)
-------------------- */
const contactForm = $('#contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const nameEl = $('#name'), emailEl = $('#email'), messageEl = $('#message');
    const name = nameEl ? nameEl.value.trim() : '';
    const email = emailEl ? emailEl.value.trim() : '';
    const message = messageEl ? messageEl.value.trim() : '';
    const msgEl = $('#formMsg');
    if (msgEl) msgEl.textContent = '';

    if (name.length < 2) return msgEl && (msgEl.textContent = 'Please enter a valid name.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return msgEl && (msgEl.textContent = 'Enter a valid email.');
    if (message.length < 8) return msgEl && (msgEl.textContent = 'Message is too short.');

    if (msgEl) msgEl.textContent = 'Sending...';

    // original endpoint — keep no-cors POST to google script for demo
    const endpoint = 'https://script.google.com/macros/s/AKfycbwZou-PYlQhZTnZdiJap9igX7EOwhIEtu1grpcgtkJBeOwGIXHhCuq04xqdZuYBM-OXbw/exec';
    const payload = { name, email, message, submittedAt: new Date().toISOString() };

    fetch(endpoint, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(() => { /* ignore network/CORS errors for this demo */ });

    if (msgEl) msgEl.textContent = 'Message sent! Thank you for reaching out.';
    contactForm.reset();
    setTimeout(() => { if (msgEl) msgEl.textContent = ''; }, 5000);
  });
}

/* --------------------
   Keyboard outline for accessibility
-------------------- */
document.addEventListener('keydown', e => {
  if (e.key === 'Tab') document.body.classList.add('show-focus');
});
