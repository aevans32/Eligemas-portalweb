import { Injectable } from "@angular/core";
import { Session } from "@supabase/supabase-js";
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

    /** Read estado civil list for dropdown */
    getEstadosCiviles() {
    return supabase
        .from('estados_civiles')
        .select('codigo,nombre')
        .order('nombre');
    }

    /** Read tipos de documento list for dropdown */
    getTiposDocumento() {
    return supabase
        .from('tipos_documento')
        .select('id,codigo,nombre')
        .order('id');
    }

    async getMyProfile() {
        const uid = this.session?.user.id;
        if (!uid) return { data: null as ProfileMini | null, error: null as any };

        return supabase
            .from('profiles')
            .select('nombres')
            .eq('id', uid)
            .single<ProfileMini>();
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