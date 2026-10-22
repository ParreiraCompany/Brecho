import { HAS_BACKEND, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, PHOTO_BUCKET } from '../config.js';
import { DEFAULT_SETTINGS } from './utils.js';

let clientPromise;
export async function db() {
  if (!HAS_BACKEND) throw new Error('Supabase ainda não configurado. Consulte docs/CONFIGURACAO.md.');
  if (!clientPromise) clientPromise = import('https://esm.sh/@supabase/supabase-js@2.49.10?bundle')
    .then(({createClient}) => createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: false }
    }));
  return clientPromise;
}
function check({data,error}) { if(error) throw error; return data; }

export async function fetchPublicData() {
  const sb = await db();
  const [p,c,s] = await Promise.all([
    sb.from('public_products').select('*').eq('publication_status','published').is('archived_at',null).order('published_at',{ascending:false}).limit(500),
    sb.from('categories').select('*').eq('active',true).order('sort_order'),
    sb.from('store_settings').select('*').eq('id',1).single()
  ]);
  const products = check(p) || [];
  const categories = check(c) || [];
  const settings = s.error ? { ...DEFAULT_SETTINGS } : { ...DEFAULT_SETTINGS, ...s.data };
  const images = await getImages(products, false);
  return {products: products.map(product => ({...product,images:images.get(product.id) || []})),categories,settings};
}

export async function getImages(products, asOwner) {
  const res = new Map();
  if (!products.length) return res;
  const sb = await db();
  const ids = products.map(x=>x.id);
  // Lotear os IDs evita URLs grandes; carregamos metadados privados só para owners.
  const photos = [];
  for (let i=0;i<ids.length;i+=100) {
    const query = sb.from('product_images').select('*').in('product_id',ids.slice(i,i+100)).order('position');
    photos.push(...check(await query));
  }
  if (!photos.length) return res;
  for (let i=0;i<photos.length;i+=100) {
    const batch = photos.slice(i,i+100);
    // Assinaturas expiram; são renovadas quando o catálogo é novamente carregado.
    const {data,error} = await sb.storage.from(PHOTO_BUCKET).createSignedUrls(batch.map(x=>x.storage_path),3600);
    if (error) throw error;
    batch.forEach((photo,j)=>{
      const url = data?.[j]?.signedUrl || '';
      const item = {...photo,url};
      if (!res.has(photo.product_id)) res.set(photo.product_id,[]);
      res.get(photo.product_id).push(item);
    });
  }
  for (const photosList of res.values()) photosList.sort((a,b) => Number(b.is_primary)-Number(a.is_primary) || a.position-b.position);
  return res;
}

export async function getOwnerProfile() {
  const sb = await db();
  const {data:{user},error} = await sb.auth.getUser();
  if(error || !user) return null;
  const {data:profile,error:profileError} = await sb.from('owner_profiles').select('auth_user_id,display_name,role,active').eq('auth_user_id',user.id).maybeSingle();
  if (profileError) throw profileError;
  if (!profile || profile.role !== 'OWNER' || !profile.active) return null;
  return {...profile,email:user.email};
}
export async function signIn(email,password) {
  const sb = await db();
  check(await sb.auth.signInWithPassword({email,password}));
  return getOwnerProfile();
}
export async function signOut() { const sb=await db(); check(await sb.auth.signOut()); }
export async function sendPasswordReset(email) {
  const sb = await db();
  check(await sb.auth.resetPasswordForEmail(email, {redirectTo: location.href.split('#')[0] + '#/owner/login'}));
}
export async function fetchOwnerData() {
  const sb = await db();
  const [p,c,a,o] = await Promise.all([
    sb.from('products').select('*').order('updated_at',{ascending:false}).limit(1000),
    sb.from('categories').select('*').order('sort_order'),
    sb.from('product_audit_logs').select('id,product_code,owner_id,action,timestamp,change_summary').order('timestamp',{ascending:false}).limit(80),
    sb.from('owner_profiles').select('auth_user_id,display_name')
  ]);
  const products = check(p), categories = check(c), audit = check(a), owners = check(o);
  const images = await getImages(products,true);
  return {products: products.map(product=>({...product,images:images.get(product.id)||[]})),categories,audit,owners};
}
export async function insertDraft(fields) {
  const sb = await db();
  return check(await sb.from('products').insert({...fields, publication_status:'draft'}).select('*').single());
}
export async function updateProduct(product,patch) {
  const sb = await db();
  return check(await sb.rpc('owner_update_product',{p_id:product.id,p_expected_version:product.version,p_patch:patch}));
}
export async function deleteProduct(product) {
  const sb = await db();
  // Apagar primeiro as imagens do Storage, com remoção segura de referências depois.
  if (product.images?.length) {
    check(await sb.storage.from(PHOTO_BUCKET).remove(product.images.map(i=>i.storage_path)));
  }
  check(await sb.from('products').delete().eq('id',product.id));
}

export async function uploadProductPhotos(product,files) {
  const sb=await db();
  const added=[];
  try {
    for(let i=0;i<files.length;i++) {
      const file=files[i];
      const ext={'image/jpeg':'jpg','image/png':'png','image/webp':'webp'}[file.type];
      if(!ext) throw new Error('Formato de imagem não aceito.');
      const storage_path = `${product.id}/${crypto.randomUUID()}.${ext}`;
      const uploaded = await sb.storage.from(PHOTO_BUCKET).upload(storage_path,file,{contentType:file.type,cacheControl:'3600',upsert:false});
      check(uploaded);
      let image;
      try {
        image = check(await sb.from('product_images').insert({product_id:product.id,storage_path,alt_text:`${product.name} — foto ${i+1}`,position:i+100,is_primary:false}).select('*').single());
      } catch(err) {
        await sb.storage.from(PHOTO_BUCKET).remove([storage_path]);
        throw err;
      }
      added.push(image);
    }
    return added;
  } catch (error) {
    // Não desfaz as fotos já salvas: elas continuam associadas ao rascunho do produto.
    throw error;
  }
}
export async function synchronizePhotos(product,allPhotos,deletedIds,primaryId) {
  const sb = await db();
  for (const deletedId of deletedIds) {
    const photo = product.images.find(p=>p.id===deletedId);
    if (!photo) continue;
    check(await sb.from('product_images').delete().eq('id',deletedId));
    // Depois da deleção do registro, Storage não tem referência; owner continua autorizado.
    check(await sb.storage.from(PHOTO_BUCKET).remove([photo.storage_path]));
  }
  const remaining = allPhotos.filter(p=>!deletedIds.includes(p.id));
  for (const item of remaining) {
    if (item.is_primary) {
      check(await sb.from('product_images').update({is_primary:false}).eq('id',item.id));
    }
  }
  for (let i=0;i<remaining.length;i++) {
    const photo=remaining[i];
    check(await sb.from('product_images').update({position:i,is_primary:false}).eq('id',photo.id));
  }
  if (remaining.length) {
    const id = remaining.some(p=>p.id===primaryId) ? primaryId : remaining[0].id;
    check(await sb.from('product_images').update({is_primary:true}).eq('id',id));
  }
}
export async function saveSettings(values) {
  const sb=await db();
  check(await sb.from('store_settings').update({...values,updated_at:new Date().toISOString()}).eq('id',1));
}
export async function createCategory(name) {
  const sb=await db();
  const slug=name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') + '-' + Date.now().toString(36);
  check(await sb.from('categories').insert({name,slug,sort_order:50}));
}
export async function toggleCategory(category) {
  const sb=await db();
  check(await sb.from('categories').update({active:!category.active}).eq('id',category.id));
}
export async function getFreshPublicProducts() {
  const sb=await db();
  return check(await sb.from('public_products').select('id,name,product_code,price_cents,size,availability_status,quantity,publication_status').eq('publication_status','published').limit(1000));
}

export async function fetchOwnerProduct(id) {
  const sb=await db();
  return check(await sb.from('products').select('*').eq('id',id).single());
}
