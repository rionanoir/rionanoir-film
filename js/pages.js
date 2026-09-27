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

const noirVideo = document.getElementById('noir-video');
const soundBtn  = document.getElementById('nf-sound-btn');

if (noirVideo) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        noirVideo.play();
      } else {
        noirVideo.pause();
        noirVideo.muted = true;
        if (soundBtn) {
          soundBtn.classList.remove('active');
          soundBtn.querySelector('span').textContent = 'SOUND ON';
        }
      }
    });
  }, { threshold: 0.3 });
  observer.observe(noirVideo);
}

if (soundBtn && noirVideo) {
  soundBtn.addEventListener('click', () => {
    if (noirVideo.muted) {
      noirVideo.muted = false;
      soundBtn.classList.add('active');
      soundBtn.querySelector('span').textContent = 'SOUND OFF';
    } else {
      noirVideo.muted = true;
      soundBtn.classList.remove('active');
      soundBtn.querySelector('span').textContent = 'SOUND ON';
    }
  });
}
