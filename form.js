document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('learn-more-form');
  if (!form) return;

  const SUPABASE_URL = 'https://cyenghrhcuxlfdmogaak.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5ZW5naHJoY3V4bGZkbW9nYWFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2Mzc0MjAsImV4cCI6MjA4ODIxMzQyMH0.HZSTF5ExJaIpD7gi6Lw8-xl4IzQ67B-ofXAJCiboeuk';

  const submitBtn = form.querySelector('.form-submit');
  const messageDiv = document.getElementById('form-message');
  const consentBox = form.querySelector('#consent');

  // Disable submit until consent is checked
  submitBtn.disabled = true;
  consentBox.addEventListener('change', () => {
    submitBtn.disabled = !consentBox.checked;
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    messageDiv.className = 'form-message';
    messageDiv.style.display = 'none';

    const name = form.querySelector('#name').value.trim();
    const email = form.querySelector('#email').value.trim();
    const consent = consentBox.checked;

    if (!name || !email || !consent) {
      showMessage('error', 'Please fill in all required fields and accept the terms.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showMessage('error', 'Please enter a valid email address.');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    try {
      const formData = new FormData();
      formData.append('form_fields[name]', name);
      formData.append('form_fields[email]', email);
      formData.append('form_fields[consent]', consent ? 'true' : 'false');
      formData.append('page_url', window.location.href);
      formData.append('form_id', '2Invent');

      const response = await fetch(`${SUPABASE_URL}/functions/v1/handle-landingpage-form`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: formData,
      });

      if (response.ok) {
        showMessage('success', 'Thank you! We will keep you updated on 2Invent.');
        form.reset();
        submitBtn.disabled = true;
      } else {
        showMessage('error', 'Something went wrong. Please try again.');
      }
    } catch (err) {
      console.error('Form submission error:', err);
      showMessage('error', 'Something went wrong. Please try again.');
    } finally {
      submitBtn.disabled = !consentBox.checked;
      submitBtn.textContent = 'Subscribe';
    }
  });

  function showMessage(type, text) {
    messageDiv.textContent = text;
    messageDiv.className = 'form-message ' + (type === 'success' ? 'success' : 'error-msg');
    messageDiv.style.display = 'block';
  }
});
