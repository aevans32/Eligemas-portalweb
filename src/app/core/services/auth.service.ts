import { Injectable } from "@angular/core";
import { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { BehaviorSubject } from "rxjs";
import { supabase } from "../supabase.client";
import { ProfileInsert } from "../../shared/models/profile-insert";

type ProfileMini = { nombres: string | null; is_admin: boolean | null };

type ProfileStatus = { is_complete: boolean | null };

type ProfileAdmin = { is_admin: boolean | null };

type ProfileDetalle = {
  id: string;
  nombres: string | null;
  apellidos: string | null;
  estado_civil: string | null;
  celular: string | null;
  fecha_nacimiento: string | null;
  direccion: string | null;
  departamento_code: string | null;
  provincia: string | null;
  distrito: string | null;
  num_documento: string | null;
  tipo_documento_id: number | null;
  is_complete: boolean | null;
  is_admin: boolean | null;
};

export const LS_USER_NAME = 'eligeplus.userName';


@Injectable({ providedIn: 'root' })
export class AuthService {
    
    private _session$ = new BehaviorSubject<Session | null>(null);
    session$ = this._session$.asObservable();

    private _loaded$ = new BehaviorSubject<boolean>(false);
    loaded$ = this._loaded$.asObservable();

    private initialized = false;
    private authSub?: { unsubscribe: () => void };

    private _isAdmin$ = new BehaviorSubject<boolean | null>(null);
    isAdmin$ = this._isAdmin$.asObservable();


    async init() {
      if (this.initialized) return;
      this.initialized = true;

      // 1) Listener
      const { data: listener } = supabase.auth.onAuthStateChange(
        (event: AuthChangeEvent, session: Session | null) => {
          this._session$.next(session ?? null);
          this._isAdmin$.next(null);

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

    // Metodo para Login
    async getMyProfile() {
        const uid = this.session?.user.id;
        if (!uid) return { data: null as ProfileMini | null, error: null as any };

        return supabase
            .from('profiles')
            .select('nombres, is_admin')
            .eq('id', uid)
            .maybeSingle<ProfileMini>();
    }

    async getMyProfileStatus() {
      const uid = this.session?.user.id;
      
      if (!uid) return { data: null as ProfileStatus | null, error: null as any };

      return supabase
        .from('profiles')
        .select('is_complete')
        .eq('id', uid)
        .maybeSingle<ProfileStatus>();
    }

    async upsertOrUpdateProfile(profile: any) {
      return supabase
        .from('profiles')
        .upsert(profile, { onConflict: 'id' })
        .select()
        .maybeSingle();
    }

    async refreshIsAdmin() {
      const uid = this.session?.user.id;
      if (!uid) {
        this._isAdmin$.next(false);
        return { data: false, error: null as any };
      }

      const res = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', uid)
        .maybeSingle<ProfileAdmin>();

      if (res.error) {
        this._isAdmin$.next(false);
        return { data: false, error: res.error };
      }

      const isAdmin = res.data?.is_admin === true;
      this._isAdmin$.next(isAdmin);
      return { data: isAdmin, error: null as any };
    }

    /** Returns cached value if available; otherwise fetches once */
    async isAdmin(): Promise<boolean> {
      const cached = this._isAdmin$.value;
      if (cached !== null) return cached;

      const { data } = await this.refreshIsAdmin();
      return data === true;
    }

    async refreshSession() {
      const { data, error } = await supabase.auth.getSession();
      if (!error) {
        this._session$.next(data.session ?? null);
      }
      return { data, error };
    }

    async getProfileForSolicitud(codigo: string) {
      // Asegura que auth esté inicializado y que exista sesión (JWT) antes del RPC
      await this.init();

      if (!this.session) {
        await this.refreshSession();
      }

      // Si aún no hay sesión, no tiene sentido llamar al RPC (auth.uid() sería null)
      if (!this.session) {
        return {
          data: null as ProfileDetalle | null,
          error: { message: 'No hay sesión activa (usuario no autenticado).' } as any
        };
      }

      return supabase
        .rpc('get_profile_for_solicitud', { p_codigo: codigo })
        .maybeSingle<ProfileDetalle>();
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