// Uniform Navigation Component
function renderNavigation() {
  const currentPath = window.location.pathname;
  const isLanding = currentPath === '/landing' || currentPath.includes('landing.html');
  const isIndex = currentPath === '/' || currentPath.includes('index.html');
  const isDashboard = currentPath.includes('dashboard.html');

  const navHTML = `
    <header class="uniform-nav">
      <div class="nav-container">
        <a href="/" class="nav-logo">🎥 Smart Camera</a>
        <nav class="nav-links">
          <a href="/" class="${isLanding ? 'active' : ''}">Home</a>
          <a href="/index.html" class="${isIndex ? 'active' : ''}">Camera</a>
          <a href="/dashboard.html" class="${isDashboard ? 'active' : ''}">Dashboard</a>
        </nav>
      </div>
    </header>
  `;

  // Insert navigation at the beginning of body
  document.body.insertAdjacentHTML('afterbegin', navHTML);
}

// Add navigation styles
function addNavigationStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .uniform-nav {
      background: rgba(0, 0, 0, 0.8);
      backdrop-filter: blur(10px);
      padding: 15px 20px;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .nav-container {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .nav-logo {
      color: white;
      font-size: 20px;
      font-weight: 700;
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .nav-links {
      display: flex;
      gap: 20px;
    }
    
    .nav-links a {
      color: rgba(255, 255, 255, 0.8);
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      padding: 8px 16px;
      border-radius: 20px;
      transition: all 0.3s ease;
    }
    
    .nav-links a:hover {
      color: white;
      background: rgba(103, 80, 164, 0.5);
    }
    
    .nav-links a.active {
      background: rgba(103, 80, 164, 0.8);
      color: white;
    }
    
    @media (max-width: 768px) {
      .nav-container {
        flex-direction: column;
        gap: 10px;
      }
      
      .nav-links {
        gap: 10px;
      }
    }
  `;
  document.head.appendChild(style);
  
  // Add margin to main content to prevent overlap
  const mainContent = document.querySelector('main, section, .camera-app');
  if (mainContent) {
    if (mainContent.classList.contains('camera-app')) {
      mainContent.style.top = '80px';
      mainContent.style.height = 'calc(100dvh - 80px)';
    } else {
      mainContent.style.marginTop = '80px';
    }
  }
  
  // Also add margin to top-bar specifically for camera app
  const topBar = document.querySelector('.top-bar');
  if (topBar) {
    topBar.style.marginTop = '10px';
  }
}

// Initialize navigation
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    addNavigationStyles();
    renderNavigation();
  });
} else {
  addNavigationStyles();
  renderNavigation();
}
