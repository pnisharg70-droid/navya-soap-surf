const SUPABASE_URL = "https://ifoqkxtxhnlunrozlsoa.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_c6e4NR323YZdH0FwQ796Ag_QaeUsew2";
const ADMIN_EMAIL = "pnisharg70@gmail.com";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const statusLabels = {
  new: "New",
  confirmed: "Confirmed",
  packing: "Packing",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const formatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const state = {
  orders: [],
  statusFilter: "all",
  search: "",
};

const loginPanel = document.querySelector("[data-login-panel]");
const resetPanel = document.querySelector("[data-reset-panel]");
const dashboard = document.querySelector("[data-dashboard]");
const authForm = document.querySelector("[data-auth-form]");
const passwordForm = document.querySelector("[data-password-form]");
const dashboardPasswordForm = document.querySelector("[data-dashboard-password-form]");
const authStatus = document.querySelector("[data-auth-status]");
const passwordStatus = document.querySelector("[data-password-status]");
const dashboardPasswordStatus = document.querySelector("[data-dashboard-password-status]");
const orderStatus = document.querySelector("[data-order-status]");
const ordersList = document.querySelector("[data-orders-list]");
const orderStats = document.querySelector("[data-order-stats]");
const signOutButton = document.querySelector("[data-sign-out]");
const refreshButton = document.querySelector("[data-refresh-orders]");
const statusFilter = document.querySelector("[data-status-filter]");
const searchInput = document.querySelector("[data-order-search]");

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(value) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function normalizedOrderText(order) {
  return [
    order.name,
    order.email,
    order.phone,
    order.city,
    order.address,
    order.requirement,
    order.status,
    ...(order.order_items || []).map((item) => `${item.name} ${item.category}`),
  ].join(" ").toLowerCase();
}

function filteredOrders() {
  return state.orders.filter((order) => {
    const matchesStatus = state.statusFilter === "all" || order.status === state.statusFilter;
    const matchesSearch = !state.search || normalizedOrderText(order).includes(state.search);
    return matchesStatus && matchesSearch;
  });
}

function orderSummary(order) {
  const items = order.order_items?.length
    ? order.order_items
        .map((item) => `- ${item.name} x ${item.quantity} (${formatter.format(item.subtotal || 0)})`)
        .join("\n")
    : "- Requirement only, no cart products selected";

  return [
    `Order #${order.id}`,
    `Customer: ${order.name}`,
    `Phone: ${order.phone}`,
    `Email: ${order.email}`,
    `City: ${order.city}`,
    `Address: ${order.address}`,
    `Status: ${statusLabels[order.status] || order.status}`,
    `Total: ${formatter.format(order.total_amount || 0)}`,
    "Items:",
    items,
    `Requirement: ${order.requirement || "None"}`,
    `Admin notes: ${order.admin_notes || "None"}`,
  ].join("\n");
}

function renderStats() {
  const statuses = ["new", "confirmed", "packing", "out_for_delivery", "delivered", "cancelled"];
  const counts = Object.fromEntries(statuses.map((status) => [status, 0]));
  state.orders.forEach((order) => {
    counts[order.status] = (counts[order.status] || 0) + 1;
  });

  orderStats.innerHTML = statuses
    .map((status) => `
      <article class="stat-card">
        <strong>${counts[status] || 0}</strong>
        <span>${statusLabels[status]}</span>
      </article>
    `)
    .join("");
}

function renderOrders() {
  renderStats();
  const orders = filteredOrders();

  if (!orders.length) {
    ordersList.innerHTML = '<div class="empty-orders">No orders match the current filter.</div>';
    return;
  }

  ordersList.innerHTML = orders
    .map((order) => {
      const items = order.order_items?.length
        ? order.order_items
            .map((item) => `
              <li>
                <span>${escapeHtml(item.name)} x ${escapeHtml(item.quantity)}</span>
                <strong>${formatter.format(item.subtotal || 0)}</strong>
              </li>
            `)
            .join("")
        : "<li><span>Requirement only</span><strong>No cart</strong></li>";

      return `
        <article class="order-card" data-order-card="${order.id}">
          <div class="order-main">
            <div>
              <div class="order-title">
                <div>
                  <h2>Order #${order.id} - ${escapeHtml(order.name)}</h2>
                  <p>${formatDate(order.created_at)}</p>
                </div>
                <span class="status-pill ${escapeHtml(order.status)}">${escapeHtml(statusLabels[order.status] || order.status)}</span>
              </div>

              <div class="order-meta">
                <div>
                  <strong>Contact</strong>
                  <p>${escapeHtml(order.phone)}</p>
                  <p>${escapeHtml(order.email)}</p>
                </div>
                <div>
                  <strong>Delivery</strong>
                  <p>${escapeHtml(order.city)}</p>
                  <p>${escapeHtml(order.address)}</p>
                </div>
                <div>
                  <strong>Total</strong>
                  <p>${formatter.format(order.total_amount || 0)}</p>
                </div>
                <div>
                  <strong>Updated</strong>
                  <p>${formatDate(order.updated_at)}</p>
                  <p>Delivered: ${formatDate(order.delivered_at)}</p>
                </div>
              </div>

              <div class="order-items">
                <strong>Items</strong>
                <ul>${items}</ul>
              </div>

              <div class="order-requirement">
                <strong>Customer requirement</strong>
                <p>${escapeHtml(order.requirement || "No extra requirement shared.")}</p>
              </div>

              <div class="order-contact">
                <a href="tel:${escapeHtml(order.phone)}">Call client</a>
                <a href="mailto:${escapeHtml(order.email)}">Email client</a>
                <button type="button" data-copy-order="${order.id}">Copy order</button>
              </div>
            </div>

            <form class="order-update" data-update-order="${order.id}">
              <label>
                Status
                <select name="status">
                  ${Object.entries(statusLabels)
                    .map(([value, label]) => `<option value="${value}" ${order.status === value ? "selected" : ""}>${label}</option>`)
                    .join("")}
                </select>
              </label>
              <label>
                Admin notes
                <textarea name="admin_notes" placeholder="Delivery notes, payment status, packing details...">${escapeHtml(order.admin_notes || "")}</textarea>
              </label>
              <div class="order-actions">
                <button class="btn primary" type="submit">Save</button>
                <button class="btn ghost" type="button" data-mark-delivered="${order.id}">Delivered</button>
              </div>
            </form>
          </div>
        </article>
      `;
    })
    .join("");
}

async function loadOrders() {
  orderStatus.textContent = "Loading orders...";
  const { data, error } = await supabaseClient
    .from("customer_orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    orderStatus.textContent = `Unable to load orders: ${error.message}`;
    return;
  }

  state.orders = data || [];
  orderStatus.textContent = `${state.orders.length} order${state.orders.length === 1 ? "" : "s"} loaded.`;
  renderOrders();
}

async function showDashboard() {
  loginPanel.classList.add("hidden");
  resetPanel.classList.add("hidden");
  dashboard.classList.remove("hidden");
  signOutButton.classList.remove("hidden");
  await loadOrders();
}

function showLogin(message = "") {
  dashboard.classList.add("hidden");
  resetPanel.classList.add("hidden");
  signOutButton.classList.add("hidden");
  loginPanel.classList.remove("hidden");
  authStatus.textContent = message;
}

function showPasswordReset(message = "") {
  loginPanel.classList.add("hidden");
  dashboard.classList.add("hidden");
  signOutButton.classList.add("hidden");
  resetPanel.classList.remove("hidden");
  passwordStatus.textContent = message;
}

async function checkSession() {
  const params = new URLSearchParams(window.location.hash.slice(1));
  if (params.get("type") === "recovery") {
    showPasswordReset("Enter your new password.");
    return;
  }

  const { data } = await supabaseClient.auth.getSession();
  const email = data.session?.user?.email;

  if (email === ADMIN_EMAIL) {
    await showDashboard();
  } else if (email) {
    await supabaseClient.auth.signOut();
    showLogin("This email is not approved for admin access.");
  } else {
    showLogin();
  }
}

authForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(authForm);
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (email !== ADMIN_EMAIL) {
    authStatus.textContent = `Use the approved admin email: ${ADMIN_EMAIL}`;
    return;
  }

  authStatus.textContent = "Signing in...";
  const { error } = await supabaseClient.auth.signInWithPassword({ email, password });

  if (error) {
    authStatus.textContent = error.message;
    return;
  }

  authForm.reset();
  await showDashboard();
});

document.querySelector("[data-auth-action='signup']").addEventListener("click", async () => {
  const formData = new FormData(authForm);
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (email !== ADMIN_EMAIL) {
    authStatus.textContent = `Use the approved admin email: ${ADMIN_EMAIL}`;
    return;
  }

  if (password.length < 6) {
    authStatus.textContent = "Password must be at least 6 characters.";
    return;
  }

  authStatus.textContent = "Creating admin account...";
  const { error } = await supabaseClient.auth.signUp({ email, password });
  authStatus.textContent = error
    ? error.message
    : "Admin account created. Confirm the email if Supabase asks, then sign in.";
});

document.querySelector("[data-auth-action='reset']").addEventListener("click", async () => {
  const formData = new FormData(authForm);
  const email = String(formData.get("email") || ADMIN_EMAIL).trim().toLowerCase();

  if (email !== ADMIN_EMAIL) {
    authStatus.textContent = `Use the approved admin email: ${ADMIN_EMAIL}`;
    return;
  }

  authStatus.textContent = "Sending password reset email...";
  const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}${window.location.pathname}`,
  });

  authStatus.textContent = error
    ? error.message
    : "Password reset email sent. Open the link, then set a new password.";
});

passwordForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(passwordForm);
  const password = String(formData.get("password") || "");

  if (password.length < 6) {
    passwordStatus.textContent = "Password must be at least 6 characters.";
    return;
  }

  passwordStatus.textContent = "Updating password...";
  const { error } = await supabaseClient.auth.updateUser({ password });

  if (error) {
    passwordStatus.textContent = error.message;
    return;
  }

  window.history.replaceState({}, document.title, window.location.pathname);
  passwordForm.reset();
  await showDashboard();
});

dashboardPasswordForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(dashboardPasswordForm);
  const password = String(formData.get("password") || "");

  if (password.length < 6) {
    dashboardPasswordStatus.textContent = "Password must be at least 6 characters.";
    return;
  }

  dashboardPasswordStatus.textContent = "Updating password...";
  const { error } = await supabaseClient.auth.updateUser({ password });

  if (error) {
    dashboardPasswordStatus.textContent = error.message;
    return;
  }

  dashboardPasswordForm.reset();
  dashboardPasswordStatus.textContent = "Password updated.";
});

signOutButton.addEventListener("click", async () => {
  await supabaseClient.auth.signOut();
  showLogin("Signed out.");
});

refreshButton.addEventListener("click", loadOrders);

statusFilter.addEventListener("change", () => {
  state.statusFilter = statusFilter.value;
  renderOrders();
});

searchInput.addEventListener("input", () => {
  state.search = searchInput.value.trim().toLowerCase();
  renderOrders();
});

ordersList.addEventListener("submit", async (event) => {
  const form = event.target.closest("[data-update-order]");
  if (!form) return;

  event.preventDefault();
  const id = Number(form.dataset.updateOrder);
  const formData = new FormData(form);
  orderStatus.textContent = `Saving order #${id}...`;

  const { error } = await supabaseClient
    .from("customer_orders")
    .update({
      status: formData.get("status"),
      admin_notes: formData.get("admin_notes"),
    })
    .eq("id", id);

  if (error) {
    orderStatus.textContent = `Unable to save order #${id}: ${error.message}`;
    return;
  }

  await loadOrders();
});

ordersList.addEventListener("click", async (event) => {
  const deliveredButton = event.target.closest("[data-mark-delivered]");
  const copyButton = event.target.closest("[data-copy-order]");

  if (deliveredButton) {
    const id = Number(deliveredButton.dataset.markDelivered);
    orderStatus.textContent = `Marking order #${id} as delivered...`;
    const { error } = await supabaseClient
      .from("customer_orders")
      .update({ status: "delivered" })
      .eq("id", id);

    if (error) {
      orderStatus.textContent = `Unable to mark delivered: ${error.message}`;
      return;
    }

    await loadOrders();
  }

  if (copyButton) {
    const order = state.orders.find((entry) => entry.id === Number(copyButton.dataset.copyOrder));
    if (!order) return;

    await navigator.clipboard.writeText(orderSummary(order));
    orderStatus.textContent = `Order #${order.id} copied.`;
  }
});

checkSession();
