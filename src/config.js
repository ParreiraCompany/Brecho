export const SUPABASE_URL = 'https://wniifhauwfkqdyzqstdt.supabase.co';

export const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_M6g70-FDLBVaBDokitNroA_c-i7uDAY';

export const HAS_BACKEND =
  /^https:\/\/.+\.supabase\.co$/.test(SUPABASE_URL)
  && !SUPABASE_PUBLISHABLE_KEY.startsWith('COLE_AQUI_')
  && SUPABASE_PUBLISHABLE_KEY.length > 20;

export const PHOTO_BUCKET = 'product-photos';
