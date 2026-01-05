import { Injectable } from "@angular/core";
import { supabase } from "../supabase.client";

export type CatalogItem = { id: number; nombre: string, codigo?: string | null};

@Injectable({ providedIn: 'root' })
export class CatalogosService {

    getEntidadesFinancieras() {
        return supabase
            .from('entidad_financiera')
            .select('id,nombre,codigo')
            .eq('activo', true)
            .order('nombre');
    }

    getMonedas() {
        return supabase
            .from('moneda')
            .select('id,codigo,nombre,simbolo')
            .eq('activo', true)
            .order('codigo');
    }

    getCondicionesLaborales() {
        return supabase
            .from('condicion_laboral')
            .select('id,nombre')
            .eq('activo', true)
            .order('nombre');
    }

    getFuentesIngresos() {
        return supabase
            .from('fuente_ingresos')
            .select('id,nombre')
            .eq('activo', true)
            .order('nombre');
    }
}