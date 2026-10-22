/**
 * Configuração pública do cliente Supabase.
 * URL e chave publishable/anon são públicas por projeto; nunca insira service_role,
 * senhas dos proprietários ou qualquer chave secreta aqui.
 */
export const SUPABASE_URL = 'COLE_AQUI_SUA_SUPABASE_URL';
export const SUPABASE_PUBLISHABLE_KEY = 'COLE_AQUI_SUA_CHAVE_PUBLISHABLE_OU_ANON';

export const HAS_BACKEND = /^https:\/\/.+\.supabase\.co$/.test(SUPABASE_URL)
  && !SUPABASE_PUBLISHABLE_KEY.startsWith('COLE_AQUI_')
  && SUPABASE_PUBLISHABLE_KEY.length > 20;

export const PHOTO_BUCKET = 'product-photos';
