import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://nlyfngpitxuqtczeqjaw.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_q0e5J5_yWRYl_KHS7U6HhA_zbTpGZdC';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('Fetching hospital_info...');
  const { data: hData, error: hErr } = await supabase.from('hospital_info').select('*').limit(1);
  if (hErr) {
    console.error('hErr:', hErr);
    return;
  }
  console.log('Current row:', hData);
  if (hData && hData.length > 0) {
    const id = hData[0].id;
    console.log('Attempting to update registration_number to test large string on row', id);
    const { data: updateData, error: updateErr } = await supabase
      .from('hospital_info')
      .update({ registration_number: 'TEST_BASE64_VALUE_VERY_LONG_STRING_HELLOWORLD'.repeat(100) })
      .eq('id', id)
      .select();
    if (updateErr) {
      console.error('Update error:', updateErr);
    } else {
      console.log('Update success!', updateData);
    }
  }
}

run();
