
const thumbs = document.querySelectorAll('.thumb');
const modal = document.getElementById('preview-modal');
const modalImg = document.getElementById('preview-img');
const closeBtn = document.querySelector('.close-btn');

let customScrollbar, scrollbarTrack, scrollbarThumb;
let isDragging = false;
let modalTimeout;

document.addEventListener("contextmenu", e => e.preventDefault());

let BLINK = 200;
let SLIDE = 400;
let EASING = "cubic-bezier(0.4, 0, 0, 1)";

function initLoadingScreen() {
  const loadingScreen = document.getElementById('loading-screen');
  if (!loadingScreen) return;
  
  const loadingVideo = document.querySelector('.loading-video');
  if (loadingVideo && loadingVideo.tagName === 'VIDEO') {
    loadingVideo.play().catch(() => {
      const fallback = document.querySelector('.loading-fallback');
      if (fallback) {
        loadingVideo.style.display = 'none';
        fallback.style.display = 'block';
      }
    });
  }
  
  setTimeout(() => {
    loadingScreen.classList.add('fade-out');
    if (loadingVideo && loadingVideo.pause) loadingVideo.pause();
    
    setTimeout(() => {
      loadingScreen.style.display = 'none';
      initializeAnimations();
    }, 0);
  }, 10000);
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

function openModal(thumb) {
  const imgSrc = thumb.querySelector('img').src;
  modalImg.src = imgSrc;
  
  let orangeLayer = document.querySelector('.modal-orange-layer');
  if (!orangeLayer) {
    orangeLayer = document.createElement('div');
    orangeLayer.className = 'modal-orange-layer';
    modalImg.parentElement.insertBefore(orangeLayer, modalImg);
  }
  
  const container = document.querySelector('.modal-image-container');
  
  modal.classList.remove('active');
  modalImg.style.animation = 'none';
  modalImg.style.opacity = '0';
  modalImg.style.transform = 'translateY(30px)';
  orangeLayer.style.animation = 'none';
  orangeLayer.style.opacity = '0';
  orangeLayer.style.transform = 'translateY(30px)';
  closeBtn.style.opacity = '0';
  closeBtn.style.transform = 'translateY(10px)';
  
  container.style.width = 'auto';
  container.style.height = 'auto';
  
  modalImg.onload = function() {
    const imgRect = modalImg.getBoundingClientRect();
    container.style.width = imgRect.width + 'px';
    container.style.height = imgRect.height + 'px';
    
    void modal.offsetWidth;
    void orangeLayer.offsetWidth;
    
    modal.classList.add('active');
    
    modalImg.style.opacity = '1';
    
    orangeLayer.style.animation = `orangeClipBlink ${BLINK}ms ease-in-out forwards`;
    
    setTimeout(() => {
      modalImg.style.animation = `imageSlideUp ${SLIDE}ms ${EASING} forwards`;
      orangeLayer.style.animation = `imageSlideUp ${SLIDE}ms ${EASING} forwards`;
      
      setTimeout(() => {
        closeBtn.style.opacity = '1';
        closeBtn.style.transform = 'translateY(0)';
      }, SLIDE);
      
    }, BLINK);
  };
}

function closeModal() {
  const orangeLayer = document.querySelector('.modal-orange-layer');
  
  modalImg.style.animation = 'none';
  modalImg.style.opacity = '0';
  modalImg.style.transform = 'translateY(30px)';
  
  if (orangeLayer) {
    orangeLayer.style.animation = 'none';
    orangeLayer.style.opacity = '0';
    orangeLayer.style.transform = 'translateY(30px)';
  }
  
  closeBtn.style.opacity = '0';
  closeBtn.style.transform = 'translateY(10px)';
  
  modal.classList.remove('active');
}

function blockImageZoom() {
  if (!modalImg) return;
  
  const blockEvent = (e) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };
  
  modalImg.addEventListener('wheel', blockEvent, { passive: false });
  modalImg.addEventListener('mousewheel', blockEvent, { passive: false });
  modalImg.addEventListener('dblclick', blockEvent, { passive: false });
  modalImg.addEventListener('touchstart', blockEvent, { passive: false });
  modalImg.addEventListener('touchmove', blockEvent, { passive: false });
}

function createCustomScrollbar() {
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

function setupEventListeners() {
  thumbs.forEach(thumb => {
    thumb.addEventListener('click', () => openModal(thumb));
  });

  closeBtn.addEventListener('click', closeModal);
  
  modal.addEventListener('click', (e) => {
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

  blockImageZoom();

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  window.addEventListener('mousemove', handleMouseMove);
}

document.addEventListener('DOMContentLoaded', () => {
  initLoadingScreen();
  setupEventListeners();
  createCustomScrollbar();
});
