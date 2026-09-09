let currentAccountMode = 'Institutional VIP';
let pendingOrder = null;
let currentQuickAction = 'buy';

const accountData = {
  'Institutional VIP': {
    name: 'Institutional Investor',
    tier: 'VIP Access ▾',
    totalVal: '$2,487,523.16',
    gainVal: '+$276,982.41',
    availVal: '$502,316.78',
    totalNum: 2487523.16,
    availNum: 502316.78
  },
  'Personal Account': {
    name: 'Sarah Musk (Personal)',
    tier: 'Personal Account ▾',
    totalVal: '$25,400.00',
    gainVal: '+$3,210.50',
    availVal: '$4,150.00',
    totalNum: 25400.00,
    availNum: 4150.00
  }
};

window.switchAuthTab = function(tab) {
  document.getElementById('tab-login').classList.remove('active');
  document.getElementById('tab-register').classList.remove('active');
  document.getElementById('form-login').classList.add('hidden');
  document.getElementById('form-register').classList.add('hidden');

  if (tab === 'login') {
    document.getElementById('tab-login').classList.add('active');
    document.getElementById('form-login').classList.remove('hidden');
  } else {
    document.getElementById('tab-register').classList.add('active');
    document.getElementById('form-register').classList.remove('hidden');
  }
};

window.handleAuth = function(e, type) {
  e.preventDefault();
  if (type === 'register') {
    const name = document.getElementById('reg-name').value;
    const typeSelected = document.getElementById('reg-type').value;
    accountData['Personal Account'].name = name;
    changeAccountMode(typeSelected);
  }
  document.getElementById('auth-modal-overlay').classList.add('hidden');
};

window.logout = function() {
  document.getElementById('auth-modal-overlay').classList.remove('hidden');
};

window.changeAccountMode = function(mode) {
  currentAccountMode = mode;
  document.getElementById('user-account-type').value = mode;
  const data = accountData[mode];

  document.getElementById('display-user-name').innerText = data.name;
  document.getElementById('display-user-tier').innerText = data.tier;
  document.getElementById('dash-val-total').innerText = data.totalVal;
  document.getElementById('dash-val-gain').innerText = data.gainVal;
  document.getElementById('dash-val-avail').innerText = data.availVal;
  document.getElementById('dash-chart-val').innerText = data.totalVal;
  document.getElementById('port-val').innerText = data.totalVal;
  document.getElementById('port-gain').innerText = data.gainVal;
};

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
  currentQuickAction = action;
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
};

window.initiateQuickTrade = function() {
  const asset = document.getElementById('q-asset').value;
  const amt = parseFloat(document.getElementById('q-amount').value) || 1000;
  triggerOrder(asset === 'TSLA' ? 'Tesla Inc. (TSLA)' : asset, `Market ${currentQuickAction.toUpperCase()}`, 187.45, amt);
};

window.execTradePageOrder = function() {
  const asset = document.getElementById('t-asset-select').value;
  const amt = parseFloat(document.getElementById('t-amount').value) || 1000;
  triggerOrder(asset, 'Market Trade', 187.45, amt);
};

window.triggerOrder = function(assetName, orderType, price, amount) {
  const shares = (amount / price).toFixed(2);
  const data = accountData[currentAccountMode];

  pendingOrder = {
    assetName,
    orderType,
    price,
    amount,
    shares,
    txId: `#TSLA-2026-${Math.floor(10000 + Math.random() * 90000)}`
  };

  document.getElementById('modal-asset-name').innerText = assetName;
  document.getElementById('modal-order-type').innerText = orderType;
  document.getElementById('modal-unit-price').innerText = `$${price.toFixed(2)}`;
  document.getElementById('modal-share-cnt').innerText = `${shares} Units`;
  document.getElementById('modal-subtotal').innerText = `$${amount.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
  document.getElementById('modal-total-cost').innerText = `$${amount.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
  
  document.getElementById('modal-bal-before').innerText = data.availVal;
  const balAfterNum = data.availNum - amount;
  document.getElementById('modal-bal-after').innerText = `$${balAfterNum.toLocaleString('en-US', {minimumFractionDigits: 2})}`;

  document.getElementById('order-modal').classList.remove('hidden');
};

window.closeOrderModal = function() {
  document.getElementById('order-modal').classList.add('hidden');
};

window.executeOrder = function() {
  document.getElementById('order-modal').classList.add('hidden');

  document.getElementById('receipt-txid').innerText = pendingOrder.txId;
  document.getElementById('receipt-asset').innerText = pendingOrder.assetName;
  document.getElementById('receipt-amount').innerText = `$${pendingOrder.amount.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
  document.getElementById('receipt-units').innerText = `${pendingOrder.shares} Units`;

  document.getElementById('success-modal').classList.remove('hidden');
};

window.finishOrder = function(targetView) {
  document.getElementById('success-modal').classList.add('hidden');
  switchView(targetView === 'portfolio' ? 'view-portfolio' : 'view-dashboard');
};

window.openDepositModal = function() {
  alert('Deposit Gateway Initiated: Select Bank Wire, ACH, or Crypto Transfer in Settings.');
};

document.addEventListener('DOMContentLoaded', () => {
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
          borderWidth: 2,
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
          x: { ticks: { color: '#64748b' }, grid: { display: false } },
          y: { ticks: { color: '#64748b' }, grid: { color: '#121f33' } }
        }
      }
    });
  }

  // Fund Detail Chart
  const fundCtx = document.getElementById('fundDetailChart');
  if (fundCtx) {
    new Chart(fundCtx.getContext('2d'), {
      type: 'line',
      data: {
        labels: ['Jan', 'Mar', 'May', 'Jul', 'Sep'],
        datasets: [{
          data: [600, 680, 720, 790, 842.31],
          borderColor: '#e51937',
          borderWidth: 2,
          fill: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: '#64748b' } },
          y: { ticks: { color: '#64748b' } }
        }
      }
    });
  }

  // Asset Page Donut
  const assetCtx = document.getElementById('assetPageDonut');
  if (assetCtx) {
    new Chart(assetCtx.getContext('2d'), {
      type: 'doughnut',
      data: {
        datasets: [{
          data: [62.4, 26.8, 7.1, 3.7],
          backgroundColor: ['#e51937', '#3b82f6', '#10b981', '#8b5cf6'],
          borderWidth: 0
        }]
      },
      options: {
        cutout: '70%',
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } }
      }
    });
  }
});
