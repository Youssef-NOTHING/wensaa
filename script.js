const DB = {
  read(key, fallback) {
    try { return JSON.parse(localStorage.getItem(`wensa_${key}`)) ?? fallback; }
    catch { return fallback; }
  },
  write(key, value) { localStorage.setItem(`wensa_${key}`, JSON.stringify(value)); }
};

const starterProducts = window.WENSA_SEED || [];

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
  // the open/close click is already handled in language-chat.js (two handlers = opens then closes immediately)
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

const enquiry=localStorage.getItem("wensa_product_enquiry");
if(enquiry){const field=document.querySelector('#contact-form textarea[name="message"]');if(field)field.value="I would like to know more about: "+enquiry;localStorage.removeItem("wensa_product_enquiry");}
