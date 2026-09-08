document.addEventListener('DOMContentLoaded', () => {
  // 1. Chart Datasets by Timeframe
  const chartDatasets = {
    '1D': [2.42, 2.44, 2.43, 2.46, 2.48],
    '1W': [2.10, 2.25, 2.30, 2.38, 2.48],
    '1M': [1.40, 1.60, 1.50, 1.90, 2.48],
    '1Y': [0.80, 1.10, 1.40, 1.95, 2.48],
    'ALL': [0.20, 0.50, 1.10, 1.80, 2.48]
  };

  const chartLabels = {
    '1D': ['09:00', '11:00', '13:00', '15:00', '17:00'],
    '1W': ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    '1M': ['Aug 1', 'Aug 7', 'Aug 14', 'Aug 21', 'Aug 28'],
    '1Y': ['Q1', 'Q2', 'Q3', 'Q4', 'Q4 End'],
    'ALL': ['2022', '2023', '2024', '2025', '2026']
  };

  // Initialize Canvas Context
  const canvas = document.getElementById('performanceChart');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 200);
    gradient.addColorStop(0, 'rgba(16, 185, 129, 0.35)');
    gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');

    const chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: chartLabels['1M'],
        datasets: [{
          data: chartDatasets['1M'],
          borderColor: '#10b981',
          borderWidth: 2,
          fill: true,
          backgroundColor: gradient,
          tension: 0.4,
          pointRadius: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: '#162436' }, ticks: { color: '#8a99ad' } },
          y: { grid: { color: '#162436' }, ticks: { color: '#8a99ad', callback: val => '$' + val + 'M' } }
        }
      }
    });

    // Handle Timeframe Pill Clicks
    const pills = document.querySelectorAll('.pill');
    pills.forEach(pill => {
      pill.addEventListener('click', (e) => {
        pills.forEach(p => p.classList.remove('active'));
        e.target.classList.add('active');

        const range = e.target.textContent.trim();
        if (chartDatasets[range]) {
          chartInstance.data.labels = chartLabels[range];
          chartInstance.data.datasets[0].data = chartDatasets[range];
          chartInstance.update();
        }
      });
    });
  }

  // 2. Buy/Sell Tab Switcher
  const tradeTabs = document.querySelectorAll('.trade-tab');
  const tradeBtn = document.querySelector('.trade-box .btn-primary');

  tradeTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      tradeTabs.forEach(t => t.classList.remove('active'));
      e.target.classList.add('active');

      const mode = e.target.textContent.trim();
      if (mode === 'Sell') {
        tradeBtn.style.background = '#e51937';
        tradeBtn.textContent = 'Sell TSLA';
      } else {
        tradeBtn.style.background = '#10b981';
        tradeBtn.textContent = 'Buy TSLA';
      }
    });
  });

  // 3. Navigation Active State
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      navItems.forEach(n => n.classList.remove('active'));
      e.currentTarget.classList.add('active');
    });
  });
});
