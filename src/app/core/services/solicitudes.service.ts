import { Injectable } from '@angular/core';
import { supabase } from '../supabase.client';
import { PropuestaListItem, SolicitudInfo } from '../../shared/models/solicitud-page';
import { PropuestaDetalleRPC } from '../../shared/models/propuesta-page';

export type SolicitudInsert = {
  user_id: string;

  // Permite envío incompleto: todos los campos opcionales salvo user_id
  entidad_financiera_id?: number | null;
  moneda_id?: number | null;

  monto_total_credito?: number | null;
  monto_actual_credito?: number | null;

  monto_cuota_mensual?: number | null;

  plazo_total_meses?: number | null;
  numero_cuotas_pagadas?: number | null;

  tcea?: number | null;
  tea?: number | null;

  placa_vehiculo?: string | null;

  es_dependiente?: boolean | null;

  ruc_empleador?: string | null;
  razon_social_empleador?: string | null;
  ruc_titular?: string | null;
  ocupacion?: string | null;

  moneda_ingreso_id?: number | null;
  ingreso_bruto?: number | null;

  estado_id?: number;
};


export type SolicitudRow = {
  id: number;
  codigo: string;
  estado_id: number | null;
  created_at: string;
  moneda_id: number | null;
  entidad_financiera_id: number | null;
  monto_actual_credito: number | null;

  monto_cuota_mensual?: number | null;

  placa_vehiculo: string | null;
  tcea: number | null;
};

export type SolicitudListItem = {
  id: number;
  codigo: string;
  created_at: string;
  monto_actual_credito: number | null;
  monto_cuota_mensual?: number | null;
  placa_vehiculo: string | null;
  tcea: number | null;
  estado: {
    id: number;
    nombre: string;
    mensaje: string;
  } | null;
};

export type SolicitudDetalleRPC = {
  solicitud: SolicitudInfo;      // Asegúrate que SolicitudInfo incluya monto_cuota_mensual
  propuestas: PropuestaListItem[];
};

@Injectable({ providedIn: 'root' })
export class SolicitudesService {

  createSolicitud(payload: SolicitudInsert) {
    return supabase
      .from('solicitud')
      .insert(payload)
      .select('id,codigo')
      .single();
  }

  getMisSolicitudes(userId: string) {
    return supabase
      .from('solicitud')
      .select(`
        id,
        codigo,
        created_at,
        monto_actual_credito,
        monto_cuota_mensual,
        placa_vehiculo,
        tcea,
        estado:estado_id (
          id,
          nombre,
          mensaje
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .returns<SolicitudListItem[]>(); // <- importante para tipado
  }



  getSolicitudDetalle(codigo: string) {
    return supabase
      .rpc('get_solicitud_detalle', { p_codigo: codigo });
  }

  getPropuestaDetalle(id: number) {
    return supabase.rpc('get_propuesta_detalle', { p_id: id });
  }





  elegirPropuesta(id: number) {
    return supabase.rpc('elegir_propuesta', { p_propuesta_id: id });
  }




  async cancelSolicitud(id: number) {
    return supabase.rpc('cancel_solicitud', { p_id: id });
  }



  async hasMySolicitud(): Promise<boolean> {
    const { data, error } = await supabase.rpc('has_my_solicitud');

    if (error) {
      console.error(error);
      return false;
    }

    return data === true;
  }

}
