import { Injectable } from "@angular/core";
import { Session } from "@supabase/supabase-js";
import { BehaviorSubject } from "rxjs";
import { supabase } from "../supabase.client";

@Injectable({ providedIn: 'root' })
export class AuthService {
    
    private _session$ = new BehaviorSubject<Session | null>(null);
    session$ = this._session$.asObservable();

    async init() {
        const { data } = await supabase.auth.getSession();
        this._session$.next(data.session ?? null);

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
        return supabase.auth.signInWithPassword({ email, password });
    }

    async signOut() {
        return supabase.auth.signOut();
    }

}