const products = [
  {
    id: "surf-excel-500g",
    name: "Surf Excel Easy Wash 500 g",
    category: "surf",
    price: 79,
    description: "Detergent powder for daily clothing, uniforms, towels, and regular bucket wash.",
    tags: ["Daily wash", "Fresh fragrance"],
    image: "https://fmcghouse.com/cdn/shop/files/SURFEXCELDETERGENTPOWDER500G.jpg?v=1746444676&width=900",
  },
  {
    id: "surf-excel-1kg",
    name: "Surf Excel Easy Wash 1 kg",
    category: "surf",
    price: 149,
    description: "Family-size detergent powder for cleaner, brighter everyday laundry loads.",
    tags: ["Family pack", "Value size"],
    image: "https://fmcghouse.com/cdn/shop/files/SURFEXCELDETERGENTPOWDER1KKG.webp?v=1746444719&width=900",
  },
  {
    id: "surf-excel-5kg",
    name: "Surf Excel 5 kg Saver Pack",
    category: "surf",
    price: 649,
    description: "Large detergent powder pack for families, hostels, offices, and repeat use.",
    tags: ["Bulk value", "High use"],
    image: "https://fmcghouse.com/cdn/shop/files/Untitled_f200b3c4-4efb-4118-9119-6fde0e2166d6.png?v=1754395682&width=900",
  },
  {
    id: "detergent-bar-150g",
    name: "Surf Excel Detergent Bar 150 g",
    category: "washing-soap",
    price: 45,
    description: "Laundry bar for collars, cuffs, socks, hand washing, and stain rubbing.",
    tags: ["Laundry bar", "Stain care"],
    image: "https://fmcghouse.com/cdn/shop/files/SURFEXCELDETERGENTBAR150G.webp?v=1746441457&width=900",
  },
  {
    id: "detergent-bar-pack",
    name: "Surf Excel Bar Pack of 4",
    category: "washing-soap",
    price: 169,
    description: "Multi-pack detergent bars for homes that wash clothes by hand regularly.",
    tags: ["Pack of 4", "Home care"],
    image: "https://fmcghouse.com/cdn/shop/files/SURFEXCELDETERGENTBAR4X200G.jpg?v=1746440092&width=900",
  },
  {
    id: "premium-bath-soap",
    name: "Premium Bath Soap Trio",
    category: "bath-soap",
    price: 135,
    description: "Gentle everyday bathing soaps with a clean fragrance for family bathrooms.",
    tags: ["Pack of 3", "Bath care"],
    image: "assets/premium-bath-soap-trio.jpeg",
  },
  {
    id: "classic-bath-soap",
    name: "Classic Family Bath Soap",
    category: "bath-soap",
    price: 49,
    description: "Single bath soap bar for daily freshness and simple family use.",
    tags: ["Daily use", "Fresh feel"],
    image: "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "dishwash-bar-pack",
    name: "Dishwash Bar Pack",
    category: "dishwash",
    price: 89,
    description: "Practical dishwash bars for utensils, lunch boxes, kitchen tools, and pans.",
    tags: ["Kitchen", "Pack value"],
    image: "assets/dishwash-bar-pack.jpeg",
  },
  {
    id: "starter-combo",
    name: "Starter Fresh Combo",
    category: "combos",
    price: 299,
    description: "A compact surf and soap pack for small homes or first-time orders.",
    tags: ["Starter", "Best trial"],
    image: "https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "monthly-home-combo",
    name: "Monthly Home Combo",
    category: "combos",
    price: 799,
    description: "Detergent powder, washing bars, bath soap, and dishwash bars in one monthly set.",
    tags: ["Best seller", "Monthly pack"],
    image: "https://fmcghouse.com/cdn/shop/files/SURFEXCELDETERGENTPOWDER1KKG.webp?v=1746444719&width=900",
  },
  {
    id: "bulk-refill-combo",
    name: "Bulk Refill Combo",
    category: "combos",
    price: 1499,
    description: "Higher quantity surf and soap bundle for shops, offices, hostels, and large homes.",
    tags: ["Bulk", "Custom support"],
    image: "https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?auto=format&fit=crop&w=900&q=80",
  },
];

const SUPABASE_URL = "https://ifoqkxtxhnlunrozlsoa.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_c6e4NR323YZdH0FwQ796Ag_QaeUsew2";
const supabaseClient = window.supabase
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)
  : null;

const formatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const state = {
  filter: "all",
  cart: new Map(),
};

const productGrid = document.querySelector("[data-product-grid]");
const cartDrawer = document.querySelector("[data-cart-drawer]");
const cartItems = document.querySelector("[data-cart-items]");
const cartEmpty = document.querySelector("[data-cart-empty]");
const cartTotal = document.querySelector("[data-cart-total]");
const cartCount = document.querySelector("[data-cart-count]");
const orderStatus = document.querySelector("[data-order-status]");
const scrim = document.querySelector("[data-scrim]");
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector("[data-nav-links]");

function renderProducts() {
  const visibleProducts = state.filter === "all"
    ? products
    : products.filter((product) => product.category === state.filter);

  productGrid.innerHTML = visibleProducts
    .map((product) => `
      <article class="product-card">
        <img src="${product.image}" alt="${product.name}" loading="lazy" />
        <div class="product-card-body">
          <div class="product-card-top">
            <h3>${product.name}</h3>
            <span class="price">${formatter.format(product.price)}</span>
          </div>
          <p>${product.description}</p>
          <div class="tag-row">
            ${product.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}
          </div>
          <button class="add-btn" type="button" data-add-product="${product.id}">Add product</button>
        </div>
      </article>
    `)
    .join("");
}

function cartEntries() {
  return [...state.cart.values()];
}

function renderCart() {
  const entries = cartEntries();
  const itemCount = entries.reduce((sum, entry) => sum + entry.quantity, 0);
  const total = entries.reduce((sum, entry) => sum + entry.product.price * entry.quantity, 0);

  cartCount.textContent = itemCount;
  cartTotal.textContent = formatter.format(total);
  cartEmpty.classList.toggle("visible", entries.length === 0);

  cartItems.innerHTML = entries
    .map(({ product, quantity }) => `
      <article class="cart-item">
        <div>
          <h3>${product.name}</h3>
          <p>${formatter.format(product.price)} x ${quantity}</p>
        </div>
        <div class="qty-controls" aria-label="Quantity controls for ${product.name}">
          <button type="button" data-decrease="${product.id}" aria-label="Decrease ${product.name}">-</button>
          <strong>${quantity}</strong>
          <button type="button" data-increase="${product.id}" aria-label="Increase ${product.name}">+</button>
        </div>
      </article>
    `)
    .join("");
}

function addProduct(id) {
  const product = products.find((entry) => entry.id === id);
  if (!product) return;

  const existing = state.cart.get(id);
  state.cart.set(id, {
    product,
    quantity: existing ? existing.quantity + 1 : 1,
  });
  orderStatus.textContent = "";
  renderCart();
  openCart();
}

function updateQuantity(id, delta) {
  const existing = state.cart.get(id);
  if (!existing) return;

  const nextQuantity = existing.quantity + delta;
  if (nextQuantity <= 0) {
    state.cart.delete(id);
  } else {
    state.cart.set(id, { ...existing, quantity: nextQuantity });
  }

  orderStatus.textContent = "";
  renderCart();
}

function openCart() {
  document.body.classList.add("cart-open");
  cartDrawer.classList.add("open");
  scrim.classList.add("open");
  cartDrawer.setAttribute("aria-hidden", "false");
}

function closeCart() {
  document.body.classList.remove("cart-open");
  cartDrawer.classList.remove("open");
  scrim.classList.remove("open");
  cartDrawer.setAttribute("aria-hidden", "true");
}

document.addEventListener("click", (event) => {
  const addButton = event.target.closest("[data-add-product]");
  const increaseButton = event.target.closest("[data-increase]");
  const decreaseButton = event.target.closest("[data-decrease]");
  const filterButton = event.target.closest("[data-filter]");

  if (addButton) {
    addProduct(addButton.dataset.addProduct);
  }

  if (increaseButton) {
    updateQuantity(increaseButton.dataset.increase, 1);
  }

  if (decreaseButton) {
    updateQuantity(decreaseButton.dataset.decrease, -1);
  }

  if (filterButton) {
    state.filter = filterButton.dataset.filter;
    document.querySelectorAll("[data-filter]").forEach((button) => {
      button.classList.toggle("active", button === filterButton);
    });
    renderProducts();
  }
});

document.querySelector("[data-open-cart]").addEventListener("click", openCart);
document.querySelector("[data-close-cart]").addEventListener("click", closeCart);
scrim.addEventListener("click", closeCart);

document.querySelector("[data-checkout]").addEventListener("click", (event) => {
  if (!state.cart.size) {
    event.preventDefault();
    orderStatus.textContent = "You can add products here or fill the enquiry form directly.";
    return;
  }

  closeCart();
});

async function saveOrder(payload) {
  if (supabaseClient) {
    const { error } = await supabaseClient
      .from("customer_orders")
      .insert(payload);

    if (error) {
      throw error;
    }

    return;
  }

  const response = await fetch(`${SUPABASE_URL}/rest/v1/customer_orders`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Supabase request failed with status ${response.status}`);
  }
}

document.querySelector(".contact-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const submitButton = form.querySelector("button[type='submit']");
  const formData = new FormData(form);
  const entries = cartEntries();

  const totalAmount = entries.reduce((sum, entry) => sum + entry.product.price * entry.quantity, 0);
  const payload = {
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    city: formData.get("city"),
    address: formData.get("address"),
    requirement: formData.get("message"),
    order_items: entries.map(({ product, quantity }) => ({
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price,
      quantity,
      subtotal: product.price * quantity,
    })),
    total_amount: totalAmount,
    source: "surf-soap-india-website",
  };

  submitButton.disabled = true;
  submitButton.textContent = "Sending...";

  try {
    await saveOrder(payload);
    form.reset();
    state.cart.clear();
    renderCart();
    alert("Thank you. Your surf and soap order enquiry has been saved. We will contact you soon.");
  } catch (error) {
    if (error.code === "PGRST205") {
      alert("Supabase table customer_orders is missing. Please run supabase/schema.sql in your Supabase SQL Editor.");
    } else {
      alert(`Unable to save order enquiry: ${error.message}`);
    }
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Send order enquiry";
  }
});

navToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

navLinks.addEventListener("click", (event) => {
  if (event.target.matches("a")) {
    navLinks.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeCart();
  }
});

renderProducts();
renderCart();
