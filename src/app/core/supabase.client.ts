import { createClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

export const supabase = createClient(
  environment.supabaseUrl,
  environment.supabasePublishableKey,
  {
    auth: {
        persistSession: true,
        storage: localStorage,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'sb-eligeplus-auth',
    }
  }
);



// export const supabase = createClient(
//   environment.supabaseUrl,
//   environment.supabasePublishableKey,
//   {
//     auth: {
//       persistSession: true,
//       storage: localStorage,
//       autoRefreshToken: true,
//       detectSessionInUrl: true,
//       storageKey: 'sb-eligeplus-auth',
//       multiTab: false,

//       // Desactiva navigator.locks (no más NavigatorLockAcquireTimeoutError)
//       lock: async (_name: string, _acquireTimeout: number, fn: () => Promise<any>) => {
//         return await fn();
//       },
//     } as any,
//   }
// );