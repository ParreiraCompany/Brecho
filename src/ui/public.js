import {icon,escapeHtml as h,money,route,AVAILABILITY,cleanText,CONDITIONS,DEFAULT_CATEGORIES,digits,waLink} from '../lib/utils.js';

function brand(s) {
 return `<a href="${route('')}" class="brand" aria-label="Voltar ao início"><span class="brand-mark">P<span>✦</span></span><span class="brand-word"><b>${h(s.settings.store_name || 'Brechó Parreira')}</b><small>MODA COM HISTÓRIA</small></span></a>`;
}
export function siteHeader(s) {
 const r=s.path || '';
 return `<div class="top-notice"><span>CURADORIA DE PEÇAS ESPECIAIS</span><span class="top-notice-right">UM NOVO CAPÍTULO PARA CADA ESTILO &nbsp; ✦</span></div>
 <header class="site-header"><div class="container header-inner">
  ${brand(s)}
  <nav class="desktop-nav" aria-label="Menu principal">
   <a class="${!r?'active':''}" href="${route('')}">Início</a>
   <a class="${r.startsWith('catalogo')?'active':''}" href="${route('catalogo')}">Catálogo</a>
   <a href="${route('categorias')}">Categorias</a>
   <a href="${route('sobre')}">Sobre nós</a>
   <a href="${route('contato')}">Contato</a>
  </nav>
  <div class="header-actions">
   <a class="header-icon" href="${route('catalogo')}" aria-label="Pesquisar no catálogo">${icon('search',20)}</a>
   <a class="header-icon bag-icon" href="${route('sacola')}" aria-label="Sacola com ${s.cart.length} peças">${icon('bag',22)}${s.cart.length?`<span class="cart-count">${s.cart.length}</span>`:''}</a>
   <button class="header-icon mobile-menu-button" type="button" data-action="toggle-menu" aria-label="Abrir menu">${icon(s.menuOpen?'close':'menu',23)}</button>
  </div>
 </div>${s.menuOpen?`<nav class="mobile-nav"><a href="${route('')}">Início</a><a href="${route('catalogo')}">Catálogo</a><a href="${route('categorias')}">Categorias</a><a href="${route('sobre')}">Sobre nós</a><a href="${route('contato')}">Contato</a><a href="${route('owner/login')}">Área dos proprietários</a></nav>`:''}</header>`;
}
export function footer(s) {
 const w=s.settings.whatsapp_number;
 return `<footer class="footer"><div class="container"><div class="footer-top">
 <div class="footer-intro"><div class="footer-brand">BRECHÓ <span>PARREIRA.</span></div><p>Mais do que vestir, é dar espaço a novas histórias. Estilo que permanece.</p><div class="footer-mini">ESTILO CONSCIENTE &nbsp; ✦ &nbsp; PEÇAS SELECIONADAS</div></div>
 <div class="footer-links"><h4>EXPLORAR</h4><a href="${route('')}">Página inicial</a><a href="${route('catalogo')}">Todas as peças</a><a href="${route('categorias')}">Categorias</a><a href="${route('sobre')}">Nossa essência</a></div>
 <div class="footer-links"><h4>INFORMAÇÕES</h4><a href="${route('contato')}">Contato e entregas</a><a href="${route('privacidade')}">Privacidade</a>${w?`<a target="_blank" rel="noopener noreferrer" href="${waLink(w,'Olá! Gostaria de conversar com o Brechó Parreira.')}">WhatsApp</a>`:''}${s.settings.instagram_url?`<a href="${h(s.settings.instagram_url)}" rel="noopener noreferrer" target="_blank">Instagram</a>`:''}</div>
 <div class="footer-links"><h4>ACOMPANHE</h4><p>Cada peça tem uma história esperando para continuar.</p><a href="${route('contato')}" class="footer-contact">Fale com a gente ${icon('arrow',16)}</a></div>
 </div><div class="footer-bottom"><span>© ${new Date().getFullYear()} ${h(s.settings.store_name)}. Todos os direitos reservados.</span><span><a href="${route('owner/login')}">ÁREA DOS PROPRIETÁRIOS</a> &nbsp; · &nbsp; FEITO COM CUIDADO</span></div></div></footer>`;
}

function photoCard(p) {
 const photo=p.images?.[0]?.url;
 return photo ? `<img src="${h(photo)}" loading="lazy" alt="${h(p.images?.[0]?.alt_text||p.name)}">` : `<div class="photo-placeholder"><span>P</span><small>FOTOGRAFIA INDISPONÍVEL</small></div>`;
}
export function productCard(p,s) {
 const cat=s.categories.find(c=>c.id===p.category_id)?.name || 'Peça especial';
 const disabled=p.availability_status!=='available'||p.quantity<1;
 return `<article class="product-card"><a href="${route('produto/'+p.slug)}" class="product-image" aria-label="Ver detalhes: ${h(p.name)}">
 ${photoCard(p)}
 ${p.availability_status==='reserved'?'<span class="image-badge unavailable">RESERVADO</span>':p.availability_status==='sold'?'<span class="image-badge unavailable">VENDIDO</span>':p.featured?'<span class="image-badge">SELEÇÃO ESPECIAL</span>':''}
 </a><div class="product-card-info"><div class="product-category">${h(cat)} ${p.brand?`<span>• ${h(p.brand)}</span>`:''}</div>
 <a href="${route('produto/'+p.slug)}" class="product-title">${h(p.name)}</a>
 <div class="product-meta"><span>${p.size?'Tam. '+h(p.size):'Peça única'}</span><span class="product-price">${money(p.price_cents)}</span></div>
 <div class="product-actions"><a href="${route('produto/'+p.slug)}" class="text-link">VER DETALHES ${icon('arrow',16)}</a><button type="button" ${disabled?'disabled':''} data-action="add-cart" data-id="${h(p.id)}" class="quick-add" aria-label="${disabled?'Indisponível':'Adicionar à sacola'}">${icon(disabled?'close':'plus',18)}</button></div>
 </div></article>`;
}
export function renderGrid(products,s,kind='catalog') {
 if(s.loading) return `<div class="product-grid">${[1,2,3,4].map(()=>'<div class="skeleton-card"><div></div><span></span><span></span></div>').join('')}</div>`;
 if(!products.length) return `<div class="empty-collection">${icon('search',33)}<h3>${s.products.length?'Nenhuma peça encontrada':'Nossa coleção está começando'}</h3><p>${s.products.length?'Tente ajustar sua busca ou limpar os filtros.':'Em breve, novas peças cuidadosamente selecionadas aparecerão por aqui.'}</p>${kind==='catalog'&&s.products.length?`<button class="btn btn-outline" type="button" data-action="clear-filters">Limpar filtros</button>`:''}</div>`;
 return `<div class="product-grid">${products.map(p=>productCard(p,s)).join('')}</div>`;
}
function sectionHeading(eyebrow,title,linkLabel='',link='') {
 return `<div class="section-heading"><div><p class="eyebrow">${eyebrow}</p><h2>${title}</h2></div>${link?`<a href="${route(link)}" class="heading-link">${linkLabel} ${icon('arrow',18)}</a>`:''}</div>`;
}
export function homePage(s) {
 const recent=s.products.filter(p=>s.settings.show_sold||p.availability_status!=='sold').slice(0,8);
 const featured=s.products.filter(p=>p.featured && (s.settings.show_sold||p.availability_status!=='sold')).slice(0,4);
 const picks=featured.length?featured:recent.slice(0,4);
 const categories=(s.categories.length?s.categories.map(c=>c.name):DEFAULT_CATEGORIES);
 const displayCategories=['Vestidos','Calças','Camisas','Jaquetas','Bolsas','Acessórios'].filter(cat=>categories.includes(cat)).slice(0,6);
 return `<main><section class="hero"><div class="container hero-layout"><div class="hero-content">
 <div class="hero-eyebrow"><span class="mini-star">✳</span> UMA NOVA FORMA DE VESTIR</div>
 <h1>Estilo com uma <em>nova história.</em></h1>
 <p>Peças especiais, escolhas conscientes e a liberdade de encontrar seu próprio estilo. Descubra o que está esperando por você.</p>
 <div class="hero-buttons"><a href="${route('catalogo')}" class="btn btn-dark">EXPLORAR CATÁLOGO ${icon('arrow',19)}</a><a href="${route('sobre')}" class="btn btn-underline">CONHEÇA NOSSA HISTÓRIA</a></div>
 <div class="hero-side-note"><span class="little-dash"></span> PRECIOSIDADES QUE MERECEM CONTINUAR</div>
 </div><div class="hero-visual"><div class="hero-image" role="img" aria-label="Composição editorial de moda e peças selecionadas"><div class="hero-image-overlay"></div><span class="hero-number">EST. &nbsp; PARREIRA</span><div class="hero-visual-label">O SEU PRÓXIMO<br><em>achado</em> ESTÁ AQUI</div></div><div class="hero-art-stamp">MODA<br><span>✦</span><br>CIRCULAR</div></div></div></section>
 <section class="principles"><div class="container principles-grid"><div>${icon('sparkle',22)}<span>PEÇAS COM PERSONALIDADE</span></div><div>${icon('recycle',23)}<span>UM NOVO CICLO PARA A MODA</span></div><div>${icon('heart',23)}<span>ESCOLHAS FEITAS COM CARINHO</span></div></div></section>
 <section class="section container categories-section">${sectionHeading('EXPLORE SEU ESTILO','Cada peça, uma <em>possibilidade.</em>','VER TODAS','categorias')}
 <div class="categories-grid">${displayCategories.length?displayCategories.map((cat,i)=>`<a href="${route('catalogo')}?categoria=${encodeURIComponent(cat)}" data-category-link="${h(cat)}" class="category-tile category-${i+1}"><span class="category-index">0${i+1} / COLEÇÃO</span><span class="category-decoration">${['✳','⌁','✦','◌','❋','◇'][i]}</span><strong>${h(cat)}</strong><span class="category-arrow">${icon('arrow',18)}</span></a>`).join(''):'<p class="muted">Cadastre categorias para começar.</p>'}</div></section>
 <section class="section light-section"><div class="container">${sectionHeading('ACABARAM DE CHEGAR','Novidades na <em>vitrine.</em>','VER CATÁLOGO COMPLETO','catalogo')}${renderGrid(recent,s,'home')}</div></section>
 <section class="manifesto"><div class="container manifesto-layout"><div class="manifesto-graphic"><span class="manifesto-badge">P</span><span>O EXTRAORDINÁRIO<br>ESTÁ NOS DETALHES.</span></div><div class="manifesto-copy"><p class="eyebrow">NOSSA ESSÊNCIA</p><h2>O estilo muda.<br><em>O encanto fica.</em></h2><p>${h(s.settings.description)}</p><a class="btn btn-soft" href="${route('sobre')}">CONHEÇA O BRECHÓ ${icon('arrow',18)}</a></div></div></section>
 ${picks.length?`<section class="section container">${sectionHeading('CURADORIA PARREIRA','Peças em <em>destaque.</em>','EXPLORAR PEÇAS','catalogo')}${renderGrid(picks,s,'home')}</section>`:''}
 <section class="contact-banner container"><div><p class="eyebrow">ESTAMOS AQUI PARA AJUDAR</p><h2>Encontrou uma peça <em>especial?</em></h2><p>Converse conosco e confirme a disponibilidade. É simples, pessoal e sem complicação.</p></div><a href="${route('contato')}" class="btn btn-cream">FALE COM A GENTE ${icon('arrow',18)}</a></section>
 </main>`;
}
export function filterProducts(s) {
 let arr=s.products.filter(p=>s.settings.show_sold||p.availability_status!=='sold');
 const f=s.filters;
 if(f.search) { const q=cleanText(f.search);arr=arr.filter(p=>cleanText([p.name,p.brand,p.size,p.color,p.description,p.product_code,s.categories.find(c=>c.id===p.category_id)?.name].join(' ')).includes(q)); }
 if(f.category) arr=arr.filter(p=>p.category_id===f.category||s.categories.find(c=>c.id===p.category_id)?.name===f.category);
 if(f.size) arr=arr.filter(p=>p.size===f.size);
 if(f.brand) arr=arr.filter(p=>p.brand===f.brand);
 if(f.color) arr=arr.filter(p=>cleanText(p.color)===cleanText(f.color));
 if(f.condition) arr=arr.filter(p=>p.condition===f.condition);
 if(f.availability) arr=arr.filter(p=>p.availability_status===f.availability);
 if(f.min) arr=arr.filter(p=>p.price_cents>=Number(f.min)*100);
 if(f.max) arr=arr.filter(p=>p.price_cents<=Number(f.max)*100);
 const sorts={newest:(a,b)=>new Date(b.published_at)-new Date(a.published_at),price_asc:(a,b)=>a.price_cents-b.price_cents,price_desc:(a,b)=>b.price_cents-a.price_cents,name_asc:(a,b)=>a.name.localeCompare(b.name,'pt-BR'),name_desc:(a,b)=>b.name.localeCompare(a.name,'pt-BR')};
 return arr.sort(sorts[f.sort]||sorts.newest);
}
function selectOptions(values,selected,placeholder) {
 return `<option value="">${h(placeholder)}</option>${values.map(v=>`<option value="${h(v)}" ${selected===v?'selected':''}>${h(v)}</option>`).join('')}`;
}
export function filterFields(s) {
 const brands=[...new Set(s.products.map(p=>p.brand).filter(Boolean))].sort();
 const sizes=[...new Set(s.products.map(p=>p.size).filter(Boolean))].sort();
 const colors=[...new Set(s.products.map(p=>p.color).filter(Boolean))].sort();
 const f=s.filters;
 return `<div class="filters-content"><div class="filter-heading">REFINE SUA BUSCA ${icon('filter',17)}</div>
 <label class="filter-label">CATEGORIA<select data-filter="category">${selectOptions(s.categories.map(x=>x.name),f.category,'Todas as categorias')}</select></label>
 <label class="filter-label">FAIXA DE PREÇO</label><div class="price-range"><input aria-label="Preço mínimo" data-filter="min" type="number" min="0" placeholder="Mín. R$" value="${h(f.min)}"><span>—</span><input aria-label="Preço máximo" data-filter="max" type="number" min="0" placeholder="Máx. R$" value="${h(f.max)}"></div>
 <label class="filter-label">TAMANHO<select data-filter="size">${selectOptions(sizes,f.size,'Todos os tamanhos')}</select></label>
 <label class="filter-label">MARCA<select data-filter="brand">${selectOptions(brands,f.brand,'Todas as marcas')}</select></label>
 <label class="filter-label">COR<select data-filter="color">${selectOptions(colors,f.color,'Todas as cores')}</select></label>
 <label class="filter-label">CONSERVAÇÃO<select data-filter="condition">${selectOptions(CONDITIONS,f.condition,'Qualquer estado')}</select></label>
 <label class="filter-label">DISPONIBILIDADE<select data-filter="availability">${selectOptions(['available','reserved','sold'].filter(x=>x!=='sold'||s.settings.show_sold).map(x=>x),f.availability,'Todas as situações').replace('>available<','>Disponível<').replace('>reserved<','>Reservado<').replace('>sold<','>Vendido<')}</select></label>
 <button type="button" class="clear-link" data-action="clear-filters">LIMPAR TODOS OS FILTROS ${icon('close',14)}</button></div>`;
}
export function catalogPage(s) {
 const filtered=filterProducts(s);
 return `<main><section class="page-banner"><div class="container"><p class="eyebrow">ENCONTRE O SEU PRÓXIMO FAVORITO</p><h1>Nossa <em>coleção.</em></h1><p>Cada peça é única. Encontre aquela que combina com você.</p></div></section>
 <section class="catalog container"><div class="catalog-mobile-bar"><button class="btn btn-outline" data-action="show-filters">${icon('filter',17)} FILTRAR PEÇAS</button></div><aside class="catalog-sidebar ${s.filtersOpen?'filters-open':''}"><div class="mobile-filter-close"><strong>Filtros</strong><button class="icon-button" data-action="hide-filters">${icon('close',20)}</button></div>${filterFields(s)}<button class="btn btn-dark mobile-apply" data-action="hide-filters">VER RESULTADOS</button></aside>
 <div class="catalog-main"><div class="catalog-toolbar"><div class="search-field">${icon('search',20)}<input id="catalog-search" type="search" placeholder="Busque por peça, marca ou código..." data-filter="search" value="${h(s.filters.search)}" aria-label="Buscar peças"></div><label class="sort-label">ORDENAR POR <select data-filter="sort"><option value="newest" ${s.filters.sort==='newest'?'selected':''}>Mais recentes</option><option value="price_asc" ${s.filters.sort==='price_asc'?'selected':''}>Menor preço</option><option value="price_desc" ${s.filters.sort==='price_desc'?'selected':''}>Maior preço</option><option value="name_asc" ${s.filters.sort==='name_asc'?'selected':''}>Nome A–Z</option><option value="name_desc" ${s.filters.sort==='name_desc'?'selected':''}>Nome Z–A</option></select></label></div>
 <div class="result-count" id="catalog-count">${filtered.length} ${filtered.length===1?'peça encontrada':'peças encontradas'} <span>— Feitas para fazer parte da sua história.</span></div>
 <div id="product-results">${renderGrid(filtered.slice(0,s.displayLimit||12),s)}${filtered.length>(s.displayLimit||12)?`<button type="button" class="btn btn-outline load-more" data-action="load-more">CARREGAR MAIS PEÇAS ${icon('plus',17)}</button>`:''}</div></div></section></main>`;
}
export function categoriesPage(s) {
 return `<main><section class="page-banner"><div class="container"><p class="eyebrow">ENCONTRE POR CATEGORIA</p><h1>Explore <em>possibilidades.</em></h1><p>Seu próximo achado está a um clique.</p></div></section>
 <section class="section container"><div class="category-list">${s.categories.map((c,i)=>`<a class="category-list-card" href="${route('catalogo')}?categoria=${encodeURIComponent(c.name)}"><span class="category-count">${String(i+1).padStart(2,'0')}</span><h2>${h(c.name)}</h2><span>${s.products.filter(p=>p.category_id===c.id).length} peças</span>${icon('arrow',24)}</a>`).join('')||'<p class="muted">As categorias aparecerão após a configuração da loja.</p>'}</div></section></main>`;
}
export function productPage(s,slug) {
 const p=s.products.find(p=>p.slug===slug);
 if(!p) return `<main class="container simple-page">${icon('alert',38)}<h1>Esta peça não está disponível.</h1><p>Ela pode ter sido ocultada, removida ou ainda não publicada.</p><a href="${route('catalogo')}" class="btn btn-dark">VOLTAR AO CATÁLOGO</a></main>`;
 const photos=p.images||[];
 const photo=photos[s.galleryIndex]||photos[0];
 const cat=s.categories.find(c=>c.id===p.category_id)?.name||'Sem categoria';
 const disabled=p.availability_status!=='available'||p.quantity<1;
 const others=s.products.filter(x=>x.id!==p.id&&x.category_id===p.category_id).slice(0,4);
 return `<main class="container"><div class="breadcrumbs"><a href="${route('')}">Início</a> / <a href="${route('catalogo')}">Catálogo</a> / <span>${h(p.name)}</span></div>
 <div class="details-layout"><div class="details-gallery"><div class="details-main-photo">${photo?.url?`<img src="${h(photo.url)}" alt="${h(photo.alt_text||p.name)}" data-action="zoom-photo">`:'<div class="photo-placeholder"><span>P</span></div>'}${photos.length>1?`<button class="gallery-arrow gallery-prev" data-action="gallery-prev">${icon('left',21)}</button><button class="gallery-arrow gallery-next" data-action="gallery-next">${icon('right',21)}</button>`:''}</div><div class="photo-thumbnails">${photos.map((photo,i)=>`<button class="thumbnail ${s.galleryIndex===i?'selected':''}" type="button" data-action="gallery-select" data-index="${i}"><img alt="Foto ${i+1}" src="${h(photo.url)}"></button>`).join('')}</div></div>
 <div class="details-info"><p class="eyebrow">${h(cat)} / ${h(p.product_code)}</p><h1>${h(p.name)}</h1><div class="details-price">${money(p.price_cents)}</div><div class="details-status ${disabled?'off':''}"><span class="status-dot"></span>${disabled?(AVAILABILITY[p.availability_status]||'Indisponível'):'Peça disponível para consulta'}</div><div class="details-divider"></div>
 <dl class="product-specs"><div><dt>MARCA</dt><dd>${h(p.brand||'Não informada')}</dd></div><div><dt>TAMANHO</dt><dd>${h(p.size||'Não informado')}</dd></div><div><dt>COR</dt><dd>${h(p.color||'Não informada')}</dd></div><div><dt>CONSERVAÇÃO</dt><dd>${h(p.condition)}</dd></div><div><dt>CÓDIGO</dt><dd>${h(p.product_code)}</dd></div></dl>
 ${p.description?`<div class="details-desc"><h3>SOBRE ESTA PEÇA</h3><p>${h(p.description)}</p></div>`:''}
 ${Object.keys(p.measures||{}).some(k=>p.measures[k])?`<div class="details-desc"><h3>MEDIDAS (CM)</h3><p>${Object.entries(p.measures).filter(([,v])=>v).map(([k,v])=>`${h(k)}: ${h(v)}`).join(' · ')}</p></div>`:''}
 <button type="button" class="btn btn-dark btn-full add-details" data-action="add-cart" data-id="${h(p.id)}" ${disabled?'disabled':''}>${icon('bag',20)} ${disabled?'PEÇA INDISPONÍVEL':'ADICIONAR À SACOLA'}</button>
 <div class="details-secondary"><button type="button" data-action="consult-product" data-id="${h(p.id)}">${icon('whatsapp',20)} Consultar pelo WhatsApp</button><button type="button" data-action="share-product" data-id="${h(p.id)}">${icon('link',19)} Compartilhar</button></div>
 <div class="details-notice">O envio de uma solicitação não garante a reserva. A disponibilidade será confirmada pela loja.</div>
 </div></div>${others.length?`<section class="section">${sectionHeading('VOCÊ TAMBÉM PODE GOSTAR','Na mesma <em>vibe.</em>')}${renderGrid(others,s)}</section>`:''}</main>`;
}
export function bagPage(s) {
 const items=s.cart.map(id=>s.products.find(p=>p.id===id)).filter(Boolean);
 const valid=items.filter(p=>p.quantity>0&&p.availability_status==='available');
 const total=valid.reduce((sum,p)=>sum+p.price_cents,0);
 return `<main class="container bag-page"><div class="breadcrumbs"><a href="${route('')}">Início</a> / Sacola</div><div class="section-heading"><div><p class="eyebrow">SEUS ACHADOS</p><h1>Sua <em>sacola.</em></h1></div></div>
 ${!items.length?`<div class="empty-collection bag-empty">${icon('bag',36)}<h3>Um mundo de possibilidades aguarda você.</h3><p>Sua sacola está vazia. Explore nossa coleção e escolha suas peças favoritas.</p><a class="btn btn-dark" href="${route('catalogo')}">EXPLORAR CATÁLOGO ${icon('arrow',17)}</a></div>`:
 `<div class="bag-layout"><div class="bag-items">${items.map(p=>`<div class="bag-item"><a class="bag-photo" href="${route('produto/'+p.slug)}">${photoCard(p)}</a><div class="bag-item-description"><span class="eyebrow">${h(p.product_code)}</span><h3><a href="${route('produto/'+p.slug)}">${h(p.name)}</a></h3><p>Tamanho: ${h(p.size||'Não informado')}</p>${p.availability_status!=='available'||p.quantity<1?'<span class="bag-invalid">Peça indisponível — não será incluída no pedido</span>':''}<strong>${money(p.price_cents)}</strong></div><button type="button" class="icon-button remove-item" data-action="remove-cart" data-id="${h(p.id)}" aria-label="Remover peça">${icon('trash',19)}</button></div>`).join('')}<button class="clear-link" type="button" data-action="clear-cart">ESVAZIAR SACOLA</button></div>
 <aside class="bag-summary"><p class="eyebrow">RESUMO DO PEDIDO</p><h2>Sua seleção.</h2><div class="summary-line"><span>Peças disponíveis</span><strong>${valid.length}</strong></div><div class="summary-line"><span>Entrega</span><span>A combinar</span></div><div class="summary-total"><span>Subtotal</span><strong>${money(total)}</strong></div><p class="bag-warning">O envio da solicitação não garante reserva. Confirme disponibilidade e retirada ou entrega pelo WhatsApp.</p><button class="btn btn-dark btn-full" type="button" data-action="checkout" ${!valid.length?'disabled':''}>${icon('whatsapp',18)} FINALIZAR PELO WHATSAPP</button><a href="${route('catalogo')}" class="under-button">CONTINUAR EXPLORANDO ${icon('arrow',16)}</a></aside></div>`}</main>`;
}
export function aboutPage(s) {
 return `<main><section class="page-banner"><div class="container"><p class="eyebrow">O QUE NOS MOVE</p><h1>Moda para <em>continuar.</em></h1><p>Porque uma boa peça não precisa de uma única história.</p></div></section><section class="container about-content"><div class="about-art"><span>BEAUTY IN<br>SECOND CHANCES.</span><b>P.</b></div><div><p class="eyebrow">SOBRE O BRECHÓ PARREIRA</p><h2>Encontramos beleza nas <em>novas possibilidades.</em></h2><p>${h(s.settings.description)}</p><p>Conheça a seleção disponível no catálogo e fale diretamente com nossa equipe para tirar dúvidas sobre as peças.</p><a class="btn btn-dark" href="${route('catalogo')}">CONHECER NOSSAS PEÇAS ${icon('arrow',18)}</a></div></section></main>`;
}
export function contactPage(s) {
 const num=s.settings.whatsapp_number;
 return `<main><section class="page-banner"><div class="container"><p class="eyebrow">TIRE SUAS DÚVIDAS</p><h1>Vamos <em>conversar?</em></h1><p>Estamos disponíveis para ajudar você a encontrar a peça certa.</p></div></section>
 <section class="container contact-columns"><div><h2>Atendimento direto,<br><em>sem complicação.</em></h2><p>Envie uma mensagem pelo WhatsApp para consultar disponibilidade, combinar retirada ou saber mais sobre entregas.</p>${num?`<a href="${waLink(num,'Olá! Gostaria de mais informações sobre o Brechó Parreira.') }" target="_blank" rel="noopener noreferrer" class="btn btn-dark">${icon('whatsapp',20)} CONVERSAR NO WHATSAPP</a>`:'<div class="info-box">O WhatsApp comercial ainda não foi configurado pelos proprietários.</div>'}</div><div class="contact-facts"><div>${icon('bag',22)}<div><strong>RESERVAS</strong><p>Solicitações não garantem reserva. A confirmação é feita diretamente pela nossa equipe.</p></div></div><div>${icon('truck',22)}<div><strong>RETIRADA E ENTREGA</strong><p>${h(s.settings.pickup_info||s.settings.delivery_info||'As opções e custos são combinados diretamente pelo atendimento.')}</p></div></div>${s.settings.business_hours?`<div>${icon('calendar',22)}<div><strong>HORÁRIO DE ATENDIMENTO</strong><p>${h(s.settings.business_hours)}</p></div></div>`:''}${s.settings.instagram_url?`<div>${icon('instagram',22)}<div><strong>INSTAGRAM</strong><p><a target="_blank" rel="noopener noreferrer" href="${h(s.settings.instagram_url)}">Acompanhe nossas novidades</a></p></div></div>`:''}</div></section></main>`;
}
export function privacyPage() {
 return `<main class="container legal-page"><p class="eyebrow">INFORMAÇÕES IMPORTANTES</p><h1>Privacidade e <em>transparência.</em></h1><p>O Brechó Parreira utiliza esta vitrine para exibir produtos e facilitar consultas por WhatsApp. O visitante não precisa criar uma conta para navegar.</p><p>A sacola é armazenada localmente no próprio navegador. Ao escolher o WhatsApp, uma mensagem é preparada e a conversa só é iniciada quando você decidir enviá-la. A conversa e o tratamento dos dados pelo WhatsApp obedecem também às regras dessa plataforma.</p><p>As contas administrativas são restritas aos responsáveis pela loja. Informações sobre produtos e configurações da vitrine são armazenadas no serviço de banco de dados contratado.</p><p><strong>Antes de publicar comercialmente:</strong> os responsáveis devem revisar e complementar esta página com informações reais de contato, retenção de dados e demais requisitos legais aplicáveis. Este texto informativo não substitui uma política de privacidade definitiva.</p></main>`;
}
