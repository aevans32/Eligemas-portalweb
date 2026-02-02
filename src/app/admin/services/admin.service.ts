import { Injectable } from "@angular/core";
import { supabase } from "../../core/supabase.client";
import { SolicitudListItem } from "../../core/services/solicitudes.service";

@Injectable({ providedIn: 'root' })
export class AdminService {

    async getAllSolicitudes() {
        return supabase
        .rpc('get_all_solicitudes_admin_v3')
        // .returns<SolicitudListItem[]>();
        .returns<any[]>();
    }

    async getEntidadesFinancieras() {
        return supabase.from('entidad_financiera').select('id, nombre').order('nombre');
    }

    async getMonedas() {
        return supabase.from('moneda').select('id, nombre').order('id');
    }

    // Detalle de solicitud + propuestas (ideal: RPC admin)
    async getAdminSolicitudDetalle(codigo: string) {
        // Recomendado: crear una RPC específica admin, pero por ahora puedes llamar la misma de usuario
        // si tu RLS deja al admin leerla.
        return supabase.rpc('get_solicitud_detalle', { p_codigo: codigo });
    }

    // Insert propuesta (RPC admin)
    async insertPropuestaAdmin(payload: {
        solicitud_id: number;
        entidad_financiera_id: number;
        moneda_id: number;
        monto_aprobado: number;
        plazo_meses: number;
        tcea: number | null;
        cuota_estimada: number | null;
        comentarios: string | null;
        }) {
        return supabase
            .rpc('admin_insert_propuesta', {
            p_solicitud_id: payload.solicitud_id,
            p_entidad_financiera_id: payload.entidad_financiera_id,
            p_moneda_id: payload.moneda_id,
            p_monto_aprobado: payload.monto_aprobado,
            p_plazo_meses: payload.plazo_meses,
            p_tcea: payload.tcea,
            p_cuota_estimada: payload.cuota_estimada,
            p_comentarios: payload.comentarios,
            })
            .maybeSingle();
        }

}