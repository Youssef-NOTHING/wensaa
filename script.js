const DB = {
  read(key, fallback) {
    try { return JSON.parse(localStorage.getItem(`wensa_${key}`)) ?? fallback; }
    catch { return fallback; }
  },
  write(key, value) { localStorage.setItem(`wensa_${key}`, JSON.stringify(value)); }
};

const starterProducts = [
  { id: "p1", name: "WENSA Hope T-shirt", type: "WEAR THE MESSAGE", price: "120 MAD", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85", description: "A simple way to share the WENSA message.", active: true },
  { id: "p2", name: "Hope Tote Bag", type: "EVERYDAY SOLIDARITY", price: "75 MAD", image: "https://images.unsplash.com/photo-1590871016622-6c7b1e4a5f4b?auto=format&fit=crop&w=900&q=85", description: "Carry a message of kindness.", active: true },
  { id: "p3", name: "WENSA Care Kit", type: "A THOUGHTFUL GESTURE", price: "180 MAD", image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=900&q=85", description: "A thoughtful gift set.", active: true }
];
if (!localStorage.getItem("wensa_products")) DB.write("products", starterProducts);

function renderProducts() {
  const container = document.querySelector(".products");
  if (!container) return;
  const products = DB.read("products", starterProducts).filter(p => p.active !== false);
  container.innerHTML = products.length ? products.map(p => `
    <article class="product reveal">
      <img src="${escapeHtml(p.image || '')}" alt="${escapeHtml(p.name)}" onerror="this.src='assets/wensa-logo.jpeg'">
      <div><small>${escapeHtml(p.type || 'WENSA COLLECTION')}</small>
      <h3>${escapeHtml(p.name)} <b>${escapeHtml(p.price || 'Price on request')}</b></h3>
      <p class="product-description">${escapeHtml(p.description || '')}</p>
      <a href="#contact" data-product="${escapeHtml(p.name)}">Ask about this product ↗</a></div>
    </article>`).join("") : '<p class="empty-store">New WENSA products will be added soon.</p>';
  container.querySelectorAll(".reveal").forEach(el => el.classList.add("visible"));
  container.querySelectorAll("[data-product]").forEach(a => a.addEventListener("click", () => {
    const message = document.querySelector('#contact-form textarea[name="message"]');
    if (message) message.value = `I would like to know more about: ${a.dataset.product}`;
  }));
}
function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

const toggle = document.querySelector(".toggle");
const nav = document.querySelector("nav");
if (toggle && nav) {
  toggle.addEventListener("click", () => nav.classList.toggle("open"));
  nav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => nav.classList.remove("open")));
}
const year = document.querySelector("#year");
if (year) year.textContent = new Date().getFullYear();
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add("visible"); observer.unobserve(e.target); }
  }), { threshold: .12 });
  document.querySelectorAll(".reveal").forEach(el => observer.observe(el));
}
renderProducts();

const contactForm = document.querySelector("#contact-form");
if (contactForm) contactForm.addEventListener("submit", e => {
  e.preventDefault();
  const d = new FormData(contactForm);
  const messages = DB.read("messages", []);
  messages.unshift({ id: Date.now().toString(), name: d.get("name"), email: d.get("email"), message: d.get("message"), date: new Date().toLocaleString() });
  DB.write("messages", messages);
  const subject = encodeURIComponent("WENSA message from " + d.get("name"));
  const body = encodeURIComponent(d.get("message") + "\n\nName: " + d.get("name") + "\nEmail: " + d.get("email"));
  const status = document.querySelector(".status");
  if (status) status.textContent = "Message saved in this browser. Your email app will also open.";
  window.location.href = "mailto:hello@wensa.org?subject=" + subject + "&body=" + body;
});
