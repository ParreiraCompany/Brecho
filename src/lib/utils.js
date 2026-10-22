export const money = cents => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format((Number(cents) || 0) / 100);
export const dateBR = value => value ? new Date(value).toLocaleDateString('pt-BR') : '—';
export const escapeHtml = (value = '') => String(value ?? '').replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
export const cleanText = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
export const parsePrice = value => {
  const s = String(value || '').trim().replace(/^R\$\s*/, '').replace(/\s/g, '');
  if (!s) return null;
  // Reais informados como 89,90, 89.90, 1.299,90 ou 1299.
  let normal = s;
  if (s.includes(',')) normal = s.replace(/\./g, '').replace(',', '.');
  else if (/^\d{1,3}(\.\d{3})+$/.test(s)) normal = s.replace(/\./g, '');
  if (!/^\d+(\.\d{1,2})?$/.test(normal)) return null;
  const [whole, frac = ''] = normal.split('.');
  const result = Number(whole) * 100 + Number(frac.padEnd(2, '0'));
  return Number.isSafeInteger(result) && result >= 0 && result <= 999999999 ? result : null;
};
export const priceInput = cents => cents == null ? '' : (cents / 100).toFixed(2).replace('.', ',');
export const route = path => '#/' + path.replace(/^\/+/, '');
export const getRoute = () => decodeURIComponent((location.hash || '#/').replace(/^#\/?/, ''));
export const icon = (name, size = 20) => `<svg aria-hidden="true" class="icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><use href="#i-${name}"></use></svg>`;
export const DEFAULT_SETTINGS = {
  store_name: 'Brechó Parreira', slogan: 'Estilo com uma nova história.',
  description: 'No Brechó Parreira, acreditamos que boas peças podem viver muitas histórias. Reunimos roupas e acessórios selecionados, com personalidade e uma nova oportunidade de serem especiais.',
  whatsapp_number: '', instagram_url: '', delivery_info: '', pickup_info: '', business_hours: '',
  highlight_text: 'Uma seleção feita para quem encontra beleza nos detalhes.', show_sold: true
};
export const DEFAULT_CATEGORIES = [
  'Camisetas','Camisas','Calças','Shorts','Saias','Vestidos','Jaquetas','Casacos','Moletons','Calçados','Bolsas','Acessórios','Outros'
];
export const CONDITIONS = ['Novo com etiqueta', 'Novo sem etiqueta', 'Excelente estado', 'Bom estado', 'Estado regular'];
export const AVAILABILITY = {available:'Disponível',reserved:'Reservado',sold:'Vendido'};
export const shortName = s => String(s || '').length > 65 ? String(s).slice(0, 62) + '…' : s;
export const digits = s => String(s || '').replace(/\D/g, '');
export const waLink = (number, msg) => `https://wa.me/${digits(number)}?text=${encodeURIComponent(msg)}`;
export const escapeAttribute = escapeHtml;
export const SUPPORTED_TYPES = ['image/jpeg','image/png','image/webp'];
export const IMAGE_MAX = 8 * 1024 * 1024;
export const MAX_PHOTOS = 10;
export function setupIcons() {
  const defs = {
    search:'<circle cx="11" cy="11" r="7"/><path d="m16 16 5 5"/>',
    bag:'<path d="M5 8h14l1 13H4L5 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/>',
    menu:'<path d="M4 6h16M4 12h16M4 18h16"/>', close:'<path d="M5 5l14 14M19 5 5 19"/>',
    arrow:'<path d="M5 12h14m-6-6 6 6-6 6"/>', left:'<path d="m15 18-6-6 6-6"/>',
    right:'<path d="m9 18 6-6-6-6"/>', heart:'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
    instagram:'<rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/>',
    shield:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/>',
    truck:'<path d="M3 5h11v12H3zM14 9h4l3 4v4h-7z"/><circle cx="7" cy="18" r="2"/><circle cx="18" cy="18" r="2"/>',
    recycle:'<path d="m7 7 2-3h6l2 3M17 7h4l-3-4M19 10l2 4-3 5h-4M14 19l2 3M11 20H5l-3-5 2-4M4 11 1 13"/>',
    plus:'<path d="M12 5v14M5 12h14"/>', edit:'<path d="m4 17-.5 4 4-.5L19 9a3 3 0 0 0-4-4L4 17Z"/>',
    trash:'<path d="M3 6h18M8 6V4h8v2m-9 0 1 15h8l1-15M10 10v7m4-7v7"/>',
    eye:'<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z"/><circle cx="12" cy="12" r="2.5"/>',
    eyeoff:'<path d="m3 3 18 18M10 6c.7-.1 1.3-.1 2-.1 6.5 0 10 6.1 10 6.1a17.5 17.5 0 0 1-3.5 4M6 7.2A16 16 0 0 0 2 12s3.5 6 10 6c1.2 0 2.2-.2 3.2-.5"/>',
    check:'<path d="m4 12 5 5L20 6"/>', alert:'<circle cx="12" cy="12" r="10"/><path d="M12 7v6m0 4h.01"/>',
    settings:'<circle cx="12" cy="12" r="3"/><path d="M19 12a7.8 7.8 0 0 0-.1-1l2-1.6-2-3.5-2.4 1a7 7 0 0 0-1.8-1L14.3 3h-4.6L9.3 5.9a7 7 0 0 0-1.8 1l-2.4-1-2 3.5 2 1.6a7.8 7.8 0 0 0 0 2l-2 1.6 2 3.5 2.4-1a7 7 0 0 0 1.8 1l.4 2.9h4.6l.4-2.9a7 7 0 0 0 1.8-1l2.4 1 2-3.5-2-1.6c.1-.3.1-.6.1-1Z"/>',
    logout:'<path d="M10 3H4v18h6M14 7l5 5-5 5m5-5H8"/>', grid:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    list:'<path d="M9 6h12M9 12h12M9 18h12M3 6h.1M3 12h.1M3 18h.1"/>',
    image:'<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8" cy="8" r="2"/><path d="m21 16-5-5-10 10"/>',
    lock:'<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    copy:'<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',
    link:'<path d="M10 13a5 5 0 0 0 7 .5l3-3a5 5 0 0 0-7-7l-1.7 1.7M14 11a5 5 0 0 0-7-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',
    whatsapp:'<path d="M21 11.5a9 9 0 0 1-13 8l-5 1 1.1-5a9 9 0 1 1 17-4Z"/><path d="M8 9c1 3 3 5 6 6m-6-6 1-1m5 7 1-1"/>',
    calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 11h18"/>',
    box:'<path d="m12 2 9 5-9 5-9-5 9-5Zm-9 5v10l9 5 9-5V7M12 12v10"/>',
    sparkle:'<path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2Z"/>',
    filter:'<path d="M4 7h16M7 12h10M10 17h4"/>',
    upload:'<path d="M12 16V3m-5 5 5-5 5 5M4 17v4h16v-4"/>',
    star:'<path d="m12 2 3.2 6.7 7.3 1-5.3 5.2 1.3 7.3-6.5-3.4-6.5 3.4 1.3-7.3-5.3-5.2 7.3-1L12 2Z"/>',
    back:'<path d="m13 6-6 6 6 6M7 12h14"/>',
    sort:'<path d="M6 3v18m-3-3 3 3 3-3m9 3V3m-3 3 3-3 3 3"/>'
  };
  const sprite = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  sprite.setAttribute('style','position:absolute;width:0;height:0;overflow:hidden');
  sprite.setAttribute('aria-hidden','true');
  sprite.innerHTML = '<defs>' + Object.entries(defs).map(([id,content])=>`<symbol id="i-${id}" viewBox="0 0 24 24">${content}</symbol>`).join('') + '</defs>';
  document.body.prepend(sprite);
}
