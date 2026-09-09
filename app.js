window.switchView = function(viewId) {
  const views = document.querySelectorAll('.page-view');
  views.forEach(view => view.classList.remove('active'));

  const targetView = document.getElementById(viewId);
  if (targetView) {
    targetView.classList.add('active');
  } else {
    document.getElementById('view-generic').classList.add('active');
  }

  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.classList.remove('active');
    if (item.getAttribute('data-target') === viewId) {
      item.classList.add('active');
    }
  });

  window.scrollTo(0, 0);
};

document.addEventListener('DOMContentLoaded', () => {
  // Sidebar Router Handlers
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      const targetId = e.currentTarget.getAttribute('data-target');
      window.switchView(targetId);
    });
  });

  // Invest Now to Fund Detail Screen
  document.querySelectorAll('.fund-invest-btn[data-fund="tesla"]').forEach(btn => {
    btn.addEventListener('click', () => {
      window.switchView('view-fund-detail');
      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    });
  });

  // Chart Helper Function
  const createLineChart = (canvasId, labels, data, color) => {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 150);
    gradient.addColorStop(0, color.replace('1)', '0.35)'));
    gradient.addColorStop(1, color.replace('1)', '0)'));

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          borderColor: color,
          borderWidth: 2,
          fill: true,
          backgroundColor: gradient,
          tension: 0.3,
          pointRadius: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#8a99ad', font: { size: 10 } } },
          y: { grid: { color: '#162436' }, ticks: { color: '#8a99ad', font: { size: 10 } } }
        }
      }
    });
  };

  // Render All Interactive Charts
  const chartLabels = ['Aug 1', 'Aug 7', 'Aug 14', 'Aug 21', 'Aug 28'];
  createLineChart('dashChart', chartLabels, [1.4, 1.6, 1.5, 1.9, 2.48], 'rgba(16, 185, 129, 1)');
  createLineChart('tslaMiniChart', chartLabels, [170, 175, 172, 180, 187], 'rgba(16, 185, 129, 1)');
  createLineChart('tradeChart', chartLabels, [170, 175, 172, 180, 187], 'rgba(16, 185, 129, 1)');
  createLineChart('portfolioChart', chartLabels, [1.4, 1.6, 1.5, 1.9, 2.48], 'rgba(16, 185, 129, 1)');
  createLineChart('teslaFundChart', ['Apr', 'May', 'Jun', 'Jul', 'Aug'], [700, 720, 780, 810, 842], 'rgba(16, 185, 129, 1)');
});
