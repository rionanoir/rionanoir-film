function selectSub(el) {
  document.querySelectorAll('.sub-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
}
