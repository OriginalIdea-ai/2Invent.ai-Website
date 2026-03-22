// Main application state
let uiTimeout = null;
let isUserActive = false;
let lastActivity = Date.now();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  setViewportHeight();
  window.addEventListener('resize', setViewportHeight);
  window.addEventListener('orientationchange', setViewportHeight);

  waitForImages().then(() => {
    initializeApp();
    setupEventListeners();
    startActivityMonitoring();
    truncateDescriptions();

    requestAnimationFrame(() => {
      forceLayoutRecalc();
      setTimeout(() => forceLayoutRecalc(), 100);
      setTimeout(() => forceLayoutRecalc(), 300);
    });
  });
});

window.addEventListener('load', () => {
  setTimeout(() => {
    setViewportHeight();
    forceLayoutRecalc();
  }, 100);
});

// Wait for all images to load
function waitForImages() {
  return new Promise((resolve) => {
    const images = document.querySelectorAll('img');
    if (images.length === 0) {
      resolve();
      return;
    }

    let loadedCount = 0;
    const totalImages = images.length;

    const imageLoaded = () => {
      loadedCount++;
      if (loadedCount === totalImages) {
        setTimeout(resolve, 50);
      }
    };

    images.forEach((img) => {
      if (img.complete) {
        imageLoaded();
      } else {
        img.addEventListener('load', imageLoaded, { once: true });
        img.addEventListener('error', imageLoaded, { once: true });
      }
    });

    setTimeout(() => {
      if (loadedCount < totalImages) {
        resolve();
      }
    }, 3000);
  });
}

// Force layout recalculation
function forceLayoutRecalc() {
  const logo = document.querySelector('.solution-logo');
  const card = document.querySelector('.solution-card.active');
  const container = document.querySelector('.solutions-container');

  if (logo && card && container) {
    logo.style.removeProperty('transform');
    logo.style.removeProperty('top');
    logo.style.removeProperty('left');

    void container.offsetHeight;
    void card.offsetHeight;
    void logo.offsetHeight;
  }
}

// Set viewport height for iOS Safari
function setViewportHeight() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);

  const liquidCard = document.querySelector('.liquid-card');
  if (liquidCard) {
    liquidCard.style.height = '';
    void liquidCard.offsetHeight;
    liquidCard.style.height = '100vh';
    liquidCard.style.height = '100dvh';
  }

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      truncateDescriptions();
    });
  });

  requestAnimationFrame(() => {
    requestAnimationFrame(forceLayoutRecalc);
  });
}

// Initialize application
function initializeApp() {
  document.body.classList.remove('show-ui');
  setupResizeObserver();
}

// Set up ResizeObserver
function setupResizeObserver() {
  const container = document.querySelector('.solutions-container');
  const logo = document.querySelector('.solution-logo');

  if (container && logo && window.ResizeObserver) {
    const observer = new ResizeObserver(() => {
      clearTimeout(window.logoRecalcTimeout);
      window.logoRecalcTimeout = setTimeout(() => {
        forceLayoutRecalc();
      }, 50);
    });

    observer.observe(container);
    observer.observe(document.body);
    observer.observe(logo);
  }
}

// Setup event listeners
function setupEventListeners() {
  const activityEvents = ['mousemove', 'mousedown', 'touchstart', 'touchmove', 'scroll', 'keypress'];
  activityEvents.forEach(event => {
    document.addEventListener(event, handleUserActivity, { passive: true });
  });
}

// Handle user activity
function handleUserActivity() {
  lastActivity = Date.now();

  if (!isUserActive) {
    showUI();
  }

  clearTimeout(uiTimeout);
  uiTimeout = setTimeout(() => {
    hideUI();
  }, 10000);
}

// Show UI elements
function showUI() {
  isUserActive = true;
  document.body.classList.add('show-ui');
  truncateDescriptions();
}

// Hide UI elements
function hideUI() {
  isUserActive = false;
  document.body.classList.remove('show-ui');
}

// Monitor activity and auto-hide
function startActivityMonitoring() {
  setInterval(() => {
    const timeSinceActivity = Date.now() - lastActivity;
    if (isUserActive && timeSinceActivity > 10000) {
      hideUI();
    }
  }, 1000);
}

// Truncate descriptions
function truncateDescriptions() {
  document.querySelectorAll('.description-wrapper').forEach(wrapper => {
    const desc = wrapper.querySelector('.solution-description');
    const seeMore = wrapper.querySelector('.see-more');
    if (!desc || !seeMore) return;
    if (wrapper.classList.contains('expanded')) return;

    if (!desc.getAttribute('data-truncated')) {
      desc.setAttribute('data-truncated', desc.innerHTML);
    }
  });
}

// Toggle expand/collapse for descriptions
function toggleExpand(element) {
  const wrapper = element.closest('.description-wrapper');
  if (!wrapper) return;

  const description = wrapper.querySelector('.solution-description');
  const seeMore = wrapper.querySelector('.see-more');
  if (!description || !seeMore) return;

  const isExpanded = wrapper.classList.contains('expanded');

  if (isExpanded) {
    wrapper.classList.remove('expanded');
    const truncatedText = description.getAttribute('data-truncated');
    if (truncatedText) {
      description.innerHTML = truncatedText;
    }
    seeMore.textContent = '... more';
  } else {
    const currentText = description.innerHTML;
    description.setAttribute('data-truncated', currentText);
    wrapper.classList.add('expanded');

    let fullText = description.getAttribute('data-full-text');
    if (!fullText || fullText.trim().length === 0) return;

    const formattedText = fullText
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n/g, '<br>')
      .replace(/^• /gm, '• ');
    description.innerHTML = formattedText;
    seeMore.textContent = '... less';
    description.offsetHeight;
  }
}

// Add animation keyframes
const style = document.createElement('style');
style.textContent = `
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
document.head.appendChild(style);
