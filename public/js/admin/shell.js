// Admin shell: mobile menu toggle and confirm-before-submit for destructive forms.
const toggle = document.getElementById('admin-nav-toggle');
const nav = document.getElementById('admin-nav');
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('hidden') === false;
    toggle.setAttribute('aria-expanded', String(open));
  });
}

document.querySelectorAll('form[data-confirm]').forEach((form) => {
  form.addEventListener('submit', (e) => {
    if (!window.confirm(form.dataset.confirm)) e.preventDefault();
  });
});
