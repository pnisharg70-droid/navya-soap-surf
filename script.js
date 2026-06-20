const products = [
  {
    id: "surf-fresh-500g",
    name: "Surf Excel Easy Wash 500 g",
    category: "surf",
    price: 79,
    description: "Surf Excel detergent powder for regular clothes, uniforms, and towels.",
    tags: ["Daily wash", "Fresh fragrance"],
    image: "https://fmcghouse.com/cdn/shop/files/SURFEXCELDETERGENTPOWDER500G.jpg?v=1746444676&width=900",
  },
  {
    id: "surf-fresh-1kg",
    name: "Surf Excel Easy Wash 1 kg",
    category: "surf",
    price: 149,
    description: "Value pack for clean everyday laundry with a bright, fresh finish.",
    tags: ["Family pack", "Bucket wash"],
    image: "https://fmcghouse.com/cdn/shop/files/SURFEXCELDETERGENTPOWDER1KKG.webp?v=1746444719&width=900",
  },
  {
    id: "surf-fresh-5kg",
    name: "Surf Excel Easy Wash 5 kg Saver",
    category: "surf",
    price: 649,
    description: "Large pack for families, hostels, shared homes, and repeat laundry use.",
    tags: ["Saver pack", "High value"],
    image: "https://fmcghouse.com/cdn/shop/files/Untitled_f200b3c4-4efb-4118-9119-6fde0e2166d6.png?v=1754395682&width=900",
  },
  {
    id: "blue-washing-soap",
    name: "Surf Excel Detergent Bar 150 g",
    category: "washing-soap",
    price: 45,
    description: "Surf Excel detergent bar for collars, cuffs, socks, and hand-wash stains.",
    tags: ["Laundry bar", "Stain rub"],
    image: "https://fmcghouse.com/cdn/shop/files/SURFEXCELDETERGENTBAR150G.webp?v=1746441457&width=900",
  },
  {
    id: "white-washing-soap-pack",
    name: "Surf Excel Detergent Bar Pack of 4",
    category: "washing-soap",
    price: 169,
    description: "Multipack Surf Excel bars for daily laundry and household cloth cleaning.",
    tags: ["Pack of 4", "Home care"],
    image: "https://fmcghouse.com/cdn/shop/files/SURFEXCELDETERGENTBAR4X200G.jpg?v=1746440092&width=900",
  },
  {
    id: "monthly-home-combo",
    name: "Surf Excel Monthly Combo",
    category: "combos",
    price: 799,
    description: "Surf Excel powder and detergent bars in one useful monthly laundry pack.",
    tags: ["Best seller", "Monthly pack"],
    image: "https://fmcghouse.com/cdn/shop/files/SURFEXCELDETERGENTPOWDER1KKG.webp?v=1746444719&width=900",
  },
  {
    id: "laundry-combo",
    name: "Surf Excel Laundry Combo",
    category: "combos",
    price: 399,
    description: "Surf Excel powder and detergent bar bundle for regular clothes and stain care.",
    tags: ["Laundry", "Combo"],
    image: "https://fmcghouse.com/cdn/shop/files/SURFEXCELDETERGENTBAR4X200G.jpg?v=1746440092&width=900",
  },
];

const SUPABASE_URL = "https://olhfskublgjvugmeqarc.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_R5r4TEKgibvhXi3DvJ7TJA_tpyyIz5L";
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
    orderStatus.textContent = "Add at least one product before sending an enquiry.";
    return;
  }

  closeCart();
});

document.querySelector(".contact-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const submitButton = form.querySelector("button[type='submit']");
  const formData = new FormData(form);
  const entries = cartEntries();

  if (!entries.length) {
    alert("Please add at least one surf or soap product before sending your order enquiry.");
    return;
  }

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
    if (!supabaseClient) {
      throw new Error("Supabase client is not configured.");
    }

    const { error } = await supabaseClient
      .from("customer_orders")
      .insert(payload);

    if (error) {
      throw error;
    }

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

renderProducts();
renderCart();
