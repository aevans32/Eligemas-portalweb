import { createClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

console.log('Creating Supabase client instance');
export const supabase = createClient(
    environment.supabaseUrl,
    environment.supabasePublishableKey,
    {
        auth: 
        {
            persistSession: false,      // DEV: avoids Web Locks + storage contention
            autoRefreshToken: true,
            detectSessionInUrl: true,
            storage: localStorage
        }
    }
);