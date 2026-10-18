document.querySelectorAll('form[action*="/delete/"]').forEach(form => {
  form.addEventListener('submit', event => {
    if (!confirm('Please select OK to delete this record')) event.preventDefault();
  });
});
