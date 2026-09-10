/* ==========================================================================
   STATE ENGINE & HARDCODED CONFIG
   ========================================================================== */

const SINGLE_CRYPTO_WALLET = "bc1qe3yfmcrj58zl6vh9rw39hr7xsvjgv5ywsc5qx0";
let currentUserEmail = null;

const liveMarketPrices = {
  'TSLA': 248.12,
  'SpaceX': 1248.75,
  'xAI': 12432.67,
  'Neuralink': 7.24,
  'Starlink': 18.76
};

const defaultAccounts = {
  'investor@x-capital.com': {
    name: 'Azeez',
    email: 'investor@x-capital.com',
    password: 'AZEEZOLUWASEYI123',
    availVal: 5000.00,
    holdings: [
      { assetId: 'TSLA', assetName: 'Tesla Inc. (TSLA)', shares: 10, buyPrice: 200.00, totalCost: 2000.00 }
    ],
    history: [
      { date: new Date().toLocaleString(), type: 'Admin Credit', details: 'Initial Deposit Credit', amount: 5000.00, status: 'Completed' }
    ]
  }
};

const pendingDeposits = [];
const pendingWithdrawals = [];

function getAccounts() {
  const stored = localStorage.getItem('x_capital_accounts');
  if (stored) return JSON.parse(stored);
  localStorage.setItem('x_capital_accounts', JSON.stringify(defaultAccounts));
  return defaultAccounts;
}

function saveAccounts(accs) {
  localStorage.setItem('x_capital_accounts', JSON.stringify(accs));
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

  if (type === 'register') {
    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim().toLowerCase();
    const pass = document.getElementById('reg-pass').value;

    if (accs[email]) {
      alert("⚠️ An account with this email already exists.");
      return;
    }

    accs[email] = {
      name: name,
      email: email,
      password: pass,
      availVal: 0.00,
      holdings: [],
      history: [
        { date: new Date().toLocaleString(), type: 'System', details: 'Account Created', amount: 0, status: 'Completed' }
      ]
    };

    saveAccounts(accs);
    currentUserEmail = email;
    document.getElementById('auth-modal-overlay').classList.add('hidden');
    document.getElementById('admin-nav-btn').classList.add('hidden');
    alert(`🎉 Account successfully created! Welcome, ${name}.`);
    refreshUI();
  } 
  else if (type === 'login') {
    const email = document.getElementById('login-email').value.trim().toLowerCase();
    const pass = document.getElementById('login-pass').value;

    if (email === 'admin@x-capital.com' && pass === 'AZEEZOLUWASEYI123') {
      currentUserEmail = 'ADMIN';
      document.getElementById('auth-modal-overlay').classList.add('hidden');
      document.getElementById('admin-nav-btn').classList.remove('hidden');
      openAdminPanel();
      return;
    }

    if (accs[email] && accs[email].password === pass) {
      currentUserEmail = email;
      document.getElementById('auth-modal-overlay').classList.add('hidden');
      document.getElementById('admin-nav-btn').classList.add('hidden');
      refreshUI();
    } else {
      alert("❌ Invalid credentials.");
    }
  }
};

window.logout = function() {
  currentUserEmail = null;
  document.getElementById('auth-modal-overlay').classList.remove('hidden');
  document.getElementById('admin-nav-btn').classList.add('hidden');
};

/* ==========================================================================
   UI SYNCHRONIZER & CALCULATIONS
   ========================================================================== */

function refreshUI() {
  if (!currentUserEmail || currentUserEmail === 'ADMIN') return;

  const accs = getAccounts();
  const user = accs[currentUserEmail];

  document.getElementById('display-user-name').innerText = user.name;
  document.getElementById('display-user-email').innerText = user.email;

  // Sync Settings Inputs
  if (document.getElementById('settings-name')) {
    document.getElementById('settings-name').value = user.name;
    document.getElementById('settings-email').value = user.email;
  }

  let totalHoldingsValue = 0;
  let totalCostBasis = 0;

  user.holdings.forEach(h => {
    const currentPrice = liveMarketPrices[h.assetId] || h.buyPrice;
    totalHoldingsValue += h.shares * currentPrice;
    totalCostBasis += h.totalCost;
  });

  const totalPortfolioVal = user.availVal + totalHoldingsValue;
  const unrealizedGain = totalHoldingsValue - totalCostBasis;
  const gainPct = totalCostBasis > 0 ? ((unrealizedGain / totalCostBasis) * 100).toFixed(2) : "0.00";

  document.getElementById('dash-total-val').innerText = `$${totalPortfolioVal.toFixed(2)}`;
  document.getElementById('dash-avail-val').innerText = `$${user.availVal.toFixed(2)}`;
  
  const gainEl = document.getElementById('dash-gain-val');
  gainEl.innerText = `${unrealizedGain >= 0 ? '+' : ''}$${unrealizedGain.toFixed(2)} (${gainPct}%)`;
  gainEl.className = unrealizedGain >= 0 ? 'val-hero txt-pos' : 'val-hero txt-neg';

  renderPortfolioTable(user);
  renderMarketsTable();
  renderTransactionsTable(user);
}

function renderPortfolioTable(user) {
  const tbody = document.getElementById('portfolio-table-body');
  tbody.innerHTML = '';

  if (user.holdings.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="lbl-muted">No open positions.</td></tr>';
    return;
  }

  user.holdings.forEach(h => {
    const currentPrice = liveMarketPrices[h.assetId] || h.buyPrice;
    const currentVal = h.shares * currentPrice;
    const gain = currentVal - h.totalCost;

    tbody.innerHTML += `
      <tr>
        <td><strong>${h.assetName}</strong></td>
        <td>${h.shares.toFixed(4)}</td>
        <td>$${h.buyPrice.toFixed(2)}</td>
        <td>$${currentPrice.toFixed(2)}</td>
        <td class="txt-pos">$${currentVal.toFixed(2)}</td>
        <td class="${gain >= 0 ? 'txt-pos' : 'txt-neg'}">${gain >= 0 ? '+' : ''}$${gain.toFixed(2)}</td>
      </tr>
    `;
  });
}

function renderMarketsTable() {
  const tbody = document.getElementById('markets-table-body');
  tbody.innerHTML = '';

  Object.keys(liveMarketPrices).forEach(asset => {
    tbody.innerHTML += `
      <tr>
        <td><strong>${asset}</strong></td>
        <td>$${liveMarketPrices[asset].toFixed(2)}</td>
        <td class="txt-pos">+2.45%</td>
        <td><button class="btn-primary" onclick="switchView('view-trade')">Trade</button></td>
      </tr>
    `;
  });
}

function renderTransactionsTable(user) {
  const tbody = document.getElementById('transactions-table-body');
  tbody.innerHTML = '';

  user.history.forEach(tx => {
    tbody.innerHTML += `
      <tr>
        <td><small>${tx.date}</small></td>
        <td><strong>${tx.type}</strong></td>
        <td>${tx.details}</td>
        <td class="${tx.amount >= 0 ? 'txt-pos' : 'txt-neg'}">$${Math.abs(tx.amount).toFixed(2)}</td>
        <td><span class="txt-pos">✓ ${tx.status}</span></td>
      </tr>
    `;
  });
}

/* ==========================================================================
   NAVIGATION & MODALS
   ========================================================================== */

window.switchView = function(viewId) {
  document.querySelectorAll('.page-view').forEach(v => v.classList.remove('active'));
  document.getElementById(viewId).classList.add('active');

  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.classList.remove('active');
    if (btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(viewId)) {
      btn.classList.add('active');
    }
  });
};

window.openModal = function(id) { document.getElementById(id).classList.remove('hidden'); };
window.closeModal = function(id) { document.getElementById(id).classList.add('hidden'); };

window.copyWalletAddress = function() {
  const input = document.getElementById('dep-wallet-address');
  navigator.clipboard.writeText(input.value);
  alert("Wallet address copied to clipboard!");
};

/* ==========================================================================
   TRANSACTIONS & TRADE ENGINE
   ========================================================================== */

window.executeTrade = function(assetId, assetName, amountUSD) {
  const accs = getAccounts();
  const user = accs[currentUserEmail];

  if (user.availVal < amountUSD) {
    alert("Insufficient cleared balance to complete this trade.");
    return;
  }

  const price = liveMarketPrices[assetId] || 100;
  const sharesBought = amountUSD / price;

  user.availVal -= amountUSD;

  const existing = user.holdings.find(h => h.assetId === assetId);
  if (existing) {
    existing.shares += sharesBought;
    existing.totalCost += amountUSD;
  } else {
    user.holdings.push({
      assetId: assetId,
      assetName: assetName,
      shares: sharesBought,
      buyPrice: price,
      totalCost: amountUSD
    });
  }

  user.history.unshift({
    date: new Date().toLocaleString(),
    type: 'Asset Purchase',
    details: `Bought ${sharesBought.toFixed(4)} units of ${assetName}`,
    amount: -amountUSD,
    status: 'Settled'
  });

  saveAccounts(accs);
  refreshUI();
  alert(`✓ Trade Executed!\nPurchased $${amountUSD.toFixed(2)} of ${assetName}.`);
};

window.executeQuickTrade = function() {
  const assetId = document.getElementById('q-asset-select').value;
  const amt = parseFloat(document.getElementById('q-amount-input').value) || 0;
  executeTrade(assetId, assetId, amt);
};

window.executeTradeViewOrder = function() {
  const assetId = document.getElementById('t-asset-select').value;
  const amt = parseFloat(document.getElementById('t-amount-input').value) || 0;
  executeTrade(assetId, assetId, amt);
};

window.investInFund = function(fundName, assetId, amt) {
  executeTrade(assetId, fundName, amt);
};

/* ==========================================================================
   DEPOSITS & WITHDRAWALS
   ========================================================================== */

window.submitDeposit = function() {
  const amt = parseFloat(document.getElementById('dep-amount').value) || 0;
  const asset = document.getElementById('dep-asset').value;
  const accs = getAccounts();
  const user = accs[currentUserEmail];

  if (amt <= 0) {
    alert("Please enter a valid deposit amount.");
    return;
  }

  pendingDeposits.push({
    email: user.email,
    name: user.name,
    asset: asset,
    amount: amt,
    submittedAt: new Date().toLocaleString()
  });

  user.history.unshift({
    date: new Date().toLocaleString(),
    type: 'Crypto Deposit',
    details: `${asset} Deposit Notification`,
    amount: amt,
    status: 'Awaiting Verification'
  });

  saveAccounts(accs);
  closeModal('deposit-modal');
  refreshUI();
  alert("✓ Payment details generated.\nYour account will be credited following verification.");
};

window.submitWithdrawal = function() {
  const amt = parseFloat(document.getElementById('with-amount').value) || 0;
  const addr = document.getElementById('with-address').value.trim();
  const accs = getAccounts();
  const user = accs[currentUserEmail];

  if (user.availVal < amt) {
    alert("Insufficient cleared balance for withdrawal.");
    return;
  }

  user.availVal -= amt;
  pendingWithdrawals.push({ email: user.email, address: addr, amount: amt });

  user.history.unshift({
    date: new Date().toLocaleString(),
    type: 'Withdrawal Request',
    details: `Transfer to ${addr.substring(0, 8)}...`,
    amount: -amt,
    status: 'Processing'
  });

  saveAccounts(accs);
  closeModal('withdraw-modal');
  refreshUI();
  alert(`💸 Withdrawal Request Submitted!\nAmount: $${amt.toFixed(2)}\nStatus: Pending Transfer.`);
};

/* ==========================================================================
   SETTINGS MODULE
   ========================================================================== */

window.updateProfile = function(e) {
  e.preventDefault();
  const accs = getAccounts();
  const newName = document.getElementById('settings-name').value.trim();
  if (newName && accs[currentUserEmail]) {
    accs[currentUserEmail].name = newName;
    saveAccounts(accs);
    refreshUI();
    alert("✓ Profile updated successfully.");
  }
};

window.updatePassword = function(e) {
  e.preventDefault();
  const accs = getAccounts();
  const oldPass = document.getElementById('settings-old-pass').value;
  const newPass = document.getElementById('settings-new-pass').value;
  const user = accs[currentUserEmail];

  if (user.password !== oldPass) {
    alert("❌ Current password does not match.");
    return;
  }

  user.password = newPass;
  saveAccounts(accs);
  document.getElementById('settings-old-pass').value = '';
  document.getElementById('settings-new-pass').value = '';
  alert("✓ Password updated successfully.");
};

/* ==========================================================================
   ADMIN CONTROLS & SIMULATION
   ========================================================================== */

window.openAdminPanel = function() {
  if (currentUserEmail !== 'ADMIN') {
    alert("⛔ Access Denied: Master Admin authorization required.");
    return;
  }
  populateAdminTables();
  openModal('admin-modal');
};

function populateAdminTables() {
  const depBody = document.getElementById('admin-pending-deposits-body');
  depBody.innerHTML = pendingDeposits.length === 0 ? '<tr><td colspan="6" class="lbl-muted">No pending deposits.</td></tr>' : '';

  pendingDeposits.forEach((req, idx) => {
    depBody.innerHTML += `
      <tr>
        <td>${req.name}</td>
        <td>${req.email}</td>
        <td>${req.asset}</td>
        <td class="txt-pos">$${req.amount.toFixed(2)}</td>
        <td><small>${req.submittedAt}</small></td>
        <td><button class="btn-primary" onclick="approveDeposit(${idx})">Approve & Credit</button></td>
      </tr>
    `;
  });
}

window.approveDeposit = function(idx) {
  const req = pendingDeposits[idx];
  const accs = getAccounts();

  if (accs[req.email]) {
    accs[req.email].availVal += req.amount;
    
    // Update matching transaction status to Completed
    const tx = accs[req.email].history.find(h => h.status === 'Awaiting Verification');
    if (tx) tx.status = 'Completed';

    saveAccounts(accs);
  }

  pendingDeposits.splice(idx, 1);
  populateAdminTables();
  refreshUI();
  alert(`✓ Approved $${req.amount.toFixed(2)} deposit for ${req.email}`);
};

window.adminDirectCredit = function() {
  const email = document.getElementById('admin-credit-email').value.trim().toLowerCase();
  const amt = parseFloat(document.getElementById('admin-credit-amt').value) || 0;
  const accs = getAccounts();

  if (accs[email]) {
    accs[email].availVal += amt;
    accs[email].history.unshift({
      date: new Date().toLocaleString(),
      type: 'Admin Direct Credit',
      details: 'Manual Balance Adjustment',
      amount: amt,
      status: 'Completed'
    });
    saveAccounts(accs);
    refreshUI();
    alert(`✓ Successfully credited $${amt.toFixed(2)} to ${email}`);
  } else {
    alert("User email not found.");
  }
};

window.triggerMarketSimulation = function(multiplier) {
  const asset = document.getElementById('admin-sim-asset').value;
  if (liveMarketPrices[asset]) {
    liveMarketPrices[asset] = liveMarketPrices[asset] * (1 + multiplier);
    refreshUI();
    alert(`📈 Simulation Engine Triggered!\n${asset} price adjusted by ${(multiplier * 100).toFixed(0)}%.`);
  }
};
