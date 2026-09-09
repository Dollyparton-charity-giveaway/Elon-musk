let quickAction = 'buy';
let tslaPrice = 187.45;

window.switchView = function(viewId) {
  document.querySelectorAll('.page-view').forEach(v => v.classList.remove('active'));
  const target = document.getElementById(viewId);
  if (target) target.classList.add('active');

  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.classList.remove('active');
    if (btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(viewId)) {
      btn.classList.add('active');
    }
  });
  window.scrollTo(0, 0);
};

window.setQAction = function(action) {
  quickAction = action;
  const buyBtn = document.getElementById('q-buy-btn');
  const sellBtn = document.getElementById('q-sell-btn');
  const submitBtn = document.getElementById('q-submit-btn');

  if (action === 'buy') {
    buyBtn.className = 'trade-btn active-buy';
    sellBtn.className = 'trade-btn';
    submitBtn.innerText = 'Buy TSLA';
    submitBtn.style.background = 'var(--c-green)';
  } else {
    buyBtn.className = 'trade-btn';
    sellBtn.className = 'trade-btn active-sell';
    submitBtn.innerText = 'Sell TSLA';
    submitBtn.style.background = 'var(--c-red)';
  }
};

window.setQAmt = function(val) {
  document.getElementById('q-amount').value = val;
  updateQuickCalcs();
};

function updateQuickCalcs() {
  const amt = parseFloat(document.getElementById('q-amount').value) || 0;
  const shares = (amt / tslaPrice).toFixed(2);
  document.getElementById('q-est-shares').innerText = shares;
  document.getElementById('q-est-total').innerText = `$${amt.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
}

window.execQuickTrade = function() {
  startTradeFlow('TSLA', quickAction);
};

window.startFundFlow = function(fundName) {
  document.getElementById('fund-detail-name').innerText = fundName;
  switchView('fund-flow-details');
};

window.goToFundStep = function(step) {
  switchView(`fund-flow-${step}`);
};

window.startTradeFlow = function(symbol, action) {
  document.getElementById('trade-flow-title').innerText = `${action === 'buy' ? 'Buy' : 'Sell'} ${symbol}`;
  switchView('trade-flow-details');
};

window.goToTradeStep = function(step) {
  switchView(`trade-flow-${step}`);
};

document.addEventListener('DOMContentLoaded', () => {
  const qAmtInput = document.getElementById('q-amount');
  if (qAmtInput) qAmtInput.addEventListener('input', updateQuickCalcs);

  // Line Chart Exact
  const ctx = document.getElementById('dashChartExact');
  if (ctx) {
    new Chart(ctx.getContext('2d'), {
      type: 'line',
      data: {
        labels: ['Aug 1', 'Aug 7', 'Aug 14', 'Aug 21', 'Aug 28'],
        datasets: [{
          data: [1.4, 1.6, 1.5, 1.9, 2.487],
          borderColor: '#10b981',
          borderWidth: 1.5,
          pointRadius: 0,
          fill: false,
          tension: 0.2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: '#64748b', font: { size: 8 } }, grid: { display: false } },
          y: { ticks: { color: '#64748b', font: { size: 8 } }, grid: { color: '#121f33' } }
        }
      }
    });
  }

  // Allocation Donut Chart
  const donutCtx = document.getElementById('allocDonut');
  if (donutCtx) {
    new Chart(donutCtx.getContext('2d'), {
      type: 'doughnut',
      data: {
        datasets: [{
          data: [34.2, 25.6, 20.3, 14.7, 5.2],
          backgroundColor: ['#e51937', '#3b82f6', '#10b981', '#8b5cf6', '#475569'],
          borderWidth: 0
        }]
      },
      options: {
        cutout: '75%',
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } }
      }
    });
  }
});
