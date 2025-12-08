// ================================================
// ===============  GALLERY SYSTEM  ===============
// ================================================

// Ambil elemen-elemen dasar
const modal = document.getElementById("preview-modal");
const modalBg = document.querySelector(".modal-bg-layer");
const closeBtn = document.querySelector(".close-btn");
const previewImg = document.getElementById("preview-img");

const thumbs = document.querySelectorAll(".thumb img");
const nextBtn = document.querySelector(".next-btn");
const prevBtn = document.querySelector(".prev-btn");

let currentIndex = 0;
let modalIsOpen = false;

// ============================================================
// =============   BACK BUTTON SYSTEM (HP)   ==================
// ============================================================

// Ketika modal dibuka → dorong 1 state ke history
function registerModalState() {
    if (!modalIsOpen) {
        history.pushState({ modalOpen: true }, "");
        modalIsOpen = true;
    }
}

// Ketika user menutup modal manual → panggil back()
function closeModalState() {
    if (modalIsOpen) {
        history.back();  // biar popstate yang nutup modal
    }
}

// Tombol HP Back
window.addEventListener("popstate", () => {
    if (modalIsOpen) {
        closeModal();
    }
});

// ============================================================
// ================   OPEN & CLOSE MODAL   ====================
// ============================================================

function openModal(index) {
    currentIndex = index;
    const src = thumbs[currentIndex].src;

    previewImg.src = src;

    modal.classList.add("active");
    modal.classList.add("show");

    registerModalState();
}

function closeModal() {
    modal.classList.remove("active");
    modal.classList.remove("show");

    modalIsOpen = false;
}

// ============================================================
// ======================  THUMBS   ===========================
// ============================================================

thumbs.forEach((thumb, index) => {
    thumb.addEventListener("click", () => {
        openModal(index);
    });
});

// ============================================================
// ================= CLOSE INTERACTIONS =======================
// ============================================================

// Klik background
modalBg.addEventListener("click", closeModalState);

// Tombol X
closeBtn.addEventListener("click", closeModalState);

// ============================================
// LOVE YOU KEYLA – modal now perfect 💅🔥
// ============================================

// ============================================
// FITUR TAMBAHAN DARI KODE KEDUA
// ============================================

// Elements tambahan
const thumbContainers = document.querySelectorAll('.thumb');
let customScrollbar, scrollbarTrack, scrollbarThumb;
let isDragging = false;
let isAnimating = false;
let allImages = [];
let resizeTimeout = null;

// Settings
const BLINK = 0;     // ms - blink duration
const SLIDE = 100;   // ms - slide duration  
const EASING = "cubic-bezier(0.9, 0, 0, 1)"; // easing
const CLOSE_DELAY = 0;

// Prevent right-click
document.addEventListener("contextmenu", e => e.preventDefault());

// Initialize loading screen
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

// Initialize image array
function initImageArray() {
  allImages = Array.from(thumbContainers).map(thumb => {
    const img = thumb.querySelector('img');
    return {
      src: img.src,
      element: thumb,
      title: img.alt || ''
    };
  });
}

// Initialize animations
function initializeAnimations() {
  const thumbPositions = Array.from(thumbContainers).map(thumb => {
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

// Mouse move effect
function handleMouseMove(e) {
  const mouseX = e.clientX;
  const mouseY = e.clientY;

  thumbContainers.forEach(thumb => {
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

// ============================================================
// ===================== FUNGSI BARU ==========================
// ============================================================

// Image change animation dengan 4 arah
function changeImageWithAnimation(newSrc, direction = 'up') {
  return new Promise((resolve) => {
    // Reset
    previewImg.style.width = 'auto';
    previewImg.style.height = 'auto';
    previewImg.style.maxWidth = '100%';
    previewImg.style.maxHeight = '100%';
    previewImg.style.position = 'static';
    previewImg.style.animation = 'none';
    previewImg.style.opacity = '0';
    
    // Set initial position berdasarkan direction
    switch(direction) {
      case 'up':
        previewImg.style.transform = 'translateY(30px)';
        break;
      case 'down':
        previewImg.style.transform = 'translateY(-30px)';
        break;
      case 'left':
        previewImg.style.transform = 'translateX(30px)';
        break;
      case 'right':
        previewImg.style.transform = 'translateX(-30px)';
        break;
      default:
        previewImg.style.transform = 'translateY(5px)';
    }
    
    // Define load handler
    const loadHandler = () => {
      // Reset ulang
      previewImg.style.width = 'auto';
      previewImg.style.height = 'auto';
      previewImg.style.maxWidth = '100%';
      previewImg.style.maxHeight = '100%';
      
      if (modal) void modal.offsetWidth; // Trigger reflow
      
      previewImg.style.opacity = '1';
      
      setTimeout(() => {
        // Pilih animasi berdasarkan direction
        let animationName = 'imageSlideUp';
        if (direction === 'down') animationName = 'imageSlideDown';
        if (direction === 'left') animationName = 'imageSlideLeft';
        if (direction === 'right') animationName = 'imageSlideRight';
        
        previewImg.style.animation = `${animationName} ${SLIDE}ms ${EASING} forwards`;
        
        setTimeout(() => {
          previewImg.style.animation = '';
          previewImg.style.transform = 'translate(0, 0)';
          
          // Cleanup
          previewImg.onload = null;
          previewImg.onerror = null;
          
          resolve();
        }, SLIDE);
      }, BLINK);
    };
    
    // Define error handler
    const errorHandler = () => {
      previewImg.style.opacity = '1';
      previewImg.style.transform = 'translate(0, 0)';
      resolve();
    };
    
    // Set event listeners BEFORE setting src
    previewImg.onload = loadHandler;
    previewImg.onerror = errorHandler;
    
    // Now set the source
    previewImg.src = newSrc;
    
    // If already loaded, trigger manually
    if (previewImg.complete && previewImg.naturalHeight > 0) {
      loadHandler();
    }
    
    // Fallback timeout
    setTimeout(() => {
      if (previewImg.src === newSrc && !previewImg.complete) {
        errorHandler();
      }
    }, 5000);
  });
}

// Next image dengan direction
async function nextImageWithDirection(direction = 'up') {
  if (!modal.classList.contains('active')) return;
  if (isAnimating) return;
  
  isAnimating = true;
  
  const nextIndex = (currentIndex + 1) % allImages.length;
  
  if (!allImages[nextIndex]) {
    isAnimating = false;
    return;
  }
  
  try {
    await changeImageWithAnimation(allImages[nextIndex].src, direction);
    currentIndex = nextIndex;
  } catch (error) {
    console.error('Error in nextImage:', error);
  } finally {
    isAnimating = false;
  }
}

// Previous image dengan direction
async function prevImageWithDirection(direction = 'down') {
  if (!modal.classList.contains('active')) return;
  if (isAnimating) return;
  
  isAnimating = true;
  
  const prevIndex = (currentIndex - 1 + allImages.length) % allImages.length;
  
  if (!allImages[prevIndex]) {
    isAnimating = false;
    return;
  }
  
  try {
    await changeImageWithAnimation(allImages[prevIndex].src, direction);
    currentIndex = prevIndex;
  } catch (error) {
    console.error('Error in prevImage:', error);
  } finally {
    isAnimating = false;
  }
}

// Open modal with specific index
function openModalWithIndex(index) {
  if (index < 0 || index >= allImages.length || isAnimating) return;
  
  isAnimating = true;
  currentIndex = index;
  const imgSrc = allImages[currentIndex].src;
  
  // Reset size
  previewImg.style.width = 'auto';
  previewImg.style.height = 'auto';
  previewImg.style.maxWidth = '100%';
  previewImg.style.maxHeight = '100%';
  previewImg.style.position = 'static';
  previewImg.style.transform = 'none';
  
  // Reset state
  modal.classList.remove('active');
  previewImg.style.animation = 'none';
  previewImg.style.opacity = '0';
  previewImg.style.transform = 'translateY(-5px)';
  
  // Cleanup previous listeners
  previewImg.onload = null;
  previewImg.onerror = null;
  
  // Define load handler
  const loadHandler = () => {
    // Reset ulang
    previewImg.style.width = 'auto';
    previewImg.style.height = 'auto';
    previewImg.style.maxWidth = '100%';
    previewImg.style.maxHeight = '100%';
    
    // Trigger reflow
    if (modal) void modal.offsetWidth;
    
    // Show modal
    modal.classList.add('active');
    modal.classList.add('show');
    previewImg.style.opacity = '1';
    
    // Register history state
    registerModalState();
    
    // Animate image
    setTimeout(() => {
      previewImg.style.animation = `imageSlideUp ${SLIDE}ms ${EASING} forwards`;
      
      setTimeout(() => {
        isAnimating = false;
      }, CLOSE_DELAY);
    }, BLINK);
  };
  
  // Define error handler
  const errorHandler = () => {
    modal.classList.add('active');
    modal.classList.add('show');
    previewImg.style.opacity = '1';
    previewImg.style.transform = 'translateY(0)';
    registerModalState();
    isAnimating = false;
  };
  
  // Set listeners BEFORE setting src
  previewImg.onload = loadHandler;
  previewImg.onerror = errorHandler;
  
  // Set image source
  previewImg.src = imgSrc;
  
  // If already loaded, trigger manually
  if (previewImg.complete && previewImg.naturalHeight > 0) {
    loadHandler();
  }
}

// Open modal from thumbnail
function openModalFromThumb(thumb) {
  const index = Array.from(thumbContainers).indexOf(thumb);
  if (index !== -1) {
    openModalWithIndex(index);
  }
}

// ============================================================
// ==================== NAVIGASI TOOLBAR ======================
// ============================================================

function findAndSetupNavButtons() {
  const existingPrevBtn = document.querySelector('.prev-btn');
  const existingNextBtn = document.querySelector('.next-btn');
  
  if (existingPrevBtn) {
    existingPrevBtn.removeEventListener('click', handlePrevClick);
    existingPrevBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Animasi tombol ke kiri
      existingPrevBtn.style.animation = 'buttonSwipeLeft 0.3s ease';
      setTimeout(() => existingPrevBtn.style.animation = '', 300);
      
      // Gambar animasi dari kiri
      prevImageWithDirection('left');
    });
  }
  
  if (existingNextBtn) {
    existingNextBtn.removeEventListener('click', handleNextClick);
    existingNextBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Animasi tombol ke kanan
      existingNextBtn.style.animation = 'buttonSwipeRight 0.3s ease';
      setTimeout(() => existingNextBtn.style.animation = '', 300);
      
      // Gambar animasi dari kanan
      nextImageWithDirection('right');
    });
  }
  
  // Tombol keyboard
  document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('active') || isAnimating) return;
    
    switch(e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        if (existingPrevBtn) {
          existingPrevBtn.style.animation = 'buttonSwipeLeft 0.3s ease';
          setTimeout(() => existingPrevBtn.style.animation = '', 300);
        }
        prevImageWithDirection('left');
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (existingNextBtn) {
          existingNextBtn.style.animation = 'buttonSwipeRight 0.3s ease';
          setTimeout(() => existingNextBtn.style.animation = '', 300);
        }
        nextImageWithDirection('right');
        break;
      case 'ArrowUp':
        e.preventDefault();
        nextImageWithDirection('up');
        break;
      case 'ArrowDown':
        e.preventDefault();
        prevImageWithDirection('down');
        break;
      case 'Escape':
        closeModalState();
        break;
    }
  });
}

// ============================================================
// ==================== SWIPE ATAS-BAWAH ======================
// ============================================================

function setupTouchSwipe() {
  let touchStartY = 0;
  let touchEndY = 0;
  const SWIPE_THRESHOLD = 50;
  
  modal.addEventListener('touchstart', (e) => {
    if (!modal.classList.contains('active') || isAnimating) return;
    
    touchStartY = e.changedTouches[0].screenY;
  }, { passive: true });
  
  modal.addEventListener('touchend', (e) => {
    if (!modal.classList.contains('active') || isAnimating) return;
    
    touchEndY = e.changedTouches[0].screenY;
    const diffY = touchStartY - touchEndY;
    
    if (Math.abs(diffY) > SWIPE_THRESHOLD) {
      if (diffY > 0) {
        // Swipe UP → NEXT (animasi dari bawah)
        nextImageWithDirection('up');
      } else {
        // Swipe DOWN → PREV (animasi dari atas)
        prevImageWithDirection('down');
      }
    }
  }, { passive: true });
}

// ============================================================
// ==================== FITUR LAINNYA =========================
// ============================================================

// IMPROVED zoom blocking
function setupZoomPrevention() {
  if (!previewImg || !modal) return;
  
  const preventZoomShortcuts = (e) => {
    if (!modal.classList.contains('active')) return;
    
    if (e.ctrlKey && (e.key === '+' || e.key === '-' || e.key === '=' || e.key === '0')) {
      e.preventDefault();
      return false;
    }
  };
  
  document.addEventListener('keydown', preventZoomShortcuts);
  
  let lastTouchTime = 0;
  modal.addEventListener('touchend', (e) => {
    if (!modal.classList.contains('active')) return;
    
    const currentTime = new Date().getTime();
    const timeDiff = currentTime - lastTouchTime;
    
    if (timeDiff < 300 && timeDiff > 0) {
      e.preventDefault();
    }
    
    lastTouchTime = currentTime;
  }, { passive: false });
}

// Create custom scrollbar
function createCustomScrollbar() {
  if (window.innerWidth <= 768) {
    return;
  }

  if (document.querySelector('.custom-scrollbar')) return;
  
  const container = document.querySelector('.gallery-container');
  const mobileHeader = document.querySelector('.mobile-header');
  
  if (!container) return;
  
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
    
    const scrollPercentage = (container.scrollTop / (scrollHeight - clientHeight)) * 100;
    const thumbHeight = Math.max(50, (clientHeight / scrollHeight) * 100);
    
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
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      setScrollbarPosition();
      updateScrollbar();
    }, 100);
  });
  
  window.addEventListener('scroll', () => {
    setScrollbarPosition();
  });
}

// Cleanup function
function cleanupEventListeners() {
  window.removeEventListener('resize', () => {});
  document.removeEventListener('keydown', handleKeyboardNavigation);
  window.removeEventListener('mousemove', handleMouseMove);
}

// Setup event listeners
function setupAdditionalEventListeners() {
  thumbContainers.forEach(thumb => {
    thumb.addEventListener('click', () => {
      openModalFromThumb(thumb);
    });
  });
  
  findAndSetupNavButtons();
  
  modal.addEventListener('click', (e) => {
    const isClickOnImage = 
      e.target.closest('.modal-image-container') ||
      e.target.id === 'preview-img' ||
      e.target.closest('.modal-card');
    
    const isClickOnButton = 
      e.target.closest('.nav-btn') ||
      e.target.closest('.close-btn') ||
      e.target.classList.contains('nav-btn') ||
      e.target.classList.contains('close-btn');
    
    if (!isClickOnImage && !isClickOnButton) {
      closeModalState();
    }
  });

  setupZoomPrevention();
  setupTouchSwipe();
  window.addEventListener('mousemove', handleMouseMove);
  
  // Event delegation untuk tombol
  document.addEventListener('click', function(e) {
    if (e.target.closest('.prev-btn')) {
      const btn = e.target.closest('.prev-btn');
      btn.style.animation = 'buttonSwipeLeft 0.3s ease';
      setTimeout(() => btn.style.animation = '', 300);
      prevImageWithDirection('left');
    }
    
    if (e.target.closest('.next-btn')) {
      const btn = e.target.closest('.next-btn');
      btn.style.animation = 'buttonSwipeRight 0.3s ease';
      setTimeout(() => btn.style.animation = '', 300);
      nextImageWithDirection('right');
    }
  });
}

// ============================================================
// ==================== INITIALIZE ALL ========================
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  initLoadingScreen();
  initImageArray();
  setupAdditionalEventListeners();
  createCustomScrollbar();
  
  setTimeout(findAndSetupNavButtons, 100);
  
  window.addEventListener('beforeunload', cleanupEventListeners);
});