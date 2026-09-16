/* ─── Contact form ───────────────────────────────────────────────────────── */

// ⚠️ REPLACE THIS with your form ID from formspree.io
// Sign up free, create a form, and paste the ID here (looks like "xdorwqkv")
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
      status.className = 'form-status error';
      status.textContent = 'Form not configured yet — add your Formspree ID in js/contact.js';
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Sending…';
    status.style.display = 'none';

    const data = {
      name: form.name.value,
      email: form.email.value,
      message: form.message.value,
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
