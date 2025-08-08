const state = {
  inventory: [],
  cart: [],
  sales: [],
  debts: []
};

function findItem(barcode) {
  return state.inventory.find(i => i.barcode === barcode);
}

function addItem(e) {
  e.preventDefault();
  const barcode = document.getElementById('item-barcode').value.trim();
  const name = document.getElementById('item-name').value.trim();
  const qty = Number(document.getElementById('item-qty').value);
  const cost = Number(document.getElementById('item-cost').value);
  if (!barcode || !name || !qty || !cost) return;
  let item = findItem(barcode);
  const batchId = Date.now();
  if (!item) {
    item = { barcode, name, qty: 0, batches: [] };
    state.inventory.push(item);
  }
  item.qty += qty;
  item.batches.push({ id: batchId, cost, qty });
  renderInventory();
}

function renderInventory() {
  const ul = document.getElementById('inventory-list');
  ul.innerHTML = '';
  state.inventory.forEach(item => {
    const li = document.createElement('li');
    li.textContent = `${item.barcode} ${item.name} - ${item.qty}`;
    if (item.qty < 5) li.classList.add('low');
    ul.appendChild(li);
  });
}

function addSaleItem() {
  const barcode = document.getElementById('sale-barcode').value.trim();
  const qty = Number(document.getElementById('sale-qty').value) || 1;
  const item = findItem(barcode);
  if (!item || item.qty < qty) return alert('Not enough stock');
  state.cart.push({ barcode, qty });
  renderCart();
}

function renderCart() {
  const ul = document.getElementById('cart-list');
  ul.innerHTML = '';
  let total = 0;
  state.cart.forEach(line => {
    const item = findItem(line.barcode);
    const price = fifoCost(item, line.qty) * 1.3; // markup
    total += price;
    const li = document.createElement('li');
    li.textContent = `${item.name} x${line.qty} = ${price.toFixed(2)}`;
    ul.appendChild(li);
  });
  document.getElementById('sale-total').textContent = `Total: ${total.toFixed(2)}`;
  return total;
}

function fifoCost(item, qty) {
  let needed = qty;
  let cost = 0;
  for (const batch of item.batches) {
    const used = Math.min(needed, batch.qty);
    cost += used * batch.cost;
    needed -= used;
    if (needed === 0) break;
  }
  return cost / qty;
}

function completeSale() {
  const total = renderCart();
  if (!total) return;
  state.cart.forEach(line => {
    const item = findItem(line.barcode);
    let needed = line.qty;
    for (const batch of item.batches) {
      const used = Math.min(needed, batch.qty);
      batch.qty -= used;
      item.qty -= used;
      needed -= used;
    }
  });
  const sale = { date: new Date().toISOString(), items: state.cart.slice(), total };
  state.sales.push(sale);
  state.cart = [];
  renderInventory();
  renderCart();
  showPromptPay(total);
}

function showPromptPay(amount) {
  const pp = document.getElementById('promptpay');
  const promptId = '0000000000'; // replace with real PromptPay ID
  const url = `https://promptpay.io/${promptId}/${amount.toFixed(2)}.png`;
  pp.innerHTML = `<img src="${url}" alt="PromptPay QR">`;
}

function runReport() {
  const startVal = document.getElementById('report-start').value;
  const endVal = document.getElementById('report-end').value;
  const start = startVal ? new Date(startVal) : null;
  const end = endVal ? new Date(endVal) : null;
  const sales = state.sales.filter(s => {
    const d = new Date(s.date);
    return (!start || d >= start) && (!end || d <= end);
  });
  const total = sales.reduce((sum, s) => sum + s.total, 0);
  document.getElementById('report-output').textContent =
    `Sales: ${sales.length}\nTotal: ${total.toFixed(2)}`;
}

function addDebt(e) {
  e.preventDefault();
  const customer = document.getElementById('debt-customer').value.trim();
  const amount = Number(document.getElementById('debt-amount').value);
  if (!customer || !amount) return;
  state.debts.push({ customer, amount });
  renderDebts();
}

function renderDebts() {
  const ul = document.getElementById('debt-list');
  ul.innerHTML = '';
  state.debts.forEach(d => {
    const li = document.createElement('li');
    li.textContent = `${d.customer}: ${d.amount.toFixed(2)}`;
    ul.appendChild(li);
  });
}

function showView(id) {
  document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
}

document.addEventListener('DOMContentLoaded', () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js');
  }
  document.querySelectorAll('nav button').forEach(btn =>
    btn.addEventListener('click', () => showView(btn.dataset.view))
  );
  document.getElementById('add-item-form').addEventListener('submit', addItem);
  document.getElementById('add-sale-item').addEventListener('click', addSaleItem);
  document.getElementById('complete-sale').addEventListener('click', completeSale);
  document.getElementById('run-report').addEventListener('click', runReport);
  document.getElementById('debt-form').addEventListener('submit', addDebt);
});
