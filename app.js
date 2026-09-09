let currentAccountMode = 'Personal Account';
let pendingOrder = null;
let currentQuickAction = 'buy';

// Zero-based database for registered users
const accountData = {
  'Personal Account': {
    name: 'Sister Johnson (Personal)',
    email: 'sister@family.com',
    tier: 'Personal Individual ▾',
    totalVal: 0.00,
    gainVal: 0.00,
    availVal: 0.00,
    holdings: []
  },
  'Institutional VIP': {
    name: 'Master Investor',
    email: 'admin@tesla-terminal.com',
    tier: 'Institutional VIP ▾',
    totalVal: 0.00,
    gainVal: 0.00,
    availVal: 0.00,
    holdings: []
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
    const email = document.getElementById('reg-email').value;
    const typeSelected = document.getElementById('reg-type').value;

    accountData['Personal Account'].name = name;
    accountData['Personal Account'].email = email;
    changeAccountMode(typeSelected);
  }
  document.getElementById('auth-modal-overlay').classList.add('hidden');
  refreshUI();
};

window.logout = function() {
  document.getElementById('auth-modal-overlay').classList.remove('hidden');
};

window.changeAccountMode = function(mode) {
  currentAccountMode = mode;
  document.getElementById('user-account-type').value = mode;
  refreshUI();
};

function refreshUI() {
  const data = accountData[currentAccountMode];

  document.getElementById('display-user-name').innerText = data.name;
  document.getElementById('display-user-tier').innerText = data.tier;
  document.getElementById('dash-val-total').innerText = `$${data.totalVal.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
  document.getElementById('dash-val-gain').innerText = `+$${data.gainVal.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
  document.getElementById('dash-val-avail').innerText = `$${data.availVal.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
  document.getElementById('dash-chart-val').innerText = `$${data.totalVal.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
  document.getElementById('port-val').innerText = `$${data.totalVal.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
  document.getElementById('port-gain').innerText = `+$${data.gainVal.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
}

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

window.openDepositModal = function() {
  const data = accountData[currentAccountMode];
  document.getElementById('dep-curr-bal').innerText = `$${data.availVal.toFixed(2)}`;
  document.getElementById('deposit-modal').classList.remove('hidden');
};

window.closeDepositModal = function() {
  document.getElementById('deposit-modal').classList.add('hidden');
};

window.processDeposit = function() {
  const amt = parseFloat(document.getElementById('deposit-amount-input').value) || 0;
  const method = document.getElementById('deposit-method').value;
  const data = accountData[currentAccountMode];

  data.availVal += amt;
  data.totalVal += amt;

  closeDepositModal();
  refreshUI();
  alert(`Deposit Request Submitted!\nAmount: $${amt.toFixed(2)} USD via ${method}.\nFunds have been credited to your available balance.`);
};

window.triggerOrder = function(assetName, orderType, price, amount) {
  const data = accountData[currentAccountMode];

  if (data.availVal < amount) {
    alert(`Insufficient Available Cash Balance ($${data.availVal.toFixed(2)} USD available).\nPlease click "+ Deposit USD" to add funds first.`);
    openDepositModal();
    return;
  }

  const shares = (amount / price).toFixed(2);
  pendingOrder = { assetName, orderType, price, amount, shares, txId: `#TSLA-2026-${Math.floor(10000 + Math.random() * 90000)}` };

  document.getElementById('modal-asset-name').innerText = assetName;
  document.getElementById('modal-order-type').innerText = orderType;
  document.getElementById('modal-unit-price').innerText = `$${price.toFixed(2)}`;
  document.getElementById('modal-share-cnt').innerText = `${shares} Units`;
  document.getElementById('modal-subtotal').innerText = `$${amount.toFixed(2)}`;
  document.getElementById('modal-total-cost').innerText = `$${amount.toFixed(2)}`;
  document.getElementById('modal-bal-before').innerText = `$${data.availVal.toFixed(2)}`;
  document.getElementById('modal-bal-after').innerText = `$${(data.availVal - amount).toFixed(2)}`;

  document.getElementById('order-modal').classList.remove('hidden');
};

window.closeOrderModal = function() {
  document.getElementById('order-modal').classList.add('hidden');
};

window.executeOrder = function() {
  const data = accountData[currentAccountMode];
  data.availVal -= pendingOrder.amount;
  data.holdings.push(pendingOrder);

  document.getElementById('order-modal').classList.add('hidden');
  document.getElementById('receipt-txid').innerText = pendingOrder.txId;
  document.getElementById('receipt-asset').innerText = pendingOrder.assetName;
  document.getElementById('receipt-amount').innerText = `$${pendingOrder.amount.toFixed(2)}`;
  document.getElementById('receipt-units').innerText = `${pendingOrder.shares} Units`;

  document.getElementById('success-modal').classList.remove('hidden');
  refreshUI();
};

window.finishOrder = function(targetView) {
  document.getElementById('success-modal').classList.add('hidden');
  switchView(targetView === 'portfolio' ? 'view-portfolio' : 'view-dashboard');
};

// Admin Controls
window.toggleAdminPanel = function() {
  const panel = document.getElementById('admin-modal');
  if (panel.classList.contains('hidden')) {
    populateAdminTable();
    panel.classList.remove('hidden');
  } else {
    panel.classList.add('hidden');
  }
};

function populateAdminTable() {
  const body = document.getElementById('admin-user-table');
  body.innerHTML = '';

  Object.keys(accountData).forEach(key => {
    const acc = accountData[key];
    body.innerHTML += `
      <tr>
        <td><strong>${acc.name}</strong></td>
        <td>${acc.email}</td>
        <td>${key}</td>
        <td class="txt-pos">$${acc.availVal.toFixed(2)}</td>
        <td><button class="btn-sm-green" onclick="quickCreditPrompt('${acc.email}')">+ Credit</button></td>
      </tr>
    `;
  });
}

window.quickCreditPrompt = function(email) {
  document.getElementById('admin-credit-email').value = email;
};

window.adminCreditUser = function() {
  const email = document.getElementById('admin-credit-email').value;
  const amt = parseFloat(document.getElementById('admin-credit-amount').value) || 0;

  let found = false;
  Object.keys(accountData).forEach(key => {
    if (accountData[key].email === email) {
      accountData[key].availVal += amt;
      accountData[key].totalVal += amt;
      found = true;
    }
  });

  if (found) {
    populateAdminTable();
    refreshUI();
    alert(`Successfully credited $${amt.toFixed(2)} USD to account ${email}`);
  } else {
    alert('User account email not found.');
  }
};

// Keybind shortcut for Admin (Ctrl + Shift + A)
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.shiftKey && e.key === 'A') {
    toggleAdminPanel();
  }
});

document.addEventListener('DOMContentLoaded', () => {
  refreshUI();

  const ctx = document.getElementById('dashChartExact');
  if (ctx) {
    new Chart(ctx.getContext('2d'), {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
        datasets: [{ data: [0, 0, 0, 0, 0], borderColor: '#10b981', borderWidth: 2, fill: false }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
  }
});
