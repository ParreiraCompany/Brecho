import {HAS_BACKEND} from './config.js';
import * as api from './lib/api.js';
import {setupIcons,route,getRoute,DEFAULT_SETTINGS,DEFAULT_CATEGORIES,CONDITIONS,escapeHtml as h,cleanText,parsePrice,money,waLink,digits,SUPPORTED_TYPES,IMAGE_MAX,MAX_PHOTOS,icon} from './lib/utils.js';
import {siteHeader,footer,homePage,catalogPage,categoriesPage,productPage,bagPage,aboutPage,contactPage,privacyPage,filterProducts,renderGrid} from './ui/public.js';
import {loginPage,ownerShell,dashboardPage,ownerProductsPage,adminProductTable,productEditorPage,editorPhotos,settingsPage,categoriesAdminPage,auditPage} from './ui/owner.js';

setupIcons();
const app=document.getElementById('app');
const defaultFilters=()=>({search:'',category:'',size:'',brand:'',color:'',condition:'',availability:'',min:'',max:'',sort:'newest'});
const cartLoad=()=>{try {const data=JSON.parse(localStorage.getItem('bp-cart')||'[]');return Array.isArray(data)?data.filter(x=>typeof x==='string').slice(0,100):[]}catch{return[]}};
const s={configured:HAS_BACKEND,loading:true,busy:false,path:'',products:[],categories:[],settings:{...DEFAULT_SETTINGS},ownerData:{products:[],categories:[],audit:[],owners:[]},profile:null,cart:cartLoad(),filters:defaultFilters(),adminSearch:'',adminStatus:'',galleryIndex:0,displayLimit:12,filtersOpen:false,menuOpen:false,editor:null,notice:'',error:''};
let originalPath='';
let noticeTimer;
let routeCounter=0;
const persistCart=()=>{try{localStorage.setItem('bp-cart',JSON.stringify(s.cart))}catch{}};
function toast(message,type='success') {const box=document.createElement('div');box.className='toast '+type;box.setAttribute('role','status');box.innerHTML=`${icon(type==='error'?'alert':'check',19)}<span>${h(message)}</span><button aria-label="Fechar aviso" type="button">${icon('close',16)}</button>`;document.querySelector('.toast')?.remove();document.body.append(box);box.querySelector('button').addEventListener('click',()=>box.remove());clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>box.remove(),6500);}
const apiError=(err,prefix='Não foi possível concluir')=>{
  console.error(err);
  const raw=String(err?.message||err||'Erro inesperado.');
  if(/CONFLITO_DE_VERSAO/i.test(raw)) return toast('Esta peça mudou em outro dispositivo. Reabra o produto para carregar a versão mais recente.','error');
  if(/Failed to fetch|network|NetworkError/i.test(raw))return toast('Falha de conexão. Confira a internet e tente novamente.','error');
  toast(prefix+': '+raw,'error');
};
function go(path){location.hash=route(path);}
function setBusy(value){s.busy=value;const buttons=document.querySelectorAll('button[type="submit"]');buttons.forEach(b=>b.disabled=value);}
function pathInfo(){const raw=getRoute();const [path,q='']=raw.split('?');return{path,query:new URLSearchParams(q)}}
function render() {
  const path=s.path;
  const owner=path.startsWith('owner');
  document.body.classList.toggle('is-owner',owner);
  document.title=path.startsWith('produto/')?`${s.products.find(p=>p.slug===path.split('/')[1])?.name||'Peça'} | Brechó Parreira`:owner?'Proprietários | Brechó Parreira':'Brechó Parreira — Estilo com uma nova história';
  if(owner) {
    if(!s.profile||path==='owner/login') {app.innerHTML=loginPage(s);return;}
    const body= path==='owner'||path==='owner/'?dashboardPage(s)
      :path==='owner/produtos'?ownerProductsPage(s)
      :path==='owner/novo'?productEditorPage(s)
      :path.startsWith('owner/editar/')?productEditorPage(s,path.split('/')[2])
      :path==='owner/categorias'?categoriesAdminPage(s)
      :path==='owner/configuracoes'?settingsPage(s)
      :path==='owner/historico'?auditPage(s)
      :dashboardPage(s);
    app.innerHTML=ownerShell(s,body);return;
  }
  const main=path===''?homePage(s)
    :path==='catalogo'?catalogPage(s)
    :path==='categorias'?categoriesPage(s)
    :path.startsWith('produto/')?productPage(s,path.split('/')[1])
    :path==='sacola'?bagPage(s)
    :path==='sobre'?aboutPage(s)
    :path==='contato'?contactPage(s)
    :path==='privacidade'?privacyPage(s)
    :`<main class="container simple-page"><h1>Página não encontrada</h1><p>Volte ao início para continuar explorando.</p><a href="${route('')}" class="btn btn-dark">VOLTAR AO INÍCIO</a></main>`;
  app.innerHTML=siteHeader(s)+(s.error?`<div class="network-warning" role="alert">${icon('alert',18)} ${h(s.error)} <button type="button" data-action="retry-load">Tentar novamente</button></div>`:'')+main+footer(s);
}
async function reloadPublic() {
 if(!s.configured){s.loading=false;return;}
 const result=await api.fetchPublicData();
 s.products=result.products;s.categories=result.categories;s.settings=result.settings;s.loading=false;
 // A sacola guarda identificadores; itens despublicados desaparecem na exibição.
}
async function reloadOwner() {if(s.profile){s.ownerData=await api.fetchOwnerData();}}
async function initial() {
 const {path,query}=pathInfo();s.path=path;originalPath=path;
 if(query.get('categoria'))s.filters.category=query.get('categoria');
 render();
 if(s.configured){
   try{
     await reloadPublic();
     s.profile=await api.getOwnerProfile();
     if(s.profile&&s.path.startsWith('owner'))await reloadOwner();
   }catch(err){s.error='Não foi possível carregar os dados. Verifique o Supabase e a conexão.';apiError(err,'Falha no carregamento');}
 }
 s.loading=false;
 if(s.path==='owner/novo'||s.path.startsWith('owner/editar/'))initializeEditor();
 render();
}
function initializeEditor() {
 let current=s.path.startsWith('owner/editar/')?s.ownerData.products.find(p=>p.id===s.path.split('/')[2]):null;
 s.editor={id:current?.id||null,dirty:false,draft:null,images:current?.images.map(p=>({key:'existing:'+p.id,id:p.id,kind:'existing',url:p.url,position:p.position,is_primary:p.is_primary}))||[],primaryKey:''};
 s.editor.primaryKey=s.editor.images.find(x=>x.is_primary)?.key||s.editor.images[0]?.key||'';
}
async function navigate() {
 const next=pathInfo();const old=s.path;
 if(old!==next.path) {
  if(old.startsWith('owner/novo')||old.startsWith('owner/editar/')){
    // Hash já foi alterado; se usuário cancelar, restauramos a rota anterior.
    if(s.editor?.dirty&&!confirm('Existem alterações não salvas. Deseja sair sem salvar?')){
      location.hash=route(old);return;
    }
  }
  s.menuOpen=false;s.filtersOpen=false;s.galleryIndex=0;
  s.path=next.path;originalPath=next.path;
  if(next.path==='catalogo')s.displayLimit=12;
  if(next.path==='catalogo'&&next.query.get('categoria')) s.filters={...defaultFilters(),category:next.query.get('categoria')};
  if(s.profile&&next.path.startsWith('owner')){
    try{await reloadOwner();}catch(err){apiError(err,'Falha ao carregar o painel');}
  }
  if(next.path==='owner/novo'||next.path.startsWith('owner/editar/')) initializeEditor(); else s.editor=null;
 }
 render();window.scrollTo({top:0,behavior:'instant'});
}
window.addEventListener('hashchange',()=>void navigate());
window.addEventListener('beforeunload',ev=>{if(s.editor?.dirty){ev.preventDefault();ev.returnValue='';}});
function collectForm() {
 const form=document.getElementById('product-form');if(!form)return{};
 const fd=new FormData(form),obj=Object.fromEntries(fd);
 const measures={};['Comprimento','Largura','Cintura','Quadril','Busto','Outras'].forEach(k=>{if(obj['measure_'+k]?.trim())measures[k]=obj['measure_'+k].trim()});
 return {name:String(obj.name||'').trim(),category_id:obj.category_id||null,brand:String(obj.brand||'').trim(),size:String(obj.size||'').trim(),color:String(obj.color||'').trim(),condition:obj.condition||'Bom estado',price:String(obj.price||''),quantity:Number(obj.quantity),availability_status:obj.availability_status||'available',description:String(obj.description||'').trim(),measures,featured:fd.has('featured')};
}
function captureEditor() {if(s.editor){s.editor.draft=collectForm();s.editor.dirty=true;}}
function refreshEditorPhotos(){const target=document.getElementById('editor-photos-wrapper');if(target){target.innerHTML=editorPhotos(s);const preview=document.querySelector('.editor-preview>div');const primary=s.editor?.images.find(img=>img.key===s.editor.primaryKey);if(preview)preview.innerHTML=primary?`<img src="${h(primary.url)}" alt="Prévia">`:`<div class="admin-no-img">${icon('image',30)}</div>`;}}
function validateImageMagic(file,bytes) {
 if(file.type==='image/jpeg')return bytes[0]===255&&bytes[1]===216&&bytes[2]===255;
 if(file.type==='image/png')return bytes.slice(0,8).join(',')==='137,80,78,71,13,10,26,10';
 if(file.type==='image/webp')return String.fromCharCode(...bytes.slice(0,4))==='RIFF'&&String.fromCharCode(...bytes.slice(8,12))==='WEBP';
 return false;
}
async function handleFiles(files) {
 if(!s.editor)return;
 captureEditor();
 for(const file of files){
  if(s.editor.images.length>=MAX_PHOTOS) {toast('Máximo de 10 fotos por produto.','error');break;}
  if(!SUPPORTED_TYPES.includes(file.type)||file.size>IMAGE_MAX||file.size===0){toast(`${file.name}: use JPG, PNG ou WebP com até 8 MB.`,'error');continue;}
  const bytes=new Uint8Array(await file.slice(0,12).arrayBuffer());
  if(!validateImageMagic(file,bytes)){toast(`${file.name}: formato de imagem não reconhecido.`,'error');continue;}
  const img={key:'new:'+crypto.randomUUID(),kind:'new',file,url:URL.createObjectURL(file)};
  s.editor.images.push(img);
  if(!s.editor.primaryKey)s.editor.primaryKey=img.key;
 }
 refreshEditorPhotos();
}
function cleanupEditorUrls(){s.editor?.images.filter(x=>x.kind==='new').forEach(x=>URL.revokeObjectURL(x.url));}
async function saveEditor(intent) {
 if(!s.profile||!s.editor||s.busy)return;
 const fields=collectForm();
 const price_cents=parsePrice(fields.price);
 if(fields.name.length<2)return toast('Informe um nome com pelo menos dois caracteres.','error');
 if(price_cents===null)return toast('Preço inválido. Exemplo: 89,90','error');
 if(!Number.isInteger(fields.quantity)||fields.quantity<0||fields.quantity>100000)return toast('Informe uma quantidade válida.','error');
 if(intent==='published'&&s.editor.images.length===0)return toast('Adicione ao menos uma fotografia antes de publicar.','error');
 if(intent==='published'&&s.editor.id&&s.ownerData.products.find(p=>p.id===s.editor.id)?.archived_at)return toast('Desarquive esta peça antes de publicar.','error');
 if(!CONDITIONS.includes(fields.condition))return toast('Escolha um estado de conservação válido.','error');
 const {price, ...rest}=fields;
 const patch={...rest,price_cents};
 setBusy(true);
 let product,step='';
 try{
  const editor=s.editor;
  const existed=!!editor.id;
  const current=existed?s.ownerData.products.find(p=>p.id===editor.id):null;
  if(existed&&!current)throw new Error('Produto não encontrado. Atualize a página.');
  step='salvamento dos dados';
  if(existed){
    // Primeiro aplicamos controle de versão. Publicação é feita após upload.
    product=await api.updateProduct(current,{...patch,publication_status:intent==='draft'?'draft':current.publication_status});
  } else product=await api.insertDraft(patch);
  step='envio das imagens';
  const newOnes=editor.images.filter(x=>x.kind==='new');
  const added=newOnes.length?await api.uploadProductPhotos(product,newOnes.map(x=>x.file)):[];
  const photos=editor.images.map(img=>img.kind==='new'?added[newOnes.findIndex(x=>x.key===img.key)]:img).filter(Boolean);
  const removedIds=current?.images.filter(img=>!editor.images.some(x=>x.id===img.id)).map(img=>img.id)||[];
  const currentPrimary=editor.images.find(x=>x.key===editor.primaryKey);
  const primaryId=currentPrimary?.kind==='new'?added[newOnes.findIndex(x=>x.key===currentPrimary.key)]?.id:currentPrimary?.id;
  step='organização das fotografias';
  await api.synchronizePhotos(current||{images:[]},photos,removedIds,primaryId);
  if(intent==='published') {
    step='publicação';
    const fresh=await api.fetchOwnerProduct(product.id);
    if(fresh.publication_status!=='published') await api.updateProduct(fresh,{publication_status:'published'});
  }
  cleanupEditorUrls();s.editor=null;
  await Promise.all([reloadOwner(),reloadPublic()]);
  toast(intent==='published'?'Produto publicado com sucesso no catálogo.':'Rascunho salvo com sucesso.');
  s.busy=false;
  go('owner/produtos');
 }catch(err){apiError(err,`Erro durante ${step||'salvamento'}. Confira o produto antes de tentar novamente`);setBusy(false);try{await reloadOwner();}catch{}}
}
async function requireOwnerOp(fn){if(!s.profile)return toast('Faça login como proprietário.','error');if(s.busy)return;setBusy(true);try{await fn();await Promise.all([reloadOwner(),reloadPublic()]);render();}catch(err){apiError(err);}finally{setBusy(false)}}
async function productOp(id,what){
 const p=s.ownerData.products.find(x=>x.id===id);if(!p)return toast('Produto não encontrado.','error');
 await requireOwnerOp(async()=>{
  if(what==='toggle-publication') {
   const next=p.publication_status==='published'?'hidden':'published';
   if(next==='published'&&!p.images.length)throw new Error('Adicione uma fotografia antes de publicar.');
   if(p.archived_at&&next==='published')throw new Error('Desarquive o produto antes de publicar.');
   await api.updateProduct(p,{publication_status:next});toast(next==='published'?'Produto publicado.':'Produto ocultado.');
  }
  if(what==='toggle-reserve'){
   const next=p.availability_status==='available'?'reserved':'available';
   await api.updateProduct(p,{availability_status:next});toast(next==='reserved'?'Peça reservada.':'Peça disponível.');
  }
  if(what==='hide-product'){await api.updateProduct(p,{publication_status:'hidden'});toast('Produto retirado da vitrine.');}
  if(what==='archive-product'){
   if(!confirm(`${p.archived_at?'Desarquivar':'Arquivar'} ${p.name}?`))return;
   await api.updateProduct(p,p.archived_at?{archived_at:null,publication_status:'draft'}:{archived_at:new Date().toISOString(),publication_status:'hidden'});
   toast(p.archived_at?'Produto desarquivado.':'Produto arquivado.');
  }
  if(what==='delete-product'){
   if(!confirm(`Excluir DEFINITIVAMENTE ${p.name} (${p.product_code})? Essa ação não pode ser desfeita. Prefira arquivar.`))return;
   await api.deleteProduct(p);toast('Produto excluído permanentemente.');go('owner/produtos');
  }
 });
}
function updateProductResults() {
 const target=document.getElementById('product-results');
 if(target){const filtered=filterProducts(s);target.innerHTML=renderGrid(filtered.slice(0,s.displayLimit),s)+(filtered.length>s.displayLimit?`<button type="button" class="btn btn-outline load-more" data-action="load-more">CARREGAR MAIS PEÇAS ${icon('plus',17)}</button>`:'');const count=document.getElementById('catalog-count');if(count)count.innerHTML=`${filtered.length} ${filtered.length===1?'peça encontrada':'peças encontradas'} <span>— Feitas para fazer parte da sua história.</span>`;}
}
function updateAdminResults(){const t=document.getElementById('admin-product-list');if(!t)return;let p=[...s.ownerData.products];if(s.adminSearch)p=p.filter(x=>cleanText(x.name+' '+x.product_code+' '+x.brand).includes(cleanText(s.adminSearch)));if(s.adminStatus)p=p.filter(x=>s.adminStatus==='archived'?x.archived_at:s.adminStatus==='draft'?x.publication_status==='draft':s.adminStatus==='hidden'?x.publication_status==='hidden':x.availability_status===s.adminStatus&&!x.archived_at);t.innerHTML=adminProductTable(p,s);const count=document.querySelector('.admin-results-count');if(count)count.textContent=`${p.length} peças`;}
function addCart(id){const p=s.products.find(x=>x.id===id);if(!p)return toast('Produto não encontrado.','error');if(p.availability_status!=='available'||p.quantity<1)return toast('Esta peça não está disponível para adicionar à sacola.','error');if(s.cart.includes(id))return toast('Esta peça já está na sua sacola.','info');s.cart.push(id);persistCart();render();toast(`${p.name} adicionada à sacola.`);}
function cartMessage(products){const items=products.map((p,i)=>`${i+1}. ${p.name}\nCódigo: ${p.product_code}\nTamanho: ${p.size||'Não informado'}\nPreço: ${money(p.price_cents)}`).join('\n\n');const sub=products.reduce((n,p)=>n+p.price_cents,0);return `Olá! Gostaria de consultar estas peças do Brechó Parreira:\n\n${items}\n\nSubtotal: ${money(sub)}\n\nGostaria de confirmar a disponibilidade e combinar a retirada ou entrega. Entendo que esta solicitação não garante uma reserva.`;}
async function checkout() {
 if(!s.settings.whatsapp_number)return toast('O WhatsApp comercial ainda precisa ser configurado pela loja.','error');
 if(!s.configured)return toast('É necessário configurar o Supabase para confirmar preços e disponibilidade.','error');
 try{
  const fresh=await api.getFreshPublicProducts();
  const items=s.cart.map(id=>fresh.find(x=>x.id===id)).filter(x=>x&&x.availability_status==='available'&&x.quantity>0);
  if(!items.length)return toast('Nenhuma peça da sua sacola está disponível neste momento.','error');
  if(items.length!==s.cart.length)toast('Algumas peças não estão disponíveis e foram retiradas da solicitação.','info');
  location.href=waLink(s.settings.whatsapp_number,cartMessage(items));
 }catch(err){apiError(err,'Não foi possível verificar o estoque');}
}
function openWhatsAppForProduct(id) {const p=s.products.find(x=>x.id===id);if(!p)return;if(!s.settings.whatsapp_number)return toast('O WhatsApp comercial ainda não foi configurado.','error');const message=`Olá! Gostaria de consultar a peça ${p.name} (${p.product_code}), tamanho ${p.size||'não informado'}, preço ${money(p.price_cents)}. Poderiam confirmar a disponibilidade?`;window.open(waLink(s.settings.whatsapp_number,message),'_blank','noopener,noreferrer');}
async function shareProduct(id){const p=s.products.find(x=>x.id===id);if(!p)return;const url=location.href.split('#')[0]+route('produto/'+p.slug);try{if(navigator.share)await navigator.share({title:p.name,text:`Conheça esta peça do Brechó Parreira: ${p.name}`,url});else{await navigator.clipboard.writeText(url);toast('Link da peça copiado!');}}catch(err){if(err.name!=='AbortError')apiError(err,'Não foi possível compartilhar');}}

app.addEventListener('input',event=>{
 const el=event.target;
 if(el.dataset.filter){s.filters[el.dataset.filter]=el.value;s.displayLimit=12;updateProductResults();}
 if(el.hasAttribute('data-admin-search')){s.adminSearch=el.value;updateAdminResults();}
 if(el.closest('#product-form')&&s.editor) {s.editor.dirty=true;}
});
app.addEventListener('change',event=>{
 const el=event.target;
 if(el.dataset.filter){s.filters[el.dataset.filter]=el.value;s.displayLimit=12;updateProductResults();}
 if(el.hasAttribute('data-admin-status')){s.adminStatus=el.value;updateAdminResults();}
 if(el.id==='product-photos-input')void handleFiles([...el.files]);
 if(el.closest('#product-form')&&s.editor){s.editor.dirty=true;}
});
app.addEventListener('submit',async event=>{
 const form=event.target;event.preventDefault();if(s.busy)return;
 if(form.id==='login-form'){
  const fd=new FormData(form);setBusy(true);
  try{
   if(!s.configured)throw new Error('Configure o Supabase antes de entrar.');
   const profile=await api.signIn(fd.get('email'),fd.get('password'));
   if(!profile){await api.signOut();throw new Error('Esta conta não tem autorização OWNER.');}
   s.profile=profile;await reloadOwner();toast('Acesso autorizado. Bem-vindo ao painel.');go('owner');
  }catch(err){apiError(err,'Não foi possível autenticar');}finally{setBusy(false);}return;
 }
 if(form.id==='product-form'){
   const submitter=event.submitter;
   const intent=submitter?.value==='draft'?'draft':'published';
   await saveEditor(intent);return;
 }
 if(form.id==='settings-form'){
   const f=new FormData(form);const values={};['store_name','slogan','description','whatsapp_number','instagram_url','delivery_info','pickup_info','business_hours','highlight_text'].forEach(k=>values[k]=String(f.get(k)||'').trim());values.show_sold=f.has('show_sold');
   if(!values.store_name)return toast('Informe o nome da loja.','error');
   if(values.whatsapp_number&&(!/^55\d{10,11}$/.test(digits(values.whatsapp_number))))return toast('Informe o WhatsApp como 55 + DDD + número. Exemplo: 5562999999999.','error');
   if(values.instagram_url&&!/^https:\/\//.test(values.instagram_url))return toast('Use um link HTTPS para o Instagram.','error');
   await requireOwnerOp(async()=>{await api.saveSettings(values);toast('Configurações salvas com sucesso.');});return;
 }
 if(form.id==='category-form'){
   const name=String(new FormData(form).get('name')||'').trim();if(name.length<2)return toast('Informe um nome para a categoria.','error');
   await requireOwnerOp(async()=>{await api.createCategory(name);toast('Categoria criada.');});return;
 }
});
app.addEventListener('click',async event=>{
 const button=event.target.closest('[data-action]');if(!button)return;
 const action=button.dataset.action,id=button.dataset.id;
 if(button.matches('a'))event.preventDefault();
 if(action==='retry-load'){try{await reloadPublic();s.error='';render();toast('Catálogo atualizado.');}catch(err){apiError(err,'Falha ao recarregar');}return;}
 if(action==='toggle-menu'){s.menuOpen=!s.menuOpen;render();return;}
 if(action==='add-cart')return addCart(id);
 if(action==='remove-cart'){s.cart=s.cart.filter(x=>x!==id);persistCart();render();return;}
 if(action==='clear-cart'){if(confirm('Remover todas as peças da sacola?')){s.cart=[];persistCart();render();}return;}
 if(action==='clear-filters'){s.filters=defaultFilters();s.displayLimit=12;render();return;}
 if(action==='load-more'){s.displayLimit+=12;updateProductResults();return;}
 if(action==='show-filters'){s.filtersOpen=true;render();return;}
 if(action==='hide-filters'){s.filtersOpen=false;render();return;}
 if(action==='gallery-select'){s.galleryIndex=Number(button.dataset.index)||0;render();return;}
 if(action==='gallery-prev'||action==='gallery-next'){
  const p=s.products.find(x=>s.path==='produto/'+x.slug);const count=p?.images?.length||1;s.galleryIndex=(s.galleryIndex+(action==='gallery-prev'?-1:1)+count)%count;render();return;
 }
 if(action==='zoom-photo'){
  const p=s.products.find(x=>s.path==='produto/'+x.slug),url=p?.images?.[s.galleryIndex]?.url;if(!url)return;
  const overlay=document.createElement('div');overlay.className='zoom-overlay';overlay.innerHTML=`<img src="${h(url)}" alt="${h(p.name)}"><button type="button" aria-label="Fechar imagem">${icon('close',28)}</button>`;overlay.addEventListener('click',()=>overlay.remove());document.body.append(overlay);return;
 }
 if(action==='consult-product')return openWhatsAppForProduct(id);
 if(action==='share-product')return await shareProduct(id);
 if(action==='checkout')return await checkout();
 if(action==='logout'){
  try{await api.signOut();s.profile=null;s.ownerData={products:[],categories:[],audit:[]};s.editor=null;toast('Sessão encerrada com segurança.');go('');}catch(err){apiError(err,'Erro ao sair');}return;
 }
 if(action.startsWith('photo-')){
  const e=s.editor;if(!e)return;captureEditor();const key=button.dataset.key;
  if(action==='photo-primary')e.primaryKey=key;
  if(action==='photo-remove'){
   const item=e.images.find(x=>x.key===key);if(item?.kind==='new')URL.revokeObjectURL(item.url);
   e.images=e.images.filter(x=>x.key!==key);if(e.primaryKey===key)e.primaryKey=e.images[0]?.key||'';
  }
  if(action==='photo-left'||action==='photo-right'){
   const at=e.images.findIndex(x=>x.key===key),next=at+(action==='photo-left'?-1:1);
   if(at>=0&&next>=0&&next<e.images.length)[e.images[at],e.images[next]]=[e.images[next],e.images[at]];
  }
  refreshEditorPhotos();return;
 }
 if(['toggle-publication','toggle-reserve','hide-product','archive-product','delete-product'].includes(action))return await productOp(id,action);
 if(action==='toggle-category'){
  const category=s.ownerData.categories.find(x=>x.id===id);if(!category)return;
  await requireOwnerOp(async()=>{await api.toggleCategory(category);toast('Categoria atualizada.');});return;
 }
});
initial();
