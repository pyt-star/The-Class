import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://vpezovehkvojoydmvgwi.supabase.co";
const supabaseAnonKey = "sb_publishable_ew0SVUKY-odCm5CN3d1WVw__MTexUaR";

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);