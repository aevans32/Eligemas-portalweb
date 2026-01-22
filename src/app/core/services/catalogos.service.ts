import { Injectable } from "@angular/core";
import { supabase } from "../supabase.client";

export type CatalogItem = { id: number; nombre: string, codigo?: string | null};

export type TipoDocumentoRow = {
  id: number;
  codigo: string;
  nombre: string;
  min_len: number;
  max_len: number;
};

export type ProvinciaRow = {
  departamento_code: string;
  code: string;
  nombre: string;
};



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


    getFuentesIngresos() {
        return supabase
            .from('fuente_ingresos')
            .select('id,nombre')
            .eq('activo', true)
            .order('nombre');
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
        .select('id,codigo,nombre,min_len,max_len')
        .order('id')
        .returns<TipoDocumentoRow[]>();
    }

    getProvinciasByDepartamento(departamentoCode: string) {
    return supabase
        .from('provincias')
        .select('departamento_code,code,nombre')
        .eq('departamento_code', departamentoCode)
        .order('nombre')
        .returns<ProvinciaRow[]>();
    }
}