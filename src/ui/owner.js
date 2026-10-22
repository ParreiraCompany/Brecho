import {icon,escapeHtml as h,money,priceInput,dateBR,CONDITIONS,AVAILABILITY,route,cleanText} from '../lib/utils.js';

const menu=[['owner','grid','Visão geral'],['owner/produtos','bag','Produtos'],['owner/novo','plus','Adicionar peça'],['owner/categorias','list','Categorias'],['owner/historico','calendar','Histórico de alterações'],['owner/configuracoes','settings','Configurações da vitrine']];
export function loginPage(s) {
 return `<main class="auth-screen"><div class="auth-side"><a href="${route('')}" class="auth-logo">P<span>✦</span></a><p>BRECHÓ PARREIRA</p><h1>Seu espaço de<br><em>curadoria.</em></h1><div class="auth-flourish">✳ &nbsp; ORGANIZE. PUBLIQUE. INSPIRE.</div></div><div class="auth-form-area"><a href="${route('')}" class="auth-back">${icon('back',17)} VOLTAR À LOJA</a><div class="auth-form-box"><p class="eyebrow">ÁREA RESERVADA</p><h2>Bem-vindo de volta.</h2><p class="auth-subtitle">Acesso exclusivo aos dois proprietários do Brechó Parreira.</p>
 ${s.profile?`<div class="info-box">Você já está conectado como <b>${h(s.profile.display_name)}</b>.</div><a href="${route('owner')}" class="btn btn-dark btn-full">ABRIR MEU PAINEL ${icon('arrow',17)}</a>`:
 `<form id="login-form" class="auth-form"><label>E-MAIL<input type="email" name="email" autocomplete="username" placeholder="seu@email.com" required></label><label>SENHA<input type="password" name="password" autocomplete="current-password" placeholder="Sua senha" minlength="6" required></label><button type="submit" ${s.busy?'disabled':''} class="btn btn-dark btn-full">${icon('lock',18)} ${s.busy?'ENTRANDO...':'ENTRAR COM SEGURANÇA'}</button></form><p class="auth-recovery">Para recuperar sua senha, peça a redefinição pelo painel de autenticação do Supabase.</p>`}
 ${!s.configured?`<div class="setup-note">${icon('alert',19)} <div>O banco ainda não foi conectado. Para ativar o acesso real, configure <b>src/config.js</b> conforme <b>docs/CONFIGURACAO.md</b>. Não existe senha de demonstração.</div></div>`:''}
 <div class="auth-security">${icon('shield',18)} AMBIENTE EXCLUSIVO DOS RESPONSÁVEIS</div></div></div></main>`;
}
export function ownerShell(s,body) {
 const path=s.path;
 return `<div class="owner-app"><aside class="owner-sidebar"><a href="${route('')}"><div class="owner-side-brand"><span class="owner-side-monogram">P</span><span><b>BRECHÓ PARREIRA</b><small>PAINEL DE GESTÃO</small></span></div></a><p class="side-section">MENU PRINCIPAL</p>
 <nav class="owner-nav">${menu.map(([href,ic,name])=>`<a href="${route(href)}" class="${path===href||path==='owner/editar'&&href==='owner/produtos'?'selected':''}">${icon(ic,19)} ${h(name)}</a>`).join('')}</nav>
 <div class="side-bottom"><a href="${route('')}" class="view-store">${icon('eye',18)} Visualizar loja ${icon('arrow',16)}</a><div class="side-user"><span class="side-avatar">${h(s.profile?.display_name?.charAt(0)||'P')}</span><div><strong>${h(s.profile?.display_name||'Proprietário')}</strong><small>OWNER · ATIVO</small></div><button data-action="logout" class="icon-button" aria-label="Sair">${icon('logout',18)}</button></div></div></aside>
 <div class="owner-main"><header class="owner-topbar"><div class="owner-topbar-label"><span class="owner-online-dot"></span> PAINEL DE CONTROLE &nbsp; / &nbsp; ${h((menu.find(x=>x[0]===path)||[])[2]||'Editar produto')}</div><div class="owner-top-actions"><a href="${route('')}" target="_blank" rel="noopener">VER LOJA ${icon('arrow',15)}</a><span class="owner-top-avatar">${h(s.profile?.display_name?.charAt(0)||'P')}</span></div></header>
 <div class="owner-mobile-nav">${menu.slice(0,4).map(([href,ic,name])=>`<a class="${path===href?'selected':''}" href="${route(href)}">${icon(ic,17)}<span>${h(name)}</span></a>`).join('')}<a href="${route('owner/configuracoes')}">${icon('settings',17)}<span>Config.</span></a></div>
 <div class="owner-workspace">${body}</div></div></div>`;
}
function ownerHeading(kicker,title,subtitle,action=false) {
 return `<div class="owner-heading"><div><p class="eyebrow">${kicker}</p><h1>${title}</h1><p>${subtitle}</p></div>${action?`<a href="${route('owner/novo')}" class="btn btn-dark">${icon('plus',19)} ADICIONAR PRODUTO</a>`:''}</div>`;
}
export function dashboardPage(s) {
 const p=s.ownerData.products;
 const metrics=[['Peças cadastradas',p.length,'box'],['Publicadas',p.filter(x=>x.publication_status==='published'&&!x.archived_at).length,'eye'],['Disponíveis',p.filter(x=>x.availability_status==='available'&&x.quantity>0&&!x.archived_at).length,'check'],['Reservadas',p.filter(x=>x.availability_status==='reserved'&&!x.archived_at).length,'calendar'],['Vendidas',p.filter(x=>x.availability_status==='sold'&&!x.archived_at).length,'bag'],['Rascunhos',p.filter(x=>x.publication_status==='draft'&&!x.archived_at).length,'edit'],['Ocultas',p.filter(x=>x.publication_status==='hidden'&&!x.archived_at).length,'eyeoff'],['Arquivadas',p.filter(x=>x.archived_at).length,'box']];
 return `${ownerHeading('VISÃO GERAL',`Olá, ${h(s.profile?.display_name?.split(' ')[0]||'proprietário')}.`,'Tudo em um só lugar para cuidar de cada peça.',true)}
 <div class="metric-grid">${metrics.map(([name,count,ic],i)=>`<div class="metric-card"><div class="metric-icon ${i===1?'metric-emphasis':''}">${icon(ic,21)}</div><strong>${count}</strong><span>${name}</span></div>`).join('')}</div>
 <div class="dashboard-sections"><section class="owner-panel"><div class="panel-heading"><div><h2>Últimas peças</h2><p>Acompanhe o catálogo mais recente.</p></div><a href="${route('owner/produtos')}">VER TODAS ${icon('arrow',16)}</a></div>${smallTable(p.slice(0,5),s)}</section>
 <section class="owner-panel dashboard-help"><p class="eyebrow">GESTÃO SIMPLIFICADA</p><h2>Pronto para uma nova descoberta?</h2><p>Adicione roupas, escolha as fotografias, defina os valores e publique diretamente no catálogo.</p><a href="${route('owner/novo')}" class="btn btn-dark">${icon('plus',18)} CADASTRAR UMA PEÇA</a><div class="dashboard-help-bottom">${icon('shield',20)} As alterações exigem autorização de um dos dois proprietários.</div></section></div>`;
}
function thumb(p) {return p.images?.[0]?.url?`<img src="${h(p.images[0].url)}" alt="${h(p.name)}" loading="lazy">`:`<div class="admin-no-img">${icon('image',22)}</div>`;}
function availabilityChip(p) {
 const label=p.archived_at?'Arquivada':p.publication_status==='draft'?'Rascunho':p.publication_status==='hidden'?'Oculta':AVAILABILITY[p.availability_status]||'—';
 const status=p.archived_at?'neutral':p.publication_status==='published'&&p.availability_status==='available'?'good':p.availability_status==='sold'?'sold':'neutral';
 return `<span class="status-chip ${status}"><i></i>${label}</span>`;
}
function smallTable(products,s) {
 if(!products.length) return `<div class="admin-empty">${icon('box',30)}<p>Nenhuma peça cadastrada ainda.</p><a href="${route('owner/novo')}">Cadastre a primeira peça ${icon('arrow',15)}</a></div>`;
 return `<div class="table-scroll"><table class="owner-table"><thead><tr><th>PRODUTO</th><th>CÓDIGO</th><th>PREÇO</th><th>STATUS</th><th></th></tr></thead><tbody>${products.map(p=>`<tr><td><div class="admin-product"><div class="admin-thumb">${thumb(p)}</div><div><strong>${h(p.name)}</strong><small>${h(s.ownerData.categories.find(c=>c.id===p.category_id)?.name||'Sem categoria')}</small></div></div></td><td class="mono">${h(p.product_code)}</td><td class="price-cell">${money(p.price_cents)}</td><td>${availabilityChip(p)}</td><td><a class="table-action" href="${route('owner/editar/'+p.id)}" aria-label="Editar ${h(p.name)}">${icon('edit',17)}</a></td></tr>`).join('')}</tbody></table></div>`;
}
export function ownerProductsPage(s) {
 let products=[...s.ownerData.products];
 if(s.adminSearch) products=products.filter(p=>cleanText(p.name+' '+p.product_code+' '+p.brand).includes(cleanText(s.adminSearch)));
 if(s.adminStatus) products=products.filter(p=>s.adminStatus==='archived'?p.archived_at:s.adminStatus==='draft'?p.publication_status==='draft':s.adminStatus==='hidden'?p.publication_status==='hidden':p.availability_status===s.adminStatus&&!p.archived_at);
 return `${ownerHeading('SEU INVENTÁRIO','Gerenciar produtos','Todas as peças cadastradas, informações e disponibilidade.',true)}
 <div class="owner-panel admin-table-panel"><div class="owner-product-toolbar"><div class="search-field admin-search">${icon('search',19)}<input id="admin-product-search" placeholder="Buscar por nome, marca ou código BP..." type="search" data-admin-search value="${h(s.adminSearch)}"></div><select data-admin-status aria-label="Filtrar situação"><option value="">Todos os status</option>${[['available','Disponíveis'],['reserved','Reservadas'],['sold','Vendidas'],['draft','Rascunhos'],['hidden','Ocultas'],['archived','Arquivadas']].map(([v,t])=>`<option value="${v}" ${s.adminStatus===v?'selected':''}>${t}</option>`).join('')}</select></div>
 <div class="admin-results-count">${products.length} peças</div><div id="admin-product-list">${adminProductTable(products,s)}</div></div>`;
}
export function adminProductTable(products,s) {
 if(!products.length) return `<div class="admin-empty">${icon('search',30)}<p>Nenhum produto corresponde à busca.</p></div>`;
 return `<div class="table-scroll"><table class="owner-table"><thead><tr><th>PRODUTO</th><th>CÓDIGO</th><th>TAMANHO</th><th>PREÇO</th><th>QTD.</th><th>SITUAÇÃO</th><th>ATUALIZAÇÃO</th><th>AÇÕES</th></tr></thead><tbody>${products.map(p=>`<tr><td><div class="admin-product"><div class="admin-thumb">${thumb(p)}</div><div><strong>${h(p.name)}</strong><small>${h(s.ownerData.categories.find(c=>c.id===p.category_id)?.name||'Sem categoria')}</small></div></div></td><td class="mono">${h(p.product_code)}</td><td>${h(p.size||'—')}</td><td class="price-cell">${money(p.price_cents)}</td><td>${p.quantity}</td><td>${availabilityChip(p)}</td><td>${dateBR(p.updated_at)}</td><td class="table-buttons"><a class="table-action" title="Editar" href="${route('owner/editar/'+p.id)}">${icon('edit',17)}</a><button class="table-action" title="${p.publication_status==='published'?'Ocultar':'Publicar'}" data-action="toggle-publication" data-id="${h(p.id)}">${icon(p.publication_status==='published'?'eyeoff':'eye',17)}</button><button class="table-action" title="Marcar como ${p.availability_status==='available'?'reservada':'disponível'}" data-action="toggle-reserve" data-id="${h(p.id)}">${icon('calendar',17)}</button></td></tr>`).join('')}</tbody></table></div>`;
}
function field(label,name,value,type='text',attrs='') {
 return `<label class="form-field"><span>${label}</span><input name="${name}" type="${type}" value="${h(value??'')}" ${attrs}></label>`;
}
function selectField(label,name,items,value,placeholder='Selecionar') {
 return `<label class="form-field"><span>${label}</span><select name="${name}">${placeholder?`<option value="">${placeholder}</option>`:''}${items.map(item=>{let id=Array.isArray(item)?item[0]:item;let name=Array.isArray(item)?item[1]:item;return `<option value="${h(id)}" ${id===value?'selected':''}>${h(name)}</option>`}).join('')}</select></label>`;
}
export function editorPhotos(s) {
 const e=s.editor;
 return `<div class="editor-photos">${e.images.map((img,index)=>`<div class="editor-photo ${e.primaryKey===img.key?'main':''}"><img src="${h(img.url)}" alt="Foto ${index+1}"><div class="editor-photo-actions"><button type="button" data-action="photo-primary" data-key="${h(img.key)}">${e.primaryKey===img.key?icon('star',15)+' PRINCIPAL':'DEFINIR PRINCIPAL'}</button><div><button type="button" data-action="photo-left" data-key="${h(img.key)}" title="Mover para esquerda">‹</button><button type="button" data-action="photo-right" data-key="${h(img.key)}" title="Mover para direita">›</button><button type="button" data-action="photo-remove" data-key="${h(img.key)}" title="Remover foto">×</button></div></div></div>`).join('')}
 ${e.images.length<10?`<label class="editor-upload">${icon('upload',25)}<strong>Adicionar fotos</strong><small>JPG, PNG ou WebP · Até 8 MB cada</small><input id="product-photos-input" type="file" accept="image/jpeg,image/png,image/webp" multiple></label>`:''}</div><p class="editor-photo-help">Arraste o olhar para a peça: escolha a imagem principal e use as setas para ordenar. Até 10 fotos.</p>`;
}
export function productEditorPage(s,id='') {
 const current=id?s.ownerData.products.find(p=>p.id===id):null;
 if(id&&!current) return ownerHeading('PRODUTO NÃO ENCONTRADO','Peça indisponível','Não encontramos o produto solicitado.');
 const v=s.editor?.draft||current||{};
 const pics=s.editor?.images||[];
 return `${ownerHeading('CURADORIA & CADASTRO',current?'Editar produto':'Adicionar nova peça',current?`Atualize os detalhes de ${h(current.product_code)} sem criar duplicatas.`:'Preencha os detalhes abaixo para apresentar a peça ao mundo.')}
 <form id="product-form"><div class="editor-layout"><div class="editor-content">
 <section class="owner-panel editor-block"><div class="block-heading"><span class="block-number">01</span><div><h2>Identificação da peça</h2><p>Comece pelo que torna esta peça especial.</p></div></div>
 <div class="form-grid">${field('NOME DA PEÇA *','name',v.name,'text','required minlength="2" maxlength="140" placeholder="Ex.: Jaqueta jeans vintage"')}
 ${selectField('CATEGORIA','category_id',s.ownerData.categories.filter(x=>x.active||x.id===v.category_id).map(x=>[x.id,x.name]),v.category_id)}
 ${field('MARCA','brand',v.brand,'text','maxlength="100" placeholder="Ex.: Levi’s"')}
 ${field('TAMANHO','size',v.size,'text','maxlength="50" placeholder="Ex.: M, 38, 42..."')}
 ${field('COR','color',v.color,'text','maxlength="90" placeholder="Ex.: Azul-marinho"')}
 ${selectField('ESTADO DE CONSERVAÇÃO','condition',CONDITIONS,v.condition||'Excelente estado','')}
 </div></section>
 <section class="owner-panel editor-block"><div class="block-heading"><span class="block-number">02</span><div><h2>Fotografias</h2><p>Fotos reais e bem iluminadas valorizam cada detalhe.</p></div></div><div id="editor-photos-wrapper">${editorPhotos(s)}</div></section>
 <section class="owner-panel editor-block"><div class="block-heading"><span class="block-number">03</span><div><h2>Preço e disponibilidade</h2><p>Estabeleça um valor e gerencie a situação da peça.</p></div></div>
 <div class="form-grid">${field('PREÇO DE VENDA (R$) *','price',v.price??priceInput(v.price_cents),'text','required inputmode="decimal" placeholder="89,90"')}
 ${field('QUANTIDADE *','quantity',v.quantity??1,'number','required min="0" max="100000" step="1"')}
 ${selectField('DISPONIBILIDADE','availability_status',[['available','Disponível'],['reserved','Reservado'],['sold','Vendido']],v.availability_status||'available','')}
 </div></section>
 <section class="owner-panel editor-block"><div class="block-heading"><span class="block-number">04</span><div><h2>Descrição e medidas</h2><p>Conte mais sobre as características da peça.</p></div></div>
 <label class="form-field"><span>DESCRIÇÃO</span><textarea name="description" rows="4" maxlength="4000" placeholder="Material, caimento, detalhes, observações...">${h(v.description||'')}</textarea></label>
 <div class="form-grid measures-grid">${['Comprimento','Largura','Cintura','Quadril','Busto','Outras'].map(k=>field(k.toUpperCase()+' (CM)','measure_'+k,v.measures?.[k]||'','text','placeholder="Opcional" maxlength="40"')).join('')}</div>
 </section></div><aside class="editor-aside"><div class="owner-panel editor-publish"><p class="eyebrow">PRONTO PARA COMPARTILHAR?</p><h2>Publicação</h2><p>O rascunho fica visível somente para os proprietários.</p>
 <label class="checkbox-row"><input type="checkbox" name="featured" ${v.featured?'checked':''}><span>Destacar na página inicial</span></label>
 <div class="editor-preview"><span>PRÉVIA DA PEÇA</span><div>${pics[0]?.url?`<img src="${h(pics.find(x=>x.key===s.editor?.primaryKey)?.url||pics[0].url)}" alt="Prévia">`:`<div class="admin-no-img">${icon('image',30)}</div>`}</div><small>Visível após publicação</small></div>
 <button type="submit" name="intent" value="published" class="btn btn-dark btn-full" ${s.busy?'disabled':''}>${icon('eye',18)} ${s.busy?'SALVANDO...':'PUBLICAR PRODUTO'}</button>
 <button type="submit" name="intent" value="draft" class="btn btn-outline btn-full" ${s.busy?'disabled':''}>${icon('edit',17)} SALVAR RASCUNHO</button>
 ${current?`<button type="button" data-action="hide-product" data-id="${h(current.id)}" class="subtle-action">${icon('eyeoff',17)} Ocultar da vitrine</button><button type="button" data-action="archive-product" data-id="${h(current.id)}" class="subtle-action">${icon('box',17)} ${current.archived_at?'Desarquivar':'Arquivar'} peça</button><button type="button" data-action="delete-product" data-id="${h(current.id)}" class="danger-action">${icon('trash',17)} Excluir permanentemente</button>`:''}
 </div></aside></div></form>`;
}
export function settingsPage(s) {
 const v=s.settings;
 return `${ownerHeading('APARÊNCIA DA VITRINE','Configurações da loja','Defina como sua loja aparece para quem visita o site.')}
 <form id="settings-form" class="owner-panel settings-panel"><div class="block-heading"><span class="block-number">✳</span><div><h2>Informações públicas</h2><p>Deixe em branco os campos que ainda não foram definidos.</p></div></div><div class="form-grid">
 ${field('NOME DA LOJA','store_name',v.store_name,'text','required')}${field('SLOGAN','slogan',v.slogan,'text')}
 ${field('WHATSAPP COMERCIAL','whatsapp_number',v.whatsapp_number,'tel','placeholder="Ex.: 5562999999999"')}
 ${field('LINK DO INSTAGRAM','instagram_url',v.instagram_url,'url','placeholder="https://instagram.com/..."')}
 ${field('HORÁRIOS DE ATENDIMENTO','business_hours',v.business_hours,'text')}
 ${field('TEXTO DE DESTAQUE','highlight_text',v.highlight_text,'text')}
 </div><label class="form-field"><span>SOBRE O BRECHÓ</span><textarea name="description" rows="4">${h(v.description)}</textarea></label>
 <label class="form-field"><span>INFORMAÇÕES DE RETIRADA</span><textarea name="pickup_info" rows="3">${h(v.pickup_info||'')}</textarea></label>
 <label class="form-field"><span>INFORMAÇÕES DE ENTREGA</span><textarea name="delivery_info" rows="3">${h(v.delivery_info||'')}</textarea></label>
 <label class="checkbox-row"><input type="checkbox" name="show_sold" ${v.show_sold?'checked':''}> Permitir exibir peças vendidas no catálogo</label>
 <div class="settings-actions"><button class="btn btn-dark" type="submit" ${s.busy?'disabled':''}>${icon('check',17)} SALVAR CONFIGURAÇÕES</button></div></form>`;
}
export function categoriesAdminPage(s) {
 return `${ownerHeading('ORGANIZAÇÃO','Categorias','Defina os tipos de peças disponíveis na vitrine.')}
 <div class="owner-panel settings-panel"><form id="category-form" class="add-category-form"><label class="form-field"><span>NOVA CATEGORIA</span><input name="name" required minlength="2" maxlength="70" placeholder="Ex.: Moda praia"></label><button class="btn btn-dark" type="submit">${icon('plus',18)} ADICIONAR</button></form><div class="categories-admin-list">${s.ownerData.categories.map(c=>`<div class="admin-category"><span>${h(c.name)}</span><span class="muted">${s.ownerData.products.filter(p=>p.category_id===c.id).length} peças</span><button class="category-toggle ${c.active?'enabled':''}" type="button" data-action="toggle-category" data-id="${h(c.id)}">${c.active?'ATIVA':'INATIVA'}</button></div>`).join('')}</div></div>`;
}
export function auditPage(s) {
 return `${ownerHeading('SEGURANÇA & TRANSPARÊNCIA','Histórico de alterações','Registros internos das mudanças efetuadas nos produtos.')}
 <div class="owner-panel admin-table-panel"><div class="table-scroll"><table class="owner-table"><thead><tr><th>DATA</th><th>CÓDIGO</th><th>AÇÃO</th><th>RESPONSÁVEL</th></tr></thead><tbody>${s.ownerData.audit.map(log=>`<tr><td>${new Date(log.timestamp).toLocaleString('pt-BR')}</td><td class="mono">${h(log.product_code)}</td><td>${h(({created:'Produto cadastrado',updated:'Produto atualizado',deleted:'Produto excluído'})[log.action]||log.action)}</td><td class="mono">${h(s.ownerData.owners?.find(x=>x.auth_user_id===log.owner_id)?.display_name||log.owner_id?.slice(0,8)||'Sistema')}</td></tr>`).join('')||'<tr><td colspan="4">Nenhuma alteração registrada.</td></tr>'}</tbody></table></div></div>`;
}
