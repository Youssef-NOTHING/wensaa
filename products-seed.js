/* WENSA — default catalogue (from the official WENSA menu poster).
   Loaded before store.js / admin.js / script.js. */
window.WENSA_SEED=[
{id:"p1",name:"Portefeuille Traditionnel",names:{fr:"Portefeuille Traditionnel",en:"Traditional Wallet",ar:"المحفظة التقليدية"},type:"WENSA",price:"30 DH",image:"assets/wallet-traditional.jpg",
 description:"Un design marocain authentique, élégant et fait main.",descs:{fr:"Un design marocain authentique, élégant et fait main.",en:"An authentic Moroccan design, elegant and handmade.",ar:"تصميم مغربي أصيل، أنيق ومصنوع يدوياً."},
 feats:[{i:"hand",l:{fr:"Fait main",en:"Handmade",ar:"صنع يدوي"}},{i:"gem",l:{fr:"Qualité premium",en:"Premium quality",ar:"جودة عالية"}},{i:"star",l:{fr:"Style marocain",en:"Moroccan style",ar:"طابع مغربي"}}],active:true,custom:false},
{id:"p2",name:"Portefeuille Classique",names:{fr:"Portefeuille Classique",en:"Classic Wallet",ar:"المحفظة الكلاسيكية"},type:"WENSA",price:"40 DH",image:"assets/wallet-classic.jpg",
 description:"Simple, pratique et tendance pour un usage quotidien.",descs:{fr:"Simple, pratique et tendance pour un usage quotidien.",en:"Simple, practical and stylish for everyday use.",ar:"بسيطة وعملية وعصرية للاستعمال اليومي."},
 feats:[{i:"case",l:{fr:"Pratique",en:"Practical",ar:"عملية"}},{i:"feather",l:{fr:"Léger",en:"Light",ar:"خفيفة"}},{i:"shield",l:{fr:"Résistant",en:"Resistant",ar:"متينة"}}],active:true,custom:false},
{id:"p3",name:"Petite Maroquinerie",names:{fr:"Petite Maroquinerie",en:"Small Leather Goods",ar:"منتجات جلدية صغيرة"},type:"WENSA",price:"50 DH",image:"assets/wallet-small.jpg",
 description:"Un accessoire compact au style raffiné.",descs:{fr:"Un accessoire compact au style raffiné.",en:"A compact accessory with a refined style.",ar:"إكسسوار صغير الحجم بطابع راقٍ."},
 feats:[{i:"wallet",l:{fr:"Compact",en:"Compact",ar:"صغيرة الحجم"}},{i:"star",l:{fr:"Élégant",en:"Elegant",ar:"أنيقة"}},{i:"shield",l:{fr:"Durable",en:"Durable",ar:"تدوم طويلاً"}}],active:true,custom:false}
];
/* Replace the old demo catalogue (T-shirt / tote / care kit) once; never touches products the admin created. */
(function(){try{
 const raw=localStorage.getItem("wensa_products"),cur=raw?JSON.parse(raw):null;
 const old=Array.isArray(cur)&&cur.length&&cur.every(p=>/^p[123]$/.test(p.id)&&String(p.image||"").includes("unsplash.com"));
 if(!cur||old)localStorage.setItem("wensa_products",JSON.stringify(window.WENSA_SEED));
}catch(e){}})();
