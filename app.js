/* ==========================================================================
   CONFIGURABLE MASTER ADMIN & CRYPTO WALLET SETTINGS
   ========================================================================== */

// Master Admin login credentials
const MASTER_ADMIN_EMAIL = "admin@tesla-terminal.com";
const MASTER_ADMIN_PASSWORD = "AZEEZOLUWASEYI123"; 

// 👈 PASTE YOUR 1 REAL CRYPTO WALLET ADDRESS HERE BETWEEN THE QUOTES
const SINGLE_CRYPTO_WALLET = "bc1qe3yfmcrj58zl6vh9rw39hr7xsvjgv5ywsc5qx0"; 

/* ==========================================================================
   STATE & PERSISTENT STORAGE
   ========================================================================== */

let currentUserEmail = null;
const pendingDeposits = [];

// Default account with email tesla@family.com and password AZEEZOLUWASEYI123
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
   UI RENDERING
   ========================================================================== */

function refreshUI() {
  if (!currentUserEmail || currentUserEmail === 'ADMIN') return;

  const accs = getAccounts();
  const user = accs[currentUserEmail];

  document.getElementById('display-user-name').innerText = user.name;
  document.getElementById('display-user-tier').innerText = user.tier;
  document.getElementById('dash-val-total').innerText = `$${user.totalVal.toFixed(2)}`;
  document.getElementById('dash-val-avail').innerText = `$${user.availVal.toFixed(2)}`;
  
  document.getElementById('display-wallet-address').innerText = SINGLE_CRYPTO_WALLET;
}

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

/* ==========================================================================
   ADMIN CONTROLS
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
