/* WENSA Store — products + cart + order checkout */
const fallbackProducts=[
{id:"p1",name:"WENSA Hope T-shirt",type:"WEAR THE MESSAGE",price:"120 MAD",image:"https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85",description:"A simple way to share the WENSA message.",active:true,custom:true},
{id:"p2",name:"Hope Tote Bag",type:"EVERYDAY SOLIDARITY",price:"75 MAD",image:"https://images.unsplash.com/photo-1590871016622-6c7b1e4a5f4b?auto=format&fit=crop&w=900&q=85",description:"Carry a message of kindness.",active:true,custom:true},
{id:"p3",name:"WENSA Care Kit",type:"A THOUGHTFUL GESTURE",price:"180 MAD",image:"https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=900&q=85",description:"A thoughtful gift set.",active:true,custom:false}];
if(!localStorage.getItem("wensa_products"))localStorage.setItem("wensa_products",JSON.stringify(fallbackProducts));

const safe=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const L=()=>localStorage.getItem("wensa_lang")||"fr";
const T={
en:{ask:"Ask about this product ↗",empty:"New WENSA products will be added soon.",add:"Add to cart",added:"Added ✓",custom:"Personalization",customPh:"What should we print or write? Name, phrase, colour, other details…",needCustom:"Please describe the personalization for each personalized product.",cart:"Your cart",emptyCart:"Your cart is empty.",remove:"Remove",qty:"Quantity",cont:"Continue",back:"Back",details:"Your details",fullName:"Full name",phone:"Phone",city:"City",address:"Address",review:"Review order",summary:"Order summary",total:"Total",confirm:"Confirm and send order",sending:"Sending…",doneTitle:"Order received!",doneText:"Thank you. The WENSA team will call you to confirm your order and delivery.",ref:"Order reference",close:"Close",badPhone:"Please enter a valid phone number.",fillAll:"Please fill in all fields.",err:"We could not send your order. Please try again or contact us.",priceReq:"Price on request",unpriced:"Some items have no listed price: the team will confirm the final total.",custLabel:"Customer",items:"Items"},
fr:{ask:"Se renseigner sur ce produit ↗",empty:"De nouveaux produits WENSA seront bientôt disponibles.",add:"Ajouter au panier",added:"Ajouté ✓",custom:"Personnalisation",customPh:"Que faut-il imprimer ou écrire ? Nom, phrase, couleur, autres détails…",needCustom:"Merci de préciser la personnalisation de chaque produit personnalisé.",cart:"Votre panier",emptyCart:"Votre panier est vide.",remove:"Retirer",qty:"Quantité",cont:"Continuer",back:"Retour",details:"Vos informations",fullName:"Nom complet",phone:"Téléphone",city:"Ville",address:"Adresse",review:"Vérifier la commande",summary:"Récapitulatif",total:"Total",confirm:"Confirmer et envoyer la commande",sending:"Envoi…",doneTitle:"Commande reçue !",doneText:"Merci. L'équipe WENSA vous appellera pour confirmer la commande et la livraison.",ref:"Référence de commande",close:"Fermer",badPhone:"Merci d'entrer un numéro de téléphone valide.",fillAll:"Merci de remplir tous les champs.",err:"Impossible d'envoyer la commande. Réessayez ou contactez-nous.",priceReq:"Prix sur demande",unpriced:"Certains articles n'ont pas de prix affiché : l'équipe confirmera le total final.",custLabel:"Client",items:"Articles"},
ar:{ask:"استفسر عن المنتج ↗",empty:"ستتم إضافة منتجات WENSA جديدة قريباً.",add:"أضف إلى السلة",added:"تمت الإضافة ✓",custom:"التخصيص",customPh:"شنو بغيتي نطبعو أو نكتبو؟ الاسم، العبارة، اللون، أو أي تفاصيل أخرى…",needCustom:"المرجو كتابة تفاصيل التخصيص لكل منتج شخصي.",cart:"سلة المشتريات",emptyCart:"السلة فارغة.",remove:"حذف",qty:"الكمية",cont:"متابعة",back:"رجوع",details:"معلوماتك",fullName:"الاسم الكامل",phone:"الهاتف",city:"المدينة",address:"العنوان",review:"مراجعة الطلب",summary:"ملخص الطلب",total:"المجموع",confirm:"تأكيد وإرسال الطلب",sending:"جارٍ الإرسال…",doneTitle:"تم استلام طلبك!",doneText:"شكراً. سيتصل بك فريق WENSA لتأكيد الطلب والتوصيل.",ref:"رقم الطلب",close:"إغلاق",badPhone:"المرجو إدخال رقم هاتف صحيح.",fillAll:"المرجو ملء جميع الخانات.",err:"تعذر إرسال الطلب. أعد المحاولة أو تواصل معنا.",priceReq:"الثمن عند الطلب",unpriced:"بعض المنتجات بدون ثمن معروض: الفريق غادي يأكد المجموع النهائي.",custLabel:"الزبون",items:"المنتجات"}};
const t=k=>(T[L()]||T.fr)[k]||T.en[k]||k;

const parsePrice=s=>{const m=String(s??"").match(/\d+(?:[.,]\d+)?/);return m?parseFloat(m[0].replace(",",".")):null};
const money=n=>n.toLocaleString("en-US",{maximumFractionDigits:2})+" MAD";
const getProducts=()=>{let p=[];try{p=JSON.parse(localStorage.getItem("wensa_products"))||fallbackProducts}catch{p=fallbackProducts}return p.filter(x=>x.active!==false)};

/* ---------- cart state ---------- */
const CART_KEY="wensa_cart";
let cart=(()=>{try{const c=JSON.parse(localStorage.getItem(CART_KEY));return Array.isArray(c)?c:[]}catch{return[]}})();
let view="cart",msg="",sending=false,orderRef="",form={name:"",phone:"",city:"",address:""};
const clampQty=n=>Math.min(99,Math.max(1,parseInt(n,10)||1));
const saveCart=()=>{localStorage.setItem(CART_KEY,JSON.stringify(cart));updateBadge()};
const lineTotal=l=>l.unit==null?0:l.unit*l.qty;
const cartTotal=()=>cart.reduce((s,l)=>s+lineTotal(l),0);
const countItems=()=>cart.reduce((s,l)=>s+l.qty,0);
function updateBadge(){const b=document.getElementById("cart-count");if(b){b.textContent=countItems();b.hidden=!countItems()}}

/* ---------- products ---------- */
window.renderStoreProducts=function(){
 const target=document.getElementById("store-products");
 if(target){
  const products=getProducts();
  target.innerHTML=products.length?products.map(p=>`<article class="product" data-id="${safe(p.id)}"><img src="${safe(p.image)}" alt="${safe(p.name)}" onerror="this.src='assets/wensa-logo.jpeg'"><div><small>${safe(p.type||"WENSA")}</small><h3>${safe(p.name)} <b>${safe(p.price||t("priceReq"))}</b></h3><p class="product-description">${safe(p.description||"")}</p>
  ${p.custom?`<label class="pc-label">${t("custom")}<textarea class="pc-text" rows="2" maxlength="300" placeholder="${safe(t("customPh"))}"></textarea></label>`:""}
  <div class="pc-row"><div class="stepper" aria-label="${t("qty")}"><button type="button" data-step="-1">−</button><input class="pc-qty" type="number" inputmode="numeric" min="1" max="99" value="1"><button type="button" data-step="1">+</button></div><button type="button" class="button orange pc-add">${t("add")}</button></div>
  <p class="pc-error" role="alert"></p>
  <a href="index.html#contact" class="product-ask" data-name="${safe(p.name)}">${t("ask")}</a></div></article>`).join(""):`<p class="empty-store">${t("empty")}</p>`;
  target.querySelectorAll(".product-ask").forEach(a=>a.addEventListener("click",()=>localStorage.setItem("wensa_product_enquiry",a.dataset.name)));
 }
 renderCart();
};

document.addEventListener("click",e=>{
 const card=e.target.closest("#store-products .product");if(!card)return;
 const qty=card.querySelector(".pc-qty");
 const step=e.target.closest("[data-step]");
 if(step){qty.value=clampQty(+qty.value+ +step.dataset.step);return}
 if(!e.target.closest(".pc-add"))return;
 const p=getProducts().find(x=>x.id===card.dataset.id);if(!p)return;
 const custom=(card.querySelector(".pc-text")?.value||"").trim();
 const err=card.querySelector(".pc-error");
 if(p.custom&&!custom){err.textContent=t("needCustom");return}
 err.textContent="";
 const q=clampQty(qty.value);
 const same=!p.custom&&cart.find(l=>l.productId===p.id&&!l.custom);
 if(same)same.qty=clampQty(same.qty+q);
 else cart.push({lid:Date.now().toString(36)+Math.random().toString(36).slice(2,6),productId:p.id,name:p.name,unit:parsePrice(p.price),image:p.image||"",customizable:!!p.custom,custom,qty:q});
 saveCart();qty.value=1;const tx=card.querySelector(".pc-text");if(tx)tx.value="";
 const btn=card.querySelector(".pc-add"),old=btn.textContent;btn.textContent=t("added");setTimeout(()=>btn.textContent=t("add"),1200);
 renderCart();
});

/* ---------- cart drawer ---------- */
function buildShell(){
 const header=document.querySelector("header");
 if(header&&!document.getElementById("cart-btn")){
  const b=document.createElement("button");b.id="cart-btn";b.className="cart-btn";b.type="button";b.setAttribute("aria-label","Cart");
  b.innerHTML='🛍 <span id="cart-count" hidden>0</span>';header.appendChild(b);
  b.addEventListener("click",()=>openDrawer());
 }
 if(!document.getElementById("cart-panel")){
  const o=document.createElement("div");o.id="cart-overlay";o.className="cart-overlay";o.hidden=true;
  const p=document.createElement("aside");p.id="cart-panel";p.className="cart-panel";p.hidden=true;
  document.body.append(o,p);
  o.addEventListener("click",closeDrawer);
  p.addEventListener("click",onPanelClick);
  p.addEventListener("input",onPanelInput);
 }
 updateBadge();
}
function openDrawer(v){if(v)view=v;msg="";document.getElementById("cart-overlay").hidden=false;document.getElementById("cart-panel").hidden=false;document.body.classList.add("cart-open");renderCart()}
function closeDrawer(){document.getElementById("cart-overlay").hidden=true;document.getElementById("cart-panel").hidden=true;document.body.classList.remove("cart-open");if(view==="done"){view="cart";orderRef=""}}

function thumb(l){return `<img src="${safe(l.image)}" alt="" onerror="this.src='assets/wensa-logo.jpeg'">`}
function totalsHTML(){return `<div class="cp-total"><span>${t("total")}</span><b>${money(cartTotal())}</b></div>${cart.some(l=>l.unit==null)?`<p class="cp-note">${t("unpriced")}</p>`:""}`}

function renderCart(){
 const box=document.getElementById("cart-panel");if(!box)return;
 updateBadge();
 const titles={cart:t("cart"),details:t("details"),summary:t("summary"),done:t("doneTitle")};
 let body="",foot="";
 if(view!=="done"&&!cart.length)view="cart";
 if(view==="cart"){
  body=cart.length?cart.map(l=>`<div class="cl" data-lid="${l.lid}">${thumb(l)}<div class="cl-main"><b>${safe(l.name)}</b><small>${l.unit==null?t("priceReq"):money(l.unit)}</small>
   ${l.customizable?`<label class="pc-label">${t("custom")}<textarea class="cl-text" rows="2" maxlength="300" placeholder="${safe(t("customPh"))}">${safe(l.custom)}</textarea></label>`:""}
   <div class="cl-row"><div class="stepper"><button type="button" data-act="dec">−</button><span>${l.qty}</span><button type="button" data-act="inc">+</button></div><b>${l.unit==null?"—":money(lineTotal(l))}</b><button type="button" class="text-link" data-act="remove">${t("remove")}</button></div></div></div>`).join(""):`<p class="cp-empty">${t("emptyCart")}</p>`;
  foot=cart.length?`${totalsHTML()}<p class="cp-error">${safe(msg)}</p><button type="button" class="button orange cp-btn" data-act="toDetails">${t("cont")} →</button>`:"";
 }else if(view==="details"){
  const f=(k,label,type="text",ac="")=>`<label>${label}<input class="f-input" data-k="${k}" type="${type}" autocomplete="${ac}" value="${safe(form[k])}" maxlength="${k==="address"?300:100}"></label>`;
  body=`${f("name",t("fullName"),"text","name")}${f("phone",t("phone"),"tel","tel")}${f("city",t("city"),"text","address-level2")}${f("address",t("address"),"text","street-address")}`;
  foot=`<p class="cp-error">${safe(msg)}</p><div class="cp-two"><button type="button" class="button outline-dark cp-btn" data-act="toCart">${t("back")}</button><button type="button" class="button orange cp-btn" data-act="toSummary">${t("review")} →</button></div>`;
 }else if(view==="summary"){
  body=`<div class="sum-box"><small>${t("custLabel")}</small><p><b>${safe(form.name)}</b><br>${safe(form.phone)}<br>${safe(form.city)} — ${safe(form.address)}</p></div><div class="sum-box"><small>${t("items")}</small>${cart.map(l=>`<div class="sum-line"><div><b>${l.qty} × ${safe(l.name)}</b>${l.custom?`<p class="sum-custom">${t("custom")}: ${safe(l.custom)}</p>`:""}</div><span>${l.unit==null?t("priceReq"):money(lineTotal(l))}</span></div>`).join("")}</div>`;
  foot=`${totalsHTML()}<p class="cp-error">${safe(msg)}</p><div class="cp-two"><button type="button" class="button outline-dark cp-btn" data-act="toDetails">${t("back")}</button><button type="button" class="button orange cp-btn" data-act="confirm" ${sending?"disabled":""}>${sending?t("sending"):t("confirm")}</button></div>`;
 }else{
  body=`<div class="cp-done"><span>♡</span><p>${t("doneText")}</p><p class="cp-ref">${t("ref")}: <b>${safe(orderRef)}</b></p></div>`;
  foot=`<button type="button" class="button orange cp-btn" data-act="close">${t("close")}</button>`;
 }
 box.innerHTML=`<div class="cp-head"><b>${titles[view]}</b><button type="button" data-act="close" aria-label="${t("close")}">×</button></div><div class="cp-body">${body}</div><div class="cp-foot">${foot}</div>`;
}

function onPanelInput(e){
 const lid=e.target.closest(".cl")?.dataset.lid;
 if(e.target.classList.contains("cl-text")&&lid){const l=cart.find(x=>x.lid===lid);if(l){l.custom=e.target.value;localStorage.setItem(CART_KEY,JSON.stringify(cart))}}
 if(e.target.classList.contains("f-input"))form[e.target.dataset.k]=e.target.value;
}
function onPanelClick(e){
 const a=e.target.closest("[data-act]");if(!a)return;
 const act=a.dataset.act,lid=a.closest(".cl")?.dataset.lid,l=cart.find(x=>x.lid===lid);
 if(act==="close")return closeDrawer();
 if(act==="inc"&&l){l.qty=clampQty(l.qty+1);saveCart()}
 else if(act==="dec"&&l){l.qty=clampQty(l.qty-1);saveCart()}
 else if(act==="remove"&&l){cart=cart.filter(x=>x!==l);saveCart()}
 else if(act==="toCart"){view="cart";msg=""}
 else if(act==="toDetails"){
  if(cart.some(x=>x.customizable&&!x.custom.trim())){msg=t("needCustom");return renderCart()}
  view="details";msg=""}
 else if(act==="toSummary"){
  const f=Object.fromEntries(Object.entries(form).map(([k,v])=>[k,v.trim()]));
  if(!f.name||!f.phone||!f.city||!f.address){msg=t("fillAll");return renderCart()}
  if(!/^[+\d][\d\s().-]{7,29}$/.test(f.phone)){msg=t("badPhone");return renderCart()}
  form=f;view="summary";msg=""}
 else if(act==="confirm")return submitOrder();
 renderCart();
}

async function submitOrder(){
 if(sending||!cart.length)return;
 sending=true;msg="";renderCart();
 const payload={lang:L(),customer:{...form},items:cart.map(l=>({productId:l.productId,name:l.name,unit:l.unit,qty:l.qty,custom:l.custom.trim()}))};
 try{
  const r=await fetch("/api/orders",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
  const j=await r.json().catch(()=>({}));
  if(!r.ok||!j.ref)throw new Error(j.error||"order failed");
  orderRef=j.ref;cart=[];saveCart();form={name:"",phone:"",city:"",address:""};view="done";
 }catch(err){msg=t("err")}
 sending=false;renderCart();
}

document.addEventListener("DOMContentLoaded",()=>{
 const y=document.getElementById("year");if(y)y.textContent=new Date().getFullYear();
 buildShell();window.renderStoreProducts();
});
