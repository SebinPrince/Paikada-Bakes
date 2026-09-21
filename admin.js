const API_BASE = (window.location.hostname === 'localhost' && window.location.port !== '5000')
  ? 'http://localhost:5000/api'
  : '/api';

let allOrders = [];
let allCakes = [];
let currentFilter = 'all';
let currentSearch = '';

document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initModals();
  initSearchAndFilter();
  loadAllData();

  document.getElementById('refresh-btn').addEventListener('click', () => {
    loadAllData();
    showToast('Data refreshed!');
  });
});

// Toast notification helper
function showToast(msg) {
  const toast = document.getElementById('admin-toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// Tab Switching
function initTabs() {
  const tabs = document.querySelectorAll('.admin-tab');
  const contents = document.querySelectorAll('.tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      contents.forEach(c => c.classList.remove('active'));

      tab.classList.add('active');
      const targetId = `tab-${tab.getAttribute('data-tab')}`;
      const targetContent = document.getElementById(targetId);
      if (targetContent) {
        targetContent.classList.add('active');
      }
    });
  });
}

// Modal controls
function initModals() {
  const modal = document.getElementById('add-cake-modal');
  const openBtn = document.getElementById('add-cake-btn');
  const closeBtn = document.getElementById('close-cake-modal');
  const cancelBtn = document.getElementById('cancel-cake-btn');
  const form = document.getElementById('add-cake-form');

  const openModal = () => modal.classList.add('active');
  const closeModal = () => {
    modal.classList.remove('active');
    form.reset();
  };

  if (openBtn) openBtn.addEventListener('click', openModal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

  // Add Cake Form Submit
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const newCake = {
        name: document.getElementById('cake-name').value,
        price: document.getElementById('cake-price').value,
        category: document.getElementById('cake-category').value,
        image: document.getElementById('cake-image').value || 'images/chocolate_truffle_cake.jpg',
        desc: document.getElementById('cake-desc').value
      };

      try {
        const res = await fetch(`${API_BASE}/cakes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newCake)
        });

        const data = await res.json();
        if (data.success) {
          showToast(`Cake "${newCake.name}" added successfully!`);
          closeModal();
          loadCakes();
          loadStats();
        } else {
          alert(data.message || 'Failed to add cake.');
        }
      } catch (err) {
        console.error(err);
        alert('Error connecting to backend server.');
      }
    });
  }
}

// Search and Filter on Orders
function initSearchAndFilter() {
  const filterBtns = document.querySelectorAll('.status-filter');
  const searchInput = document.getElementById('order-search');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.getAttribute('data-status');
      renderOrders();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearch = e.target.value.toLowerCase();
      renderOrders();
    });
  }
}

// Fetch all data
async function loadAllData() {
  await Promise.all([
    loadStats(),
    loadOrders(),
    loadCakes(),
    loadInquiries()
  ]);
}

// Load Stats
async function loadStats() {
  try {
    const res = await fetch(`${API_BASE}/stats`);
    const data = await res.json();
    if (data.success) {
      const s = data.stats;
      document.getElementById('stat-total-orders').textContent = s.totalOrders;
      document.getElementById('stat-pending-orders').textContent = s.pendingOrders;
      document.getElementById('stat-baking-orders').textContent = s.bakingOrders;
      document.getElementById('stat-delivered-orders').textContent = s.deliveredOrders;
      document.getElementById('stat-total-cakes').textContent = s.totalCakes;
      document.getElementById('orders-badge').textContent = s.pendingOrders;
      document.getElementById('menu-count').textContent = s.totalCakes;
    }
  } catch (err) {
    console.error('Failed to load stats:', err);
  }
}

// Load Orders
async function loadOrders() {
  const tbody = document.getElementById('orders-table-body');
  try {
    const res = await fetch(`${API_BASE}/orders`);
    const data = await res.json();
    if (data.success) {
      allOrders = data.data;
      renderOrders();
    }
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" class="loading-state" style="color: red;">Failed to connect to backend server. Make sure node server.js is running.</td></tr>`;
  }
}

// Render Orders Table
function renderOrders() {
  const tbody = document.getElementById('orders-table-body');

  let filtered = allOrders.filter(order => {
    const matchesFilter = currentFilter === 'all' || order.status === currentFilter;
    const matchesSearch =
      !currentSearch ||
      order.customerName.toLowerCase().includes(currentSearch) ||
      order.phone.includes(currentSearch) ||
      order.orderId.toLowerCase().includes(currentSearch) ||
      order.cakeName.toLowerCase().includes(currentSearch);
    return matchesFilter && matchesSearch;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 30px; color: #7d6b64;">No orders found matching the filter.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(order => {
    const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });

    const cleanPhone = order.phone.replace(/[^0-9]/g, '');
    const waText = encodeURIComponent(`Hello ${order.customerName}, this is regarding your Paikada Bakes Order #${order.orderId} (${order.cakeName}).`);
    const waLink = `https://wa.me/${cleanPhone.startsWith('91') ? cleanPhone : '91' + cleanPhone}?text=${waText}`;

    return `
      <tr id="row-${order.id}">
        <td><span class="order-id-badge">${order.orderId}</span><br><small style="color: #999;">${orderDate}</small></td>
        <td class="customer-cell">
          <strong>${order.customerName}</strong>
          <span>${order.phone}</span>
        </td>
        <td class="cake-info-cell">
          <strong>${order.cakeName}</strong>
          <div>${order.weight} ${order.isEggless ? '<span class="eggless-tag">Eggless</span>' : ''}</div>
        </td>
        <td>
          <strong>${order.deliveryDate || 'Standard'}</strong><br>
          <small style="color: #666;">${order.deliveryType || 'Pickup'}: ${order.deliveryAddress || 'At bakery'}</small>
        </td>
        <td style="font-style: italic; max-width: 180px;">
          ${order.customMessage ? `"${order.customMessage}"` : '<span style="color:#aaa;">None</span>'}
        </td>
        <td>
          <select class="status-select ${order.status}" onchange="updateOrderStatus('${order.id}', this.value)">
            <option value="Pending" ${order.status === 'Pending' ? 'selected' : ''}>Pending</option>
            <option value="Baking" ${order.status === 'Baking' ? 'selected' : ''}>Baking</option>
            <option value="Ready" ${order.status === 'Ready' ? 'selected' : ''}>Ready</option>
            <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
            <option value="Cancelled" ${order.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
          </select>
        </td>
        <td>
          <div class="table-actions">
            <a href="${waLink}" target="_blank" class="btn-sm-whatsapp" title="WhatsApp Customer">
              Chat
            </a>
            <button class="btn-sm-delete" onclick="deleteOrder('${order.id}', '${order.orderId}')" title="Delete">
              &times;
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// Update Order Status via API
async function updateOrderStatus(id, newStatus) {
  try {
    const res = await fetch(`${API_BASE}/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });

    const data = await res.json();
    if (data.success) {
      showToast(`Order status updated to ${newStatus}`);
      // Update local array
      const order = allOrders.find(o => o.id === id);
      if (order) order.status = newStatus;
      loadStats();
      renderOrders();
    } else {
      alert('Failed to update status: ' + data.message);
    }
  } catch (err) {
    console.error(err);
    alert('Failed to connect to server.');
  }
}

// Delete Order via API
async function deleteOrder(id, orderId) {
  if (!confirm(`Are you sure you want to delete order ${orderId}?`)) return;

  try {
    const res = await fetch(`${API_BASE}/orders/${id}`, {
      method: 'DELETE'
    });
    const data = await res.json();
    if (data.success) {
      showToast(`Order ${orderId} deleted.`);
      allOrders = allOrders.filter(o => o.id !== id);
      loadStats();
      renderOrders();
    }
  } catch (err) {
    alert('Error deleting order.');
  }
}

// Load Cakes
async function loadCakes() {
  const container = document.getElementById('admin-cakes-grid');
  try {
    const res = await fetch(`${API_BASE}/cakes`);
    const data = await res.json();
    if (data.success) {
      allCakes = data.data;
      renderCakes();
    }
  } catch (err) {
    container.innerHTML = '<p style="color: red;">Failed to load cake catalog.</p>';
  }
}

// Render Cakes
function renderCakes() {
  const container = document.getElementById('admin-cakes-grid');
  container.innerHTML = allCakes.map(cake => {
    return `
      <div class="admin-cake-card" id="cake-${cake.id}">
        <img src="${cake.image}" alt="${cake.name}" class="admin-cake-img" onerror="this.onerror=null; this.src='images/chocolate_truffle_cake.jpg';">
        <div class="admin-cake-body">
          <div class="admin-cake-header">
            <h4 class="admin-cake-title">${cake.name}</h4>
            <span class="admin-cake-price">${cake.price}</span>
          </div>
          <div class="admin-cake-category">${cake.category}</div>
          <p class="admin-cake-desc">${cake.desc}</p>
          <div class="admin-cake-actions">
            <span style="font-size: 0.8rem; color: #4ade80; font-weight: 600;">● Active on website</span>
            <button class="btn-sm-delete" onclick="deleteCake('${cake.id}', '${cake.name}')">Delete</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Delete Cake via API
async function deleteCake(id, name) {
  if (!confirm(`Are you sure you want to delete "${name}" from the menu?`)) return;

  try {
    const res = await fetch(`${API_BASE}/cakes/${id}`, {
      method: 'DELETE'
    });
    const data = await res.json();
    if (data.success) {
      showToast(`"${name}" removed from menu.`);
      allCakes = allCakes.filter(c => c.id !== id);
      loadStats();
      renderCakes();
    }
  } catch (err) {
    alert('Error deleting cake.');
  }
}

// Load Inquiries
async function loadInquiries() {
  const tbody = document.getElementById('inquiries-table-body');
  try {
    const res = await fetch(`${API_BASE}/contact`);
    const data = await res.json();
    if (data.success && data.data.length > 0) {
      tbody.innerHTML = data.data.map(inq => {
        const dateStr = new Date(inq.createdAt).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit'
        });
        const contactInfo = inq.phone || inq.email;
        const waLink = inq.phone ? `https://wa.me/91${inq.phone.replace(/[^0-9]/g, '')}` : '#';

        return `
          <tr>
            <td>${dateStr}</td>
            <td><strong>${inq.name}</strong></td>
            <td>${contactInfo}</td>
            <td>${inq.message}</td>
            <td>
              ${inq.phone ? `<a href="${waLink}" target="_blank" class="btn-sm-whatsapp">Reply WhatsApp</a>` : ''}
            </td>
          </tr>
        `;
      }).join('');
    } else {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 25px; color: #888;">No inquiries received yet.</td></tr>`;
    }
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5" style="color: red; text-align: center;">Failed to load inquiries.</td></tr>`;
  }
}
