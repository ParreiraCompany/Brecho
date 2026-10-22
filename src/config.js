/**
 * Configuração pública do cliente Supabase.
 * URL e chave publishable/anon são públicas por projeto; nunca insira service_role,
 * senhas dos proprietários ou qualquer chave secreta aqui.
 */
export const SUPABASE_URL = 'https://wniifhauwfkqdyzqstdt.supabase.co/rest/v1/';
export const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_M6g70-FDLBVaBDokitNroA_c-i7uDAY';

export const HAS_BACKEND = /^https:\/\/.+\.supabase\.co$/.test(export const SUPABASE_URL = 'https://wniifhauwfkqdyzqstdt.supabase.co';)
  && !SUPABASE_PUBLISHABLE_KEY.startsWith('COLE_AQUI_')
  && SUPABASE_PUBLISHABLE_KEY.length > 20;

export const PHOTO_BUCKET = 'product-photos';
