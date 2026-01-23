import { Injectable } from "@angular/core";
import { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { BehaviorSubject } from "rxjs";
import { supabase } from "../supabase.client";
import { ProfileInsert } from "../../shared/models/profile-insert";

type ProfileMini = { nombres: string | null };




export const LS_USER_NAME = 'eligeplus.userName';


@Injectable({ providedIn: 'root' })
export class AuthService {
    
    private _session$ = new BehaviorSubject<Session | null>(null);
    session$ = this._session$.asObservable();

    private _loaded$ = new BehaviorSubject<boolean>(false);
    loaded$ = this._loaded$.asObservable();

    private initialized = false;
    private authSub?: { unsubscribe: () => void };

    async init() {
  if (this.initialized) return;
  this.initialized = true;

  // 1) Listener
  const { data: listener } = supabase.auth.onAuthStateChange(
    (event: AuthChangeEvent, session: Session | null) => {
      this._session$.next(session ?? null);

      if (event === 'INITIAL_SESSION' && !this._loaded$.value) {
        this._loaded$.next(true);
      }
    }
  );
  this.authSub = listener.subscription;

  // 2) Rehidrata con retry (por si hay lock race)
  const isLockError = (e: unknown) => {
    const msg = String((e as any)?.message ?? e ?? '');
    return msg.includes('NavigatorLockAcquireTimeoutError') || msg.includes('LockManager');
  };

  const getSessionWithRetry = async (retries = 5, delayMs = 150) => {
    for (let i = 0; i < retries; i++) {
      try {
        return await supabase.auth.getSession();
      } catch (e) {
        if (!isLockError(e)) throw e;
        await new Promise((r) => setTimeout(r, delayMs));
      }
    }
    return await supabase.auth.getSession();
  };

  try {
    const { data } = await getSessionWithRetry();
    this._session$.next(data.session ?? null);
  } catch (e) {
    console.warn('getSession failed:', e);
  }

  // 3) Fallback loaded
  setTimeout(() => {
    if (!this._loaded$.value) this._loaded$.next(true);
  }, 1500);
}


  


    get session() {
        return this._session$.value;
    }



    async signUp(email: string, password: string) {

        const redirectTo = `${window.location.origin}/basic-info`;

        console.log('[signup redirectTo]', redirectTo);

        return supabase.auth.signUp({ 
            email, 
            password,
            options: {
                emailRedirectTo: redirectTo
            }
         });
    }

    async signIn(email: string, password: string) {
        return supabase.auth.signInWithPassword({ email, password });
    }

    async signOut() {
        return supabase.auth.signOut();
    }

    /** Insert profile row (requires authenticated user + RLS) */
    createProfile(profile: ProfileInsert) {
        return supabase.from('profiles').insert(profile).select().maybeSingle();
    }

    async getMyProfile() {
        const uid = this.session?.user.id;
        if (!uid) return { data: null as ProfileMini | null, error: null as any };

        return supabase
            .from('profiles')
            .select('nombres')
            .eq('id', uid)
            .maybeSingle<ProfileMini>();
    }

    setCachedUserName(name: string | null) {
        if (name) {
            localStorage.setItem(LS_USER_NAME, name);
        } else {
            localStorage.removeItem(LS_USER_NAME);
        }
    }

    getCachedUserName(): string | null {
        return localStorage.getItem(LS_USER_NAME);
    }



}