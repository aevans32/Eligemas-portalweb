import { Injectable } from "@angular/core";
import { Session } from "@supabase/supabase-js";
import { BehaviorSubject } from "rxjs";
import { supabase } from "../supabase.client";
import { ProfileInsert } from "../../shared/models/profile-insert";

@Injectable({ providedIn: 'root' })
export class AuthService {
    
    private _session$ = new BehaviorSubject<Session | null>(null);
    session$ = this._session$.asObservable();

    private _loaded$ = new BehaviorSubject<boolean>(false);
    loaded$ = this._loaded$.asObservable();

    private initialized = false;

    async init() {

        if (this.initialized) return;
        this.initialized = true;

        const { data } = await supabase.auth.getSession();
        this._session$.next(data.session ?? null);
        this._loaded$.next(true);

        supabase.auth.onAuthStateChange((_event, session) => {
            this._session$.next(session ?? null);
        });
    }

    get session() {
        return this._session$.value;
    }

    async signUp(email: string, password: string) {
        const redirectTo = `${window.location.origin}/basic-info`;
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
        return supabase.from('profiles').insert(profile).select().single();
    }

    /** Read departments list for a dropdown */
    getDepartamentos() {
        return supabase.from('departamentos').select('code,nombre').order('nombre');
    }

}