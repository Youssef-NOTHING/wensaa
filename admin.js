const KEY_PRODUCTS="wensa_products",KEY_MESSAGES="wensa_messages";
const seed=[
{id:"p1",name:"WENSA Hope T-shirt",type:"WEAR THE MESSAGE",price:"120 MAD",image:"https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85",description:"A simple way to share the WENSA message.",active:true},
{id:"p2",name:"Hope Tote Bag",type:"EVERYDAY SOLIDARITY",price:"75 MAD",image:"https://images.unsplash.com/photo-1590871016622-6c7b1e4a5f4b?auto=format&fit=crop&w=900&q=85",description:"Carry a message of kindness.",active:true},
{id:"p3",name:"WENSA Care Kit",type:"A THOUGHTFUL GESTURE",price:"180 MAD",image:"https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=900&q=85",description:"A thoughtful gift set.",active:true}];
const read=(k,f)=>{try{return JSON.parse(localStorage.getItem(k))??f}catch{return f}};
const write=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
if(!localStorage.getItem(KEY_PRODUCTS))write(KEY_PRODUCTS,seed);
const $=id=>document.getElementById(id);
const escapeHTML=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const loginPanel=$("login-panel"),dashboard=$("dashboard");
let uploadedImageData="";
const uploadInput=$("product-upload"),previewWrap=$("image-preview-wrap"),previewImage=$("image-preview");
function showImagePreview(src){if(src){previewImage.src=src;previewWrap.hidden=false;}else{previewImage.removeAttribute("src");previewWrap.hidden=true;}}
uploadInput.addEventListener("change",()=>{
 const file=uploadInput.files&&uploadInput.files[0];if(!file)return;
 if(!file.type.startsWith("image/")){alert("Please choose an image file.");uploadInput.value="";return;}
 if(file.size>2*1024*1024){alert("Please choose an image smaller than 2 MB.");uploadInput.value="";return;}
 const reader=new FileReader();reader.onload=()=>{uploadedImageData=String(reader.result);showImagePreview(uploadedImageData);$("product-image").value="";};reader.readAsDataURL(file);
});
$("remove-image").addEventListener("click",()=>{uploadedImageData="";uploadInput.value="";$("product-image").value="";showImagePreview("");});
$("login-form").addEventListener("submit",e=>{e.preventDefault();if($("admin-password").value==="wensa2026"){sessionStorage.setItem("wensa_admin","yes");showDashboard();}else $("login-error").textContent="Incorrect password. Try the demo password shown below.";});
function showDashboard(){loginPanel.hidden=true;dashboard.hidden=false;renderAll();}
function logout(){sessionStorage.removeItem("wensa_admin");dashboard.hidden=true;loginPanel.hidden=false;$("admin-password").value="";}
$("logout").addEventListener("click",logout);
if(sessionStorage.getItem("wensa_admin")==="yes")showDashboard();
function renderAll(){renderProducts();renderMessages();$("product-count").textContent=read(KEY_PRODUCTS,seed).length;$("message-count").textContent=read(KEY_MESSAGES,[]).length;}
function renderProducts(){
 const list=read(KEY_PRODUCTS,seed);
 $("product-list").innerHTML=list.length?list.map(p=>`<div class="admin-item"><img src="${escapeHTML(p.image)}" alt="" onerror="this.src='assets/wensa-logo.jpeg'"><div class="item-copy"><b>${escapeHTML(p.name)}</b><small>${escapeHTML(p.price)} · <span class="product-status">${p.active===false?"Hidden":"Visible"}</span></small></div><div class="item-actions"><button class="small-btn" data-edit="${escapeHTML(p.id)}">Modify</button><button class="small-btn delete" data-delete="${escapeHTML(p.id)}">Delete</button></div></div>`).join(""):'<p class="empty">No products yet. Add your first product.</p>';
 $("product-list").querySelectorAll("[data-edit]").forEach(b=>b.onclick=()=>editProduct(b.dataset.edit));
 $("product-list").querySelectorAll("[data-delete]").forEach(b=>b.onclick=()=>{if(confirm("Delete this product?")){write(KEY_PRODUCTS,read(KEY_PRODUCTS,seed).filter(p=>p.id!==b.dataset.delete));renderAll();}});
}
function editProduct(id){
 const p=read(KEY_PRODUCTS,seed).find(x=>x.id===id);if(!p)return;
 $("product-id").value=p.id;$("product-name").value=p.name;$("product-type").value=p.type||"";$("product-price").value=p.price||"";
 $("product-image").value=(p.image||"").startsWith("data:")?"":(p.image||"");uploadedImageData=(p.image||"").startsWith("data:")?(p.image||""):"";
 uploadInput.value="";showImagePreview(p.image||"");$("product-description").value=p.description||"";$("product-active").checked=p.active!==false;
 $("editor-title").textContent="Modify product";$("save-product").textContent="Update product";window.scrollTo({top:0,behavior:"smooth"});
}
function clearEditor(){$("product-form").reset();$("product-id").value="";uploadedImageData="";uploadInput.value="";showImagePreview("");$("product-active").checked=true;$("editor-title").textContent="Add a product";$("save-product").textContent="Save product";}
$("cancel-edit").onclick=clearEditor;
$("product-form").addEventListener("submit",e=>{
 e.preventDefault();const list=read(KEY_PRODUCTS,seed),id=$("product-id").value,old=list.find(p=>p.id===id);
 const product={id:id||"p"+Date.now(),name:$("product-name").value.trim(),type:$("product-type").value.trim(),price:$("product-price").value.trim(),image:uploadedImageData||$("product-image").value.trim()||(old?old.image:""),description:$("product-description").value.trim(),active:$("product-active").checked};
 write(KEY_PRODUCTS,id?list.map(p=>p.id===id?product:p):[product,...list]);clearEditor();renderAll();
});
function renderMessages(){const messages=read(KEY_MESSAGES,[]);$("message-list").innerHTML=messages.length?messages.map(m=>`<article class="message-item"><time>${escapeHTML(m.date)}</time><strong>${escapeHTML(m.name)}</strong> · <a href="mailto:${encodeURIComponent(m.email)}">${escapeHTML(m.email)}</a><p>${escapeHTML(m.message)}</p></article>`).join(""):'<p class="empty">No messages saved in this browser yet.</p>';}
$("clear-messages").onclick=()=>{if(confirm("Clear all saved messages?")){write(KEY_MESSAGES,[]);renderAll();}};
$("export-data").onclick=()=>{const data={products:read(KEY_PRODUCTS,seed),messages:read(KEY_MESSAGES,[]),exportedAt:new Date().toISOString()};const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="wensa-local-backup.json";a.click();URL.revokeObjectURL(url);};
$("reset-data").onclick=()=>{if(confirm("Reset products and remove locally saved messages? This cannot be undone.")){write(KEY_PRODUCTS,seed);write(KEY_MESSAGES,[]);clearEditor();renderAll();}};
