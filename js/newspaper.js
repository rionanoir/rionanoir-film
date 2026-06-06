const stage    = document.getElementById('stage');
const site     = document.getElementById('site');
const diceArea = document.getElementById('dice-area');

let flipCount = 0;
const sheets = [
  document.getElementById('s3'),
  document.getElementById('s2'),
  document.getElementById('s1'),
];

sheets.forEach((s, i) => {
  s.addEventListener('click', () => {
    if (flipCount !== i) return;
    s.classList.add('flipped');
    flipCount++;
    if (flipCount === 3) {
      setTimeout(() => {
        stage.style.display = 'none';
        site.classList.add('show');
        diceArea.classList.add('visible');
      }, 600);
    }
  });
});
