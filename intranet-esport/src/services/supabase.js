import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://jlrblahwtfecdbbcdkex.supabase.co";
const supabaseKey = "sb_publishable_2Y5Cmi-uXh49jCIDBCnBmQ_fx6GFXgy";

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);