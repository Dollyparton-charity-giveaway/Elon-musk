// Function attached to the global window to allow HTML onclick="" attributes to trigger it
window.switchView = function(viewId) {
  // 1. Hide all pages
  const views = document.querySelectorAll('.page-view');
  views.forEach(view => view.classList.remove('active'));

  // 2. Show target page
  const targetView = document.getElementById(viewId);
  if (targetView) {
    targetView.classList.add('active');
  }

  // 3. Update sidebar active states based on what view is open
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.classList.remove('active');
    if (item.getAttribute('data-target') === viewId) {
      item.classList.add('active');
    }
  });

  // Scroll to top upon switching views
  window.scrollTo(0, 0);
};

document.addEventListener('DOMContentLoaded', () => {
  // Sidebar Click Listeners
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      const targetId = e.currentTarget.getAttribute('data-target');
      window.switchView(targetId);
    });
  });

  // Trade Tab Logic (Buy/Sell colors)
  const tradeTabs = document.querySelectorAll('.trade-tab');
  const reviewBtn = document.querySelector('.trade-box .btn-primary');
  
  if (tradeTabs.length > 0 && reviewBtn) {
    tradeTabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        tradeTabs.forEach(t => t.classList.remove('active'));
        e.target.classList.add('active');
        
        if (e.target.textContent === 'Sell') {
          reviewBtn.style.background = 'var(--accent-red)';
        } else {
          reviewBtn.style.background = 'var(--accent-green)';
        }
      });
    });
  }

  // Click listener specifically for the Tesla Fund 'Invest Now' button to open View 8
  const teslaInvestBtn = document.querySelector('.fund-invest-btn[data-fund="tesla"]');
  if (teslaInvestBtn) {
    teslaInvestBtn.addEventListener('click', () => {
      window.switchView('view-fund-detail');
      
      // Clear sidebar active states because we are in a sub-view
      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    });
  }
});
