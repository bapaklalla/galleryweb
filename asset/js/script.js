// Elements
const thumbs = document.querySelectorAll('.thumb');
const modal = document.getElementById('preview-modal');
const modalImg = document.getElementById('preview-img');
const closeBtn = document.querySelector('.close-btn');

// Variabel untuk tombol navigasi
let prevBtn = null;
let nextBtn = null;

let customScrollbar, scrollbarTrack, scrollbarThumb;
let isDragging = false;
let modalTimeout;
let isAnimating = false;

// EASY SETTING - UBAH AJA INI
let BLINK =1;     // ms - durasi blink
let SLIDE = 100;     // ms - durasi slide  
let EASING = "cubic-bezier(0.4, 0, 0, 1)"; // easing
let CLOSE_DELAY = 0;

// Variables for image navigation
let currentImageIndex = 0;
let allImages = [];

document.addEventListener("contextmenu", e => e.preventDefault());

function initLoadingScreen() {
  const loadingScreen = document.getElementById('loading-screen');
  const progressBar = document.querySelector('.loading-progress');
  const percentageText = document.querySelector('.loading-percentage');
  
  if (!loadingScreen) return;
  
  let totalAssets = 0;
  let loadedAssets = 0;
  let isComplete = false;

  function hideLoadingScreen() {
    if (isComplete) return;
    
    isComplete = true;
    loadingScreen.classList.add('fade-out');
    
    document.querySelectorAll('.loading-video').forEach(video => {
      if (video.pause) video.pause();
    });
    
    setTimeout(() => {
      loadingScreen.style.display = 'none';
      initializeAnimations();
      initImageArray();
    }, 10);
  }

  function updateProgress() {
    loadedAssets++;
    
    const progress = Math.min(Math.round((loadedAssets / totalAssets) * 100), 100);
    
    if (progressBar) {
      progressBar.style.width = `${progress}%`;
    }
    
    if (percentageText) {
      percentageText.textContent = `${progress}%`;
    }
    
    if (loadedAssets >= totalAssets && totalAssets > 0) {
      setTimeout(hideLoadingScreen, 1000);
    }
  }

  function trackImages() {
    const images = document.querySelectorAll('img');
    totalAssets += images.length;
    
    images.forEach(img => {
      if (img.complete) {
        loadedAssets++;
      } else {
        img.addEventListener('load', updateProgress);
        img.addEventListener('error', updateProgress);
      }
    });
  }

  function trackVideos() {
    const videos = document.querySelectorAll('video');
    totalAssets += videos.length;
    
    videos.forEach(video => {
      if (video.readyState >= 4) {
        loadedAssets++;
      } else {
        video.addEventListener('loadeddata', updateProgress);
        video.addEventListener('error', updateProgress);
      }
      
      if (video.classList.contains('loading-video')) {
        video.play().catch(() => {
          const fallback = document.querySelector('.loading-fallback');
          if (fallback) {
            video.style.display = 'none';
            fallback.style.display = 'block';
          }
        });
      }
    });
  }

  function trackFonts() {
    totalAssets++;
    document.fonts.ready
      .then(updateProgress)
      .catch(() => {
        loadedAssets++;
        updateProgress();
      });
  }

  function countAndTrackAssets() {
    totalAssets = 0;
    loadedAssets = 0;
    
    trackImages();
    trackVideos();
    trackFonts();
    
    if (totalAssets === 0) {
      setTimeout(hideLoadingScreen, 2000);
    } else {
      updateProgress();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', countAndTrackAssets);
  } else {
    countAndTrackAssets();
  }
  
  setTimeout(hideLoadingScreen, 10000);
}

// Initialize image array for navigation
function initImageArray() {
  console.log('Initializing image array...');
  allImages = Array.from(thumbs).map(thumb => {
    const img = thumb.querySelector('img');
    return {
      src: img.src,
      element: thumb,
      title: img.alt || ''
    };
  });
  console.log('Total images found:', allImages.length);
}

function initializeAnimations() {
  const thumbPositions = Array.from(thumbs).map(thumb => {
    const rect = thumb.getBoundingClientRect();
    return { element: thumb, left: rect.left, top: rect.top };
  });
  
  thumbPositions.sort((a, b) => {
    if (Math.abs(a.left - b.left) > 50) return b.left - a.left;
    return a.top - b.top;
  });
  
  thumbPositions.forEach((item, index) => {
    const blinkDelay = index * 0.01;
    item.element.style.setProperty('--blink-delay', `${blinkDelay}s`);
    item.element.classList.add('blink-active');
  });
  
  setTimeout(() => {
    thumbPositions.forEach((item, index) => {
      const slideDelay = index * 0.01;
      item.element.style.setProperty('--slide-delay', `${slideDelay}s`);
      item.element.classList.add('slide-active');
    });
  }, 5);
}

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

// Function to find and setup navigation buttons
function findAndSetupNavButtons() {
  console.log('Looking for navigation buttons...');
  
  // CARI TOMBOL DENGAN CLASS YANG BENAR
  prevBtn = document.querySelector('.prev-btn');
  nextBtn = document.querySelector('.next-btn');
  
  console.log('Found prev-btn:', prevBtn);
  console.log('Found next-btn:', nextBtn);
  
  // Setup event listeners jika tombol ditemukan
  if (prevBtn) {
    console.log('Setting up prev button event listener');
    // Hapus event listener lama jika ada
    prevBtn.removeEventListener('click', handlePrevClick);
    // Tambah event listener baru
    prevBtn.addEventListener('click', handlePrevClick);
  }
  
  if (nextBtn) {
    console.log('Setting up next button event listener');
    // Hapus event listener lama jika ada
    nextBtn.removeEventListener('click', handleNextClick);
    // Tambah event listener baru
    nextBtn.addEventListener('click', handleNextClick);
  }
}

// Event handler untuk tombol
function handlePrevClick(e) {
  console.log('PREV BUTTON CLICKED!');
  e.preventDefault();
  e.stopPropagation();
  prevImage();
}

function handleNextClick(e) {
  console.log('NEXT BUTTON CLICKED!');
  e.preventDefault();
  e.stopPropagation();
  nextImage();
}

// ANIMASI GANTI GAMBAR: remove any closeBtn style changes
function changeImageWithAnimation(newSrc) {
  return new Promise((resolve) => {
    console.log('Starting image change animation...');
    
    const container = document.querySelector('.modal-image-container');
    
    // 1. RESET ANIMASI SEBELUMNYA
    modalImg.style.animation = 'none';
    
    // 2. SET POSISI AWAL SAMA DENGAN BUKA MODAL - INCLUDE CLOSE BUTTON
    modalImg.style.opacity = '0';
    modalImg.style.transform = 'translateY(30px)';
    
    
    // 3. GANTI SRC GAMBAR
    modalImg.src = newSrc;
    
    // 4. TUNGGU GAMBAR LOAD
    if (modalImg.complete && modalImg.naturalHeight > 0) {
      animateImageIn();
    } else {
      modalImg.onload = animateImageIn;
      modalImg.onerror = () => {
        console.log('Error loading image');
        modalImg.style.opacity = '1';
        modalImg.style.transform = 'translateY(0)';
        resolve();
      };
      
      // Fallback timeout
      setTimeout(() => {
        if (modalImg.complete) {
          animateImageIn();
        }
      }, 200);
    }
    
    function animateImageIn() {
      console.log('New image loaded, animating in...');
      
      // Trigger reflow untuk restart animasi
      if (modal) void modal.offsetWidth;
      
      // Gambar muncul
      modalImg.style.opacity = '1';
      
      // SLIDE GAMBAR
      setTimeout(() => {
        modalImg.style.animation = `imageSlideUp ${SLIDE}ms ${EASING} forwards`;
        
        
        // RESET SETELAH ANIMASI SELESAI
        setTimeout(() => {
          modalImg.style.animation = '';
          modalImg.style.transform = 'translateY(0)';
          console.log('Image change animation complete');
          resolve();
        }, SLIDE);
        
      }, BLINK);
    }
  });
}

// Function to open modal with specific index
function openModalWithIndex(index) {
  console.log('Opening modal with index:', index, 'Total images:', allImages.length);
  
  if (index < 0 || index >= allImages.length || isAnimating) {
    console.log('Cannot open modal:', {index, isAnimating});
    return;
  }
  
  isAnimating = true;
  currentImageIndex = index;
  const imgSrc = allImages[currentImageIndex].src;
  console.log('Setting image src:', imgSrc);
  
  // Cari dan setup tombol navigasi
  findAndSetupNavButtons();
  
  const container = document.querySelector('.modal-image-container');
  
  // RESET
  modal.classList.remove('active');
  modalImg.style.animation = 'none';
  modalImg.style.opacity = '0';
  modalImg.style.transform = 'translateY(30px)';
  
  // Reset container size
  container.style.width = 'auto';
  container.style.height = 'auto';
  
  // Hapus event listener sebelumnya jika ada
  modalImg.onload = null;
  
  // Set event listener baru
  modalImg.onload = function() {
    console.log('Image loaded, showing modal');
    
    // Set container size = image size
    const imgRect = modalImg.getBoundingClientRect();
    container.style.width = imgRect.width + 'px';
    container.style.height = imgRect.height + 'px';
    
    // Trigger reflow
    if (modal) void modal.offsetWidth;
    
    // Tampilkan modal
    modal.classList.add('active');
    
    // Gambar muncul
    modalImg.style.opacity = '1';
    
    // SLIDE GAMBAR
    setTimeout(() => {
      modalImg.style.animation = `imageSlideUp ${SLIDE}ms ${EASING} forwards`;
      
      // removed: closeBtn show animation
      setTimeout(() => {
        isAnimating = false;
        console.log('Animation complete');
      }, CLOSE_DELAY);
            
    }, BLINK);
  };
  
  // Set gambar
  modalImg.src = imgSrc;
  
  // Fallback jika gambar sudah loaded
  if (modalImg.complete) {
    console.log('Image already loaded, triggering onload manually');
    modalImg.onload();
  }
}

// Original openModal function
function openModal(thumb) {
  console.log('Opening modal from thumb click');
  const index = Array.from(thumbs).indexOf(thumb);
  console.log('Found index:', index);
  if (index !== -1) {
    openModalWithIndex(index);
  }
}

// Navigate to next image - DENGAN ANIMASI SAMA DENGAN BUKA MODAL
async function nextImage() {
  console.log('=== NEXT IMAGE ===');
  console.log('Current index:', currentImageIndex);
  console.log('Total images:', allImages.length);
  
  if (!modal.classList.contains('active')) {
    console.log('Modal not active');
    return;
  }
  
  if (isAnimating) {
    console.log('Still animating...');
    return;
  }
  
  isAnimating = true;
  
  // Hitung index berikutnya
  const nextIndex = (currentImageIndex + 1) % allImages.length;
  console.log('Moving to index:', nextIndex);
  
  if (!allImages[nextIndex]) {
    console.log('No image at index:', nextIndex);
    isAnimating = false;
    return;
  }
  
  try {
    // Animate image change dengan efek yang sama
    await changeImageWithAnimation(allImages[nextIndex].src);
    
    // Update current index
    currentImageIndex = nextIndex;
    
    console.log('Next image shown successfully');
  } catch (error) {
    console.log('Error in nextImage:', error);
  } finally {
    isAnimating = false;
  }
}

// Navigate to previous image - DENGAN ANIMASI SAMA DENGAN BUKA MODAL
async function prevImage() {
  console.log('=== PREV IMAGE ===');
  console.log('Current index:', currentImageIndex);
  console.log('Total images:', allImages.length);
  
  if (!modal.classList.contains('active')) {
    console.log('Modal not active');
    return;
  }
  
  if (isAnimating) {
    console.log('Still animating...');
    return;
  }
  
  isAnimating = true;
  
  // Hitung index sebelumnya
  const prevIndex = (currentImageIndex - 1 + allImages.length) % allImages.length;
  console.log('Moving to index:', prevIndex);
  
  if (!allImages[prevIndex]) {
    console.log('No image at index:', prevIndex);
    isAnimating = false;
    return;
  }
  
  try {
    // Animate image change dengan efek yang sama
    await changeImageWithAnimation(allImages[prevIndex].src);
    
    // Update current index
    currentImageIndex = prevIndex;
    
    console.log('Prev image shown successfully');
  } catch (error) {
    console.log('Error in prevImage:', error);
  } finally {
    isAnimating = false;
  }
}

function closeModal() {
  console.log('Closing modal');
  
  // Reset semua
  modalImg.style.animation = 'none';
  modalImg.style.opacity = '0';
  modalImg.style.transform = 'translateY(30px)';
  
  modal.classList.remove('active');
  isAnimating = false;
}

// Block zoom pada gambar
function blockImageZoom() {
  if (!modalImg || !modal) return;
  
  const blockEvent = (e) => {
    try { e.preventDefault(); } catch (err) {}
    try { e.stopPropagation(); } catch (err) {}
    return false;
  };

  // Wheel / mousewheel - cegah terutama jika Ctrl ditekan
  modalImg.addEventListener('wheel', (e) => {
    // selalu cegah scroll zoom pada gambar modal
    blockEvent(e);
  }, { passive: false });

  modalImg.addEventListener('mousewheel', blockEvent, { passive: false });
  modalImg.addEventListener('dblclick', blockEvent, { passive: false });

  // Touch: cegah multi-touch (pinch) dan juga single touch move agar tidak di-zoom
  modalImg.addEventListener('touchstart', (e) => {
    if (e.touches && e.touches.length > 1) {
      blockEvent(e); // pinch start
    } else {
      // cegah double-tap zoom
      blockEvent(e);
    }
  }, { passive: false });

  modalImg.addEventListener('touchmove', (e) => {
    if (e.touches && e.touches.length > 1) {
      blockEvent(e); // pinch move
    } else {
      blockEvent(e);
    }
  }, { passive: false });

  // Safari gesture events (iOS Safari)
  try {
    modalImg.addEventListener('gesturestart', blockEvent);
    modalImg.addEventListener('gesturechange', blockEvent);
    modalImg.addEventListener('gestureend', blockEvent);
  } catch (err) {
    // some browsers don't support gesture events
  }

  // Global listeners while modal aktif: cegah ctrl+wheel dan keyboard zoom shortcuts
  function globalWheelHandler(e) {
    if (!modal.classList.contains('active')) return;
    if (e.ctrlKey) {
      blockEvent(e);
    }
  }
  document.addEventListener('wheel', globalWheelHandler, { passive: false });

  function globalKeyHandler(e) {
    if (!modal.classList.contains('active')) return;
    // cegah Ctrl + +, -, =, 0  (zoom shortcuts)
    if (e.ctrlKey && (e.key === '+' || e.key === '-' || e.key === '=' || e.key === '0')) {
      blockEvent(e);
    }
    // cegah Ctrl + mousewheel via keydown (precaution)
    if (e.ctrlKey && (e.key === 'Control')) {
      blockEvent(e);
    }
  }
  document.addEventListener('keydown', globalKeyHandler, { passive: false });
}

// Handle keyboard navigation
function handleKeyboardNavigation(e) {
  if (!modal.classList.contains('active') || isAnimating) return;
  
  console.log('Key pressed:', e.key);
  
  switch(e.key) {
    case 'ArrowLeft':
      e.preventDefault();
      prevImage();
      break;
    case 'ArrowRight':
      e.preventDefault();
      nextImage();
      break;
    case 'Escape':
      closeModal();
      break;
  }
}

// Handle touch swipe for mobile
function setupTouchSwipe() {
  let touchStartX = 0;
  let touchEndX = 0;
  let touchStartY = 0;
  let touchEndY = 0;
  
  modal.addEventListener('touchstart', (e) => {
    if (!modal.classList.contains('active') || isAnimating) return;
    
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  }, { passive: true });
  
  modal.addEventListener('touchend', (e) => {
    if (!modal.classList.contains('active') || isAnimating) return;
    
    touchEndX = e.changedTouches[0].screenX;
    touchEndY = e.changedTouches[0].screenY;
    
    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;
    
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
      if (diffX > 0) {
        nextImage();
      } else {
        prevImage();
      }
    }
  }, { passive: true });
}

function createCustomScrollbar() {
  // don't create custom scrollbar on small screens (mobile phones)
  if (window.matchMedia && window.matchMedia('(max-width: 768px)').matches) {
    return;
  }

  if (document.querySelector('.custom-scrollbar')) return;
  
  const container = document.querySelector('.gallery-container');
  const mobileHeader = document.querySelector('.mobile-header');
  
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
  
  function setScrollbarPosition() {
    const containerRect = container.getBoundingClientRect();
    
    let headerHeight = 0;
    if (mobileHeader && window.getComputedStyle(mobileHeader).display !== 'none') {
      headerHeight = mobileHeader.offsetHeight;
    }
    
    customScrollbar.style.top = (containerRect.top + headerHeight) + 'px';
    customScrollbar.style.height = (containerRect.height - headerHeight) + 'px';
    scrollbarTrack.style.height = (containerRect.height - headerHeight) + 'px';
  }
  
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
  
  container.addEventListener('scroll', updateScrollbar);
  
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
  
  scrollbarTrack.addEventListener('click', (e) => {
    const trackRect = scrollbarTrack.getBoundingClientRect();
    const clickY = e.clientY - trackRect.top;
    const clickPercentage = (clickY / trackRect.height) * 100;
    
    const scrollDistance = (clickPercentage / 100) * (container.scrollHeight - container.clientHeight);
    container.scrollTop = scrollDistance;
  });
  
  setScrollbarPosition();
  updateScrollbar();
  
  window.addEventListener('resize', () => {
    setScrollbarPosition();
    updateScrollbar();
  });
  
  window.addEventListener('scroll', () => {
    setScrollbarPosition();
  });
}

// Event listeners
function setupEventListeners() {
  console.log('Setting up event listeners...');
  
  // Setup thumbnail clicks
  thumbs.forEach(thumb => {
    thumb.addEventListener('click', () => {
      console.log('Thumb clicked');
      openModal(thumb);
    });
  });

  // Setup close button
  closeBtn.addEventListener('click', closeModal);
  
  // Setup navigation buttons awal
  findAndSetupNavButtons();
  
  // Close modal when clicking outside
  modal.addEventListener('click', (e) => {
    console.log('Modal clicked, target:', e.target.className);
    
    // Check if click is on nav button
    if (e.target.classList.contains('nav-btn') || 
        e.target.closest('.nav-btn') ||
        e.target.classList.contains('prev-btn') ||
        e.target.classList.contains('next-btn') ||
        e.target.closest('.prev-btn') ||
        e.target.closest('.next-btn')) {
      console.log('Clicked on nav button, not closing');
      return;
    }
    
    const isClickOnModalBackground = 
      e.target.classList.contains('modal') || 
      e.target.classList.contains('modal-content-wrapper');
  
    const isClickOnImageArea = 
      e.target.closest('.modal-image-container') ||
      e.target.closest('.modal-content') ||
      e.target.closest('.close-btn');
  
    if (!isClickOnImageArea) {
      console.log('Closing modal via background click');
      closeModal();
    }
  });

  // Block zoom
  blockImageZoom();

  // Add keyboard navigation
  document.addEventListener('keydown', handleKeyboardNavigation);

  // Add touch swipe for mobile
  setupTouchSwipe();

  window.addEventListener('mousemove', handleMouseMove);
  
  // Event delegation untuk tombol yang mungkin dibuat nanti
  document.addEventListener('click', function(e) {
    // Cek jika klik di tombol prev/next
    if (e.target.classList.contains('prev-btn') || 
        e.target.closest('.prev-btn') ||
        (e.target.tagName === 'IMG' && e.target.closest('.prev-btn'))) {
      console.log('Prev button clicked via event delegation');
      handlePrevClick(e);
    }
    
    if (e.target.classList.contains('next-btn') || 
        e.target.closest('.next-btn') ||
        (e.target.tagName === 'IMG' && e.target.closest('.next-btn'))) {
      console.log('Next button clicked via event delegation');
      handleNextClick(e);
    }
  });
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM Content Loaded');
  initLoadingScreen();
  initImageArray();
  setupEventListeners();
  createCustomScrollbar();
  
  // Coba setup tombol beberapa kali untuk memastikan
  setTimeout(findAndSetupNavButtons, 1000);
});