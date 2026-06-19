const menuItems = [
  {
    id: "executive-thali",
    name: "Executive North Indian Thali",
    category: "meals",
    price: 355,
    description: "Paneer curry, dal makhani, jeera rice, roti, salad, pickle, and gulab jamun.",
    tags: ["Veg", "Office favourite"],
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "south-meal",
    name: "South Indian Meal Box",
    category: "meals",
    price: 219,
    description: "Sambar rice, curd rice, poriyal, appalam, chutney, and kesari.",
    tags: ["Veg", "Comfort"],
    image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "biryani",
    name: "Hyderabadi Dum Biryani",
    category: "mains",
    price: 289,
    description: "Aromatic basmati rice layered with spices, herbs, raita, and salan.",
    tags: ["Veg or Chicken", "Bulk order"],
    image: "https://images.unsplash.com/photo-1563379091339-03246963d4f6?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "paneer-tikka",
    name: "Paneer Tikka Masala",
    category: "mains",
    price: 239,
    description: "Charred paneer simmered in a rich tomato-cashew gravy.",
    tags: ["Veg", "Premium"],
    image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "dal-makhani",
    name: "Slow Cooked Dal Makhani",
    category: "mains",
    price: 189,
    description: "Black lentils cooked overnight with butter, cream, and roasted spices.",
    tags: ["Veg", "Classic"],
    image: "https://images.unsplash.com/photo-1626508035297-0cd27c397d67?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "butter-naan",
    name: "Butter Naan Basket",
    category: "breads",
    price: 119,
    description: "Soft tandoori naans brushed with butter and served warm.",
    tags: ["Veg", "Serves 2"],
    image: "https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "millet-roti",
    name: "Millet Roti Pack",
    category: "breads",
    price: 99,
    description: "Wholesome jowar and bajra rotis for lighter corporate meals.",
    tags: ["Healthy", "Veg"],
    image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "gulab-jamun",
    name: "Gulab Jamun",
    category: "desserts",
    price: 89,
    description: "Warm khoya dumplings in saffron-cardamom syrup.",
    tags: ["Dessert", "Popular"],
    image: "https://images.unsplash.com/photo-1605197183305-6d6c18101c07?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "rasmalai",
    name: "Rasmalai Cup",
    category: "desserts",
    price: 119,
    description: "Soft chenna discs in chilled saffron milk with pistachio.",
    tags: ["Dessert", "Premium"],
    image: "https://images.unsplash.com/photo-1625944525533-473f1a3d54e7?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "masala-chaas",
    name: "Masala Chaas",
    category: "drinks",
    price: 59,
    description: "Cooling buttermilk with roasted cumin, mint, and rock salt.",
    tags: ["Drink", "Refreshing"],
    image: "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "filter-coffee",
    name: "South Filter Coffee",
    category: "drinks",
    price: 79,
    description: "Fresh decoction coffee with milk, served in insulated cups.",
    tags: ["Drink", "Pantry"],
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "chaat-box",
    name: "Mumbai Chaat Box",
    category: "meals",
    price: 179,
    description: "Dahi bhalla, sev puri, chutneys, masala peanuts, and sweet finish.",
    tags: ["Snack", "Event"],
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=80",
  },
];

const SUPABASE_URL = "https://pixcrvwtjsnktlztqswz.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_NcLQynCVLY-fMEgTj9lMnA_G66g_NQd";
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

const menuGrid = document.querySelector("[data-menu-grid]");
const cartDrawer = document.querySelector("[data-cart-drawer]");
const cartItems = document.querySelector("[data-cart-items]");
const cartEmpty = document.querySelector("[data-cart-empty]");
const cartTotal = document.querySelector("[data-cart-total]");
const cartCount = document.querySelector("[data-cart-count]");
const orderStatus = document.querySelector("[data-order-status]");
const scrim = document.querySelector("[data-scrim]");
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector("[data-nav-links]");

function renderMenu() {
  const visibleItems = state.filter === "all"
    ? menuItems
    : menuItems.filter((item) => item.category === state.filter);

  menuGrid.innerHTML = visibleItems
    .map((item) => `
      <article class="menu-card">
        <img src="${item.image}" alt="${item.name}" loading="lazy" />
        <div class="menu-card-body">
          <div class="menu-card-top">
            <h3>${item.name}</h3>
            <span class="price">${formatter.format(item.price)}</span>
          </div>
          <p>${item.description}</p>
          <div class="tag-row">
            ${item.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}
          </div>
          <button class="add-btn" type="button" data-add-item="${item.id}">Add item</button>
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
  const total = entries.reduce((sum, entry) => sum + entry.item.price * entry.quantity, 0);

  cartCount.textContent = itemCount;
  cartTotal.textContent = formatter.format(total);
  cartEmpty.classList.toggle("visible", entries.length === 0);

  cartItems.innerHTML = entries
    .map(({ item, quantity }) => `
      <article class="cart-item">
        <div>
          <h3>${item.name}</h3>
          <p>${formatter.format(item.price)} x ${quantity}</p>
        </div>
        <div class="qty-controls" aria-label="Quantity controls for ${item.name}">
          <button type="button" data-decrease="${item.id}" aria-label="Decrease ${item.name}">-</button>
          <strong>${quantity}</strong>
          <button type="button" data-increase="${item.id}" aria-label="Increase ${item.name}">+</button>
        </div>
      </article>
    `)
    .join("");
}

function addItem(id) {
  const item = menuItems.find((menuItem) => menuItem.id === id);
  const existing = state.cart.get(id);
  state.cart.set(id, {
    item,
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
  const addButton = event.target.closest("[data-add-item]");
  const increaseButton = event.target.closest("[data-increase]");
  const decreaseButton = event.target.closest("[data-decrease]");
  const filterButton = event.target.closest("[data-filter]");

  if (addButton) {
    addItem(addButton.dataset.addItem);
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
    renderMenu();
  }
});

document.querySelector("[data-open-cart]").addEventListener("click", openCart);
document.querySelector("[data-close-cart]").addEventListener("click", closeCart);
scrim.addEventListener("click", closeCart);

document.querySelector("[data-checkout]").addEventListener("click", () => {
  if (!state.cart.size) {
    orderStatus.textContent = "Add at least one item to place an order request.";
    return;
  }

  const summary = cartEntries()
    .map(({ item, quantity }) => `${quantity} x ${item.name}`)
    .join(", ");
  orderStatus.textContent = `Order request ready: ${summary}. Our team will confirm availability and delivery.`;
});

document.querySelector(".contact-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const submitButton = form.querySelector("button[type='submit']");
  const formData = new FormData(form);
  const entries = cartEntries();
  const totalAmount = entries.reduce((sum, entry) => sum + entry.item.price * entry.quantity, 0);
  const payload = {
    name: formData.get("name"),
    email: formData.get("email"),
    city: formData.get("city"),
    requirement: formData.get("message"),
    cart_items: entries.map(({ item, quantity }) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity,
      subtotal: item.price * quantity,
    })),
    total_amount: totalAmount,
    source: "rasoiworks-website",
  };

  submitButton.disabled = true;
  submitButton.textContent = "Sending...";

  try {
    if (!supabaseClient) {
      throw new Error("Supabase project URL and anon key are not configured.");
    }

    const { error } = await supabaseClient
      .from("business_enquiries")
      .insert(payload);

    if (error) {
      throw error;
    }

    form.reset();
    state.cart.clear();
    renderCart();
    alert("Thank you. Your enquiry has been saved and RasoiWorks will contact you soon.");
  } catch (error) {
    alert(`Unable to save enquiry: ${error.message}`);
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Send enquiry";
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

renderMenu();
renderCart();
