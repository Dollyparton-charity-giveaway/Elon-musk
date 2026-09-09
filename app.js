// State Variables
let currentFundName = "Tesla Equity Fund";
let fundPrice = 244.05;

let tradeSymbol = "TSLA";
let tradeAction = "buy";
let assetPrices = { TSLA: 248.32, NVDA: 142.76, AAPL: 229.13 };

// Global Screen Switcher
window.switchView = function(viewId) {
  document.querySelectorAll('.page-view').forEach(v => v.classList.remove('active'));
  const target = document.getElementById(viewId);
  if (target) target.classList.add('active');

  // Highlight Sidebar
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.classList.remove('active');
    if (btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(viewId)) {
      btn.classList.add('active');
    }
  });
  window.scrollTo(0, 0);
};

// INVESTMENT FUND FLOW ROUTER
window.startFundFlow = function(fundName) {
  currentFundName = fundName;
  document.getElementById('fund-detail-name').innerText = fundName;
  document.getElementById('fund-review-target').innerText = fundName;
  switchView('fund-flow-details');
};

window.goToFundStep = function(step) {
  switchView(`fund-flow-${step}`);
};

window.setFundAmount = function(val) {
  document.getElementById('fund-amount-input').value = val;
  updateFundCalcs();
};

window.updateFundCalcs = function() {
  const amt = parseFloat(document.getElementById('fund-amount-input').value) || 0;
  const shares = (amt / fundPrice).toFixed(4);
  const estReturn = (amt * 0.1824).toFixed(2);

  document.getElementById('fund-calc-shares').innerText = shares;
  document.getElementById('fund-calc-return').innerText = `+$${estReturn}`;

  document.getElementById('fund-rev-amt').innerText = `$${amt.toFixed(2)}`;
  document.getElementById('fund-rev-sh').innerText = shares;
};

// TRADE FLOW ROUTER
window.startTradeFlow = function(symbol, action) {
  tradeSymbol = symbol || "TSLA";
  tradeAction = action || "buy";
  setTradeAction(tradeAction);
  switchView('trade-flow-details');
};

window.setTradeAction = function(action) {
  tradeAction = action;
  const isBuy = action === 'buy';
  const price = assetPrices[tradeSymbol] || 248.32;

  document.getElementById('trade-buy-btn').classList.toggle('active', isBuy);
  document.getElementById('trade-sell-btn').classList.toggle('active', !isBuy);

  document.getElementById('trade-flow-title').innerText = `${isBuy ? 'Buy' : 'Sell'} ${tradeSymbol}`;
  document.getElementById('trade-asset-sub').innerText = `${tradeSymbol} • $${price.toFixed(2)}`;
  
  document.getElementById('trade-rev-title').innerText = `Review ${isBuy ? 'Buy' : 'Sell'} Order`;
  document.getElementById('trade-rev-action').innerText = action.toUpperCase();
  document.getElementById('trade-rev-action').className = isBuy ? 'positive' : 'negative';
  document.getElementById('trade-confirm-btn').style.background = isBuy ? 'var(--accent-green)' : 'var(--accent-red)';
  
  updateTradeCalcs();
};

window.goToTradeStep = function(step) {
  switchView(`trade-flow-${step}`);
};

window.updateTradeCalcs = function() {
  const shares = parseInt(document.getElementById('trade-shares-input').value) || 0;
  const price = assetPrices[tradeSymbol] || 248.32;
  const total = (shares * price).toFixed(2);

  document.getElementById('trade-price-disp').innerText = `$${price.toFixed(2)}`;
  document.getElementById('trade-total-disp').innerText = `$${total}`;

  document.getElementById('trade-rev-shares').innerText = shares;
  document.getElementById('trade-rev-total').innerText = `$${total}`;

  document.getElementById('trade-succ-title').innerText = `${tradeAction === 'buy' ? 'Buy' : 'Sell'} Order Executed!`;
  document.getElementById('trade-succ-sub').innerText = `You ${tradeAction === 'buy' ? 'bought' : 'sold'} ${shares} shares of ${tradeSymbol}.`;
};

// Dashboard Quick Trade
let quickAction = 'buy';
window.setQuickTrade = function(action) {
  quickAction = action;
  document.getElementById('quick-buy-btn').classList.toggle('active', action === 'buy');
  document.getElementById('quick-sell-btn').classList.toggle('active', action === 'sell');
};

window.executeQuickTrade = function() {
  const symbol = document.getElementById('quick-asset-select').value;
  const shares = document.getElementById('quick-shares-input').value;
  startTradeFlow(symbol, quickAction);
  document.getElementById('trade-shares-input').value = shares;
  updateTradeCalcs();
};

// Chart Setup
document.addEventListener('DOMContentLoaded', () => {
  const ctx = document.getElementById('dashChart');
  if (ctx) {
    new Chart(ctx.getContext('2d'), {
      type: 'line',
      data: {
        labels: ['Aug 1', 'Aug 7', 'Aug 14', 'Aug 21', 'Aug 28'],
        datasets: [{
          data: [1.4, 1.6, 1.5, 1.9, 2.48],
          borderColor: '#10b981',
          borderWidth: 2,
          fill: false,
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: '#8a99ad' }, grid: { display: false } },
          y: { ticks: { color: '#8a99ad' }, grid: { color: '#162436' } }
        }
      }
    });
  }
});
