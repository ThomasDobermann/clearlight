/* ─── Contact form ───────────────────────────────────────────────────────── */

// ── Form delivery ────────────────────────────────────────────────────────
// Until this is set, the form accepts input but tells the visitor it isn't
// live yet (fine for a review link, not for launch).
//
// To make it live: sign up free at formspree.io, create a form pointed at
// the studio's enquiries address, and paste the form ID here — a short
// string like "xdorwqkv". Nothing else needs changing.
const FORMSPREE_ID = 'YOUR_FORM_ID';

function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const btn = document.getElementById('submit-btn');
  const status = document.getElementById('form-status');
  const success = document.getElementById('contact-success');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (FORMSPREE_ID === 'YOUR_FORM_ID') {
      status.style.display = 'block';
      status.className = 'form-status';
      status.textContent = 'This form isn’t connected yet — it will be before the site goes live.';
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Sending…';
    status.style.display = 'none';

    // Read the fields via FormData. Don't use form.name / form.email —
    // a <form> already has its own .name property, so form.name returns
    // the form's name attribute rather than the name input.
    const fd = new FormData(form);
    const data = {
      name: (fd.get('name') || '').toString().trim(),
      email: (fd.get('email') || '').toString().trim(),
      message: (fd.get('message') || '').toString().trim(),
    };

    try {
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        form.style.display = 'none';
        success.style.display = 'block';
      } else {
        throw new Error('Submission failed');
      }
    } catch (err) {
      status.style.display = 'block';
      status.className = 'form-status error';
      status.textContent = 'Something went wrong — please try emailing us directly.';
      btn.disabled = false;
      btn.textContent = 'Send Message';
    }
  });
}

document.addEventListener('DOMContentLoaded', initContactForm);
