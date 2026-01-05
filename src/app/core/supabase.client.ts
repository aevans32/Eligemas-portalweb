import { createClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

export const supabase = createClient(
    environment.supabaseUrl,
    environment.supabasePublishableKey,
    {
        auth: 
        {
            persistSession: false,      // DEV: avoids Web Locks + storage contention
            autoRefreshToken: true,
            detectSessionInUrl: true,   // important for email-confirm redirect
            // storage: localStorage    // We can re-enable persistence later using storage: localStorage once locks are stable.
        }
    }
);