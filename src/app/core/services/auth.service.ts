import { Injectable } from "@angular/core";
import { Session } from "@supabase/supabase-js";
import { BehaviorSubject } from "rxjs";
import { supabase } from "../supabase.client";

@Injectable({ providedIn: 'root' })
export class AuthService {
    
    private _session$ = new BehaviorSubject<Session | null>(null);
    session$ = this._session$.asObservable();

    private _loaded$ = new BehaviorSubject<boolean>(false);
    loaded$ = this._loaded$.asObservable();

    async init() {
        const { data } = await supabase.auth.getSession();
        this._session$.next(data.session ?? null);
        this._loaded$.next(true);
        console.log('AuthService initialized');

        supabase.auth.onAuthStateChange((_event, session) => {
            this._session$.next(session ?? null);
        });
    }

    get session() {
        return this._session$.value;
    }

    async signUp(email: string, password: string) {
        return supabase.auth.signUp({ email, password });
    }

    async signIn(email: string, password: string) {
        console.log('AuthService signIn called');
        return supabase.auth.signInWithPassword({ email, password });
    }

    async signOut() {
        return supabase.auth.signOut();
    }

}