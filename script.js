// Elements
const thumbs = document.querySelectorAll('.thumb');
const modal = document.getElementById('preview-modal');
const modalImg = document.getElementById('preview-img');
const closeBtn = document.querySelector('.close-btn');

// Custom Scrollbar Elements
let customScrollbar, scrollbarTrack, scrollbarThumb;
let isDragging = false;

// Loading Screen Elements
const loadingScreen = document.getElementById('loading-screen');
const loadingVideo = document.querySelector('.loading-video');

// Animasi masuk
function initializeAnimations() {
  const thumbPositions = Array.from(thumbs).map(thumb => {
    const rect = thumb.getBoundingClientRect();
    return { element: thumb, left: rect.left, top: rect.top };
  });
  
  // Sort position
  thumbPositions.sort((a, b) => {
    if (Math.abs(a.left - b.left) > 50) return b.left - a.left;
    return a.top - b.top;
  });
  
  // Blink animation
  thumbPositions.forEach((item, index) => {
    const blinkDelay = index * 0.01;
    item.element.style.setProperty('--blink-delay', `${blinkDelay}s`);
    item.element.classList.add('blink-active');
  });
  
  // Slide animation
  setTimeout(() => {
    thumbPositions.forEach((item, index) => {
      const slideDelay = index * 0.01;
      item.element.style.setProperty('--slide-delay', `${slideDelay}s`);
      item.element.classList.add('slide-active');
    });
  }, 5);
}

// Hover effect
function handleMouseMove(e) {
  const mouseX = e.clientX;
  const mouseY = e.clientY;

  thumbs.forEach(thumb => {
    const rect = thumb.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = mouseX - centerX;
    const dy = mouseY - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const radius = Math.max(rect.width, rect.height);
    let scale = 1;

    if (distance < radius) {
      const proximity = 1 - distance / radius;
      scale = 1 + proximity * 0.06;
    }

    thumb.querySelector("img").style.transform = `scale(${scale})`;
  });
}

// Modal
function openModal(thumb) {
  const imgSrc = thumb.querySelector('img').src;
  modalImg.src = imgSrc;
  
  // Reset state modal
  modal.classList.remove('active', 'blink-active');
  
  // Tunggu gambar load untuk mendapatkan ukuran yang benar
  modalImg.onload = function() {
    const overlay = document.querySelector('.modal-overlay');
    const imgRect = modalImg.getBoundingClientRect();
    
    // Set ukuran overlay sesuai dengan gambar
    overlay.style.width = imgRect.width + 'px';
    overlay.style.height = imgRect.height + 'px';
    
    // Trigger reflow untuk restart animasi
    void modal.offsetWidth;
    
    // Tampilkan modal langsung (background langsung muncul)
    modal.classList.add('active');
    
    // Tambahkan efek blink warna orange hanya pada gambar
    modal.classList.add('blink-active');
  };
}

function closeModal() {
  modal.classList.remove('active', 'blink-active');
}

// Custom Scrollbar Functions
function createCustomScrollbar() {
  if (document.querySelector('.custom-scrollbar')) return;
  
  const container = document.querySelector('.gallery-container');
  
  // Buat custom scrollbar
  customScrollbar = document.createElement('div');
  customScrollbar.className = 'custom-scrollbar';
  customScrollbar.innerHTML = `
    <div class="scrollbar-track">
      <div class="scrollbar-thumb"></div>
    </div>
  `;
  document.body.appendChild(customScrollbar);
  
  scrollbarTrack = customScrollbar.querySelector('.scrollbar-track');
  scrollbarThumb = customScrollbar.querySelector('.scrollbar-thumb');
  
  // FUNCTION SET POSISI SCROLLBAR
  function setScrollbarPosition() {
    const containerRect = container.getBoundingClientRect();
    customScrollbar.style.top = containerRect.top + 'px';
    customScrollbar.style.height = containerRect.height + 'px';
    scrollbarTrack.style.height = containerRect.height + 'px';
  }
  
  // Update scrollbar thumb position
  function updateScrollbar() {
    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;
    
    if (scrollHeight <= clientHeight) {
      customScrollbar.style.display = 'none';
      return;
    }
    
    customScrollbar.style.display = 'block';
    const scrollPercentage = (container.scrollTop / (scrollHeight - clientHeight)) * 50;
    const thumbHeight = Math.max(50, (clientHeight / scrollHeight) * 50);
    
    scrollbarThumb.style.height = thumbHeight + '%';
    scrollbarThumb.style.top = scrollPercentage + '%';
  }
  
  // Scroll event
  container.addEventListener('scroll', updateScrollbar);
  
  // Drag functionality
  scrollbarThumb.addEventListener('mousedown', (e) => {
    isDragging = true;
    e.preventDefault();
  });
  
  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    
    const trackRect = scrollbarTrack.getBoundingClientRect();
    const clickY = e.clientY - trackRect.top;
    let dragPercentage = (clickY / trackRect.height) * 100;
    
    dragPercentage = Math.max(0, Math.min(100, dragPercentage));
    
    const scrollDistance = (dragPercentage / 100) * (container.scrollHeight - container.clientHeight);
    container.scrollTop = scrollDistance;
  });
  
  document.addEventListener('mouseup', () => {
    isDragging = false;
  });
  
  // Click on track to jump
  scrollbarTrack.addEventListener('click', (e) => {
    const trackRect = scrollbarTrack.getBoundingClientRect();
    const clickY = e.clientY - trackRect.top;
    const clickPercentage = (clickY / trackRect.height) * 100;
    
    const scrollDistance = (clickPercentage / 100) * (container.scrollHeight - container.clientHeight);
    container.scrollTop = scrollDistance;
  });
  
  // PANGGIL FUNCTION SET POSISI
  setScrollbarPosition();
  updateScrollbar();
  
  // Update on resize dan scroll window
  window.addEventListener('resize', () => {
    setScrollbarPosition();
    updateScrollbar();
  });
  
  window.addEventListener('scroll', () => {
    setScrollbarPosition();
  });
}

// Loading Screen Functions
function initLoadingScreen() {
  if (!loadingScreen) return;
  
  // Coba play video loading
  if (loadingVideo && loadingVideo.tagName === 'VIDEO') {
    const playPromise = loadingVideo.play();
    
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Kalo autoplay diblok, show fallback spinner
        const fallback = loadingVideo.querySelector('.loading-fallback');
        if (fallback) {
          loadingVideo.style.display = 'none';
          fallback.style.display = 'block';
        }
      });
    }
  }
  
  // Tunggu semua gambar thumbnail load
  const thumbImages = document.querySelectorAll('.thumb img');
  const totalImages = thumbImages.length;
  let loadedImages = 0;
  
  // Fungsi cek gambar yang sudah load
  function checkImageLoad() {
    thumbImages.forEach(img => {
      if (img.complete) {
        loadedImages++;
      } else {
        img.addEventListener('load', () => {
          loadedImages++;
          if (loadedImages === totalImages) {
            hideLoadingScreen();
          }
        });
        
        img.addEventListener('error', () => {
          loadedImages++; // Skip error images
          if (loadedImages === totalImages) {
            hideLoadingScreen();
          }
        });
      }
    });
    
    // Jika semua gambar sudah load atau timeout
    if (loadedImages === totalImages) {
      hideLoadingScreen();
    }
  }
  
  // Backup timeout (max 3 detik)
  setTimeout(hideLoadingScreen, 3000);
  
  // Start checking images
  checkImageLoad();
  
  function hideLoadingScreen() {
    loadingScreen.classList.add('fade-out');
    
    // Hapus dari DOM setelah animasi selesai
    setTimeout(() => {
      loadingScreen.style.display = 'none';
      
      // Pause video untuk hemat resources
      if (loadingVideo && loadingVideo.tagName === 'VIDEO') {
        loadingVideo.pause();
      }
    }, 500);
  }
}

// Event listeners
function setupEventListeners() {
  thumbs.forEach(thumb => {
    thumb.addEventListener('click', () => openModal(thumb));
  });

  closeBtn.addEventListener('click', closeModal);
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  window.addEventListener('mousemove', handleMouseMove);
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  initializeAnimations();
  setupEventListeners();
  createCustomScrollbar();
  initLoadingScreen();
});
