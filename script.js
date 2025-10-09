// Simple e-commerce frontend (no server) — uses localStorage for cart persistence

const PRODUCTS = [
  { id: 'p1', name: 'Canvas Tote Bag', price: 15.0, desc: 'Durable cotton tote.', img: 'https://placehold.co/400x300?text=Tote+Bag' },
  { id: 'p2', name: 'Leather Wallet', price: 29.99, desc: 'Slim bifold wallet.', img: 'https://placehold.co/400x300?text=Wallet' },
  { id: 'p3', name: 'Stainless Water Bottle', price: 19.5, desc: 'Keeps drinks cold.', img: 'https://placehold.co/400x300?text=Bottle' },
  { id: 'p4', name: 'Wireless Earbuds', price: 49.99, desc: 'Compact earbuds.', img: 'https://placehold.co/400x300?text=Earbuds' },
];

const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

// Cart helpers
function loadCart() {
  try {
    const raw = localStorage.getItem('shop_cart_v1');
    return raw ? JSON.parse(raw) : [];
  } catch (e) { return []; }
}
function saveCart(cart) {
  localStorage.setItem('shop_cart_v1', JSON.stringify(cart));
}
function calcSubtotal(cart) {
  return cart.reduce((s, it) => s + (Number(it.price) * Number(it.qty)), 0);
}

// Render products
function renderProducts() {
  const container = $('#products');
  const grid = document.createElement('div');
  grid.className = 'grid';
  PRODUCTS.forEach(p => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${p.img}" alt="${p.name}">
      <h4>${p.name}</h4>
      <p>${p.desc}</p>
      <div class="row">
        <div class="price">$${Number(p.price).toFixed(2)}</div>
        <button class="btn add-btn" data-id="${p.id}">Add to cart</button>
      </div>
    `;
    grid.appendChild(card);
  });
  container.innerHTML = '';
  container.appendChild(grid);

  // attach add handlers
  $$('.add-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      addToCart(id, 1);
    });
  });
}

// Cart UI
let cart = loadCart();
function updateCartCount() {
  const count = cart.reduce((s, it) => s + it.qty, 0);
  $('#cartCount').textContent = count;
}
function renderCartDrawer() {
  const itemsEl = $('#cartItems');
  itemsEl.innerHTML = '';
  if (cart.length === 0) {
    itemsEl.innerHTML = '<div style="color:#6b7280">Cart is empty</div>';
  } else {
    cart.forEach(it => {
      const div = document.createElement('div');
      div.className = 'cart-item';
      div.innerHTML = `
        <img src="${it.img}" alt="${it.name}">
        <div>
          <div style="font-weight:600">${it.name}</div>
          <div style="color:#6b7280;font-size:13px">$${Number(it.price).toFixed(2)}</div>
        </div>
        <div class="qty-controls">
          <button class="small dec" data-id="${it.id}">-</button>
          <div style="min-width:20px;text-align:center">${it.qty}</div>
          <button class="small inc" data-id="${it.id}">+</button>
          <button class="small remove" data-id="${it.id}">x</button>
        </div>
      `;
      itemsEl.appendChild(div);
    });
  }
  $('#subtotal').textContent = calcSubtotal(cart).toFixed(2);

  // attach cart buttons
  $$('.dec').forEach(b => b.addEventListener('click', () => {
    const id = b.dataset.id;
    changeQty(id, -1);
  }));
  $$('.inc').forEach(b => b.addEventListener('click', () => {
    const id = b.dataset.id;
    changeQty(id, +1);
  }));
  $$('.remove').forEach(b => b.addEventListener('click', () => {
    const id = b.dataset.id;
    removeFromCart(id);
  }));
}

// Cart operations
function addToCart(id, qty = 1) {
  const prod = PRODUCTS.find(p => p.id === id);
  if (!prod) return;
  const found = cart.find(it => it.id === id);
  if (found) found.qty = Number(found.qty) + Number(qty);
  else cart.push({ ...prod, qty: Number(qty) });
  saveCart(cart);
  updateCartCount();
  renderCartDrawer();
  openCart();
}
function changeQty(id, delta) {
  cart = cart.map(it => it.id === id ? { ...it, qty: Math.max(1, Number(it.qty) + delta) } : it);
  saveCart(cart);
  updateCartCount();
  renderCartDrawer();
}
function removeFromCart(id) {
  cart = cart.filter(it => it.id !== id);
  saveCart(cart);
  updateCartCount();
  renderCartDrawer();
}
function clearCart() {
  cart = [];
  saveCart(cart);
  updateCartCount();
  renderCartDrawer();
}

// UI open/close
function openCart() { $('#cartDrawer').classList.remove('hidden'); }
function closeCart() { $('#cartDrawer').classList.add('hidden'); }
function openCheckout() { $('#checkoutModal').classList.remove('hidden'); }
function closeCheckout() { $('#checkoutModal').classList.add('hidden'); }
function showThankYou() { $('#thankYou').classList.remove('hidden'); }
function hideThankYou() { $('#thankYou').classList.add('hidden'); }

// Bind buttons
function bindUI() {
  $('#openCartBtn').addEventListener('click', openCart);
  $('#closeCartBtn').addEventListener('click', closeCart);
  $('#continueBtn').addEventListener('click', closeCart);
  $('#checkoutBtn').addEventListener('click', () => { closeCart(); openCheckout(); });

  $('#cancelCheckout').addEventListener('click', () => { closeCheckout(); });
  $('#backToShop').addEventListener('click', () => {
    hideThankYou();
    // back to home
    window.location.hash = '#products';
  });

  // place order
  $('#checkoutForm').addEventListener('submit', (e) => {
    e.preventDefault();
    // simple validation already by required attributes
    // simulate API call
    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Placing order...';
    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Place Order';
      closeCheckout();
      clearCart();
      showThankYou();
    }, 1200);
  });
}

// initial render
renderProducts();
renderCartDrawer();
updateCartCount();
bindUI();
