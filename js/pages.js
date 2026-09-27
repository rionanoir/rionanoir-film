const homeImages = Array.from({length: 20}, (_, i) => `images/works/home/${i + 1}.jpg`);

const homeSlide = document.getElementById('home-slide');
const homeView  = document.getElementById('v-1');
let homeIndex = 0;

function setRandomPos() {
  const vw = homeView.offsetWidth;
  const vh = homeView.offsetHeight;
  const iw = homeSlide.offsetWidth;
  const ih = homeSlide.offsetHeight;
  if (!iw || !ih) return;
  if (window.innerWidth <= 600) {
    homeSlide.style.left = '50%';
    homeSlide.style.top  = '50%';
  } else {
    const m = 10;
    const x = iw / 2 + m + Math.random() * Math.max(0, vw - iw - m * 2);
    const y = ih / 2 + m + Math.random() * Math.max(0, vh - ih - m * 2);
    homeSlide.style.left = x + 'px';
    homeSlide.style.top  = y + 'px';
  }
  homeSlide.style.transform = 'translate(-50%, -50%)';
}

if (homeSlide.complete) setRandomPos();
else homeSlide.addEventListener('load', setRandomPos, { once: true });

setInterval(() => {
  homeSlide.style.opacity = '0';
  setTimeout(() => {
    homeIndex = (homeIndex + 1) % homeImages.length;
    homeSlide.onload = () => {
      homeSlide.onload = null;
      setRandomPos();
      homeSlide.style.opacity = '1';
    };
    homeSlide.src = homeImages[homeIndex];
    if (homeSlide.complete && homeSlide.naturalWidth > 0) {
      homeSlide.onload = null;
      setRandomPos();
      homeSlide.style.opacity = '1';
    }
  }, 700);
}, 2800);


const artVideo = document.getElementById('art-video');
if (artVideo) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        artVideo.play();
      } else {
        artVideo.pause();
      }
    });
  }, { threshold: 0.3 });
  observer.observe(artVideo);
}

// iOSスクロールリセット: ビューがactiveになるたびにscrollTopをリセットしてiOSのスクロールコンテキストを再初期化
['v-2', 'v-3', 'v-4'].forEach(id => {
  const el = document.getElementById(id);
  if (!el) return;
  new MutationObserver(() => {
    if (el.classList.contains('active')) {
      requestAnimationFrame(() => { el.scrollTop = 0; });
    }
  }).observe(el, { attributes: true, attributeFilter: ['class'] });
});

const v4el = document.getElementById('v-4');

function resetSoundBtn(btn) {
  if (!btn) return;
  btn.classList.remove('active');
  btn.querySelector('span').textContent = 'SOUND ON';
}

document.querySelectorAll('.nf-video').forEach(video => {
  const btn = video.closest('.nf-video-wrap').querySelector('.nf-sound-btn');

  // root: v4el — only fires when video enters/leaves v-4's scroll area
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && v4el.classList.contains('active')) {
        video.currentTime = 0;
        video.play();
      } else {
        video.pause();
        video.muted = true;
        resetSoundBtn(btn);
      }
    });
  }, { root: v4el, threshold: 0.5 });
  observer.observe(video);

  if (btn) {
    btn.addEventListener('click', () => {
      if (video.muted) {
        video.muted = false;
        btn.classList.add('active');
        btn.querySelector('span').textContent = 'SOUND OFF';
      } else {
        video.muted = true;
        resetSoundBtn(btn);
      }
    });
  }
});

// v-4がactiveになったら先頭動画を再生、非activeなら全停止
new MutationObserver(() => {
  if (v4el.classList.contains('active')) {
    const first = v4el.querySelector('.nf-video');
    if (first) { first.currentTime = 0; first.play(); }
  } else {
    v4el.querySelectorAll('.nf-video').forEach(v => { v.pause(); v.muted = true; });
    v4el.querySelectorAll('.nf-sound-btn').forEach(b => resetSoundBtn(b));
  }
}).observe(v4el, { attributes: true, attributeFilter: ['class'] });

const copyBtn = document.getElementById('copy-email-btn');
if (copyBtn) {
  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText('rionanoir53@gmail.com').then(() => {
      copyBtn.textContent = 'Copied!';
      setTimeout(() => { copyBtn.textContent = 'rionanoir53@gmail.com'; }, 2000);
    });
  });
}
