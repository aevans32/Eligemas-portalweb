import { Injectable } from '@angular/core';
import { supabase } from '../supabase.client';

export type SolicitudInsert = {
  user_id: string;

  entidad_financiera_id: number;
  moneda_id: number;

  monto_total_credito: number;
  monto_actual_credito: number;

  plazo_total_meses: number;
  numero_cuotas_pagadas: number;

  tcea: number;
  tea: number;

  placa_vehiculo: string;

  es_dependiente: boolean;

  // opcionales
  ruc_empleador?: string | null;
  razon_social_empleador?: string | null;
  ruc_titular?: string | null;
  ocupacion?: string | null;

  // nuevos NOT NULL
  moneda_ingreso_id: number;
  ingreso_bruto: number;

  estado_id?: number;
};


export type SolicitudRow = {
  id: number;
  estado_id: number | null;
  created_at: string;
  moneda_id: number | null;
  entidad_financiera_id: number | null;
  monto_actual_credito: number | null;

  placa_vehiculo: string | null;
  tcea: number | null;
};

export type SolicitudListItem = {
  id: number;
  created_at: string;
  monto_actual_credito: number | null;
  placa_vehiculo: string | null;
  tcea: number | null;
  estado: {
    id: number;
    nombre: string;
    mensaje: string;
  } | null;
};




@Injectable({ providedIn: 'root' })
export class SolicitudesService {

  createSolicitud(payload: SolicitudInsert) {
    return supabase
      .from('solicitud')
      .insert(payload)
      .select('id')
      .single();
  }

  getMisSolicitudes(userId: string) {
    return supabase
      .from('solicitud')
      .select(`
        id,
        created_at,
        monto_actual_credito,
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

  // Llama a la función Postgre que elimina una solicitud por su ID
  async deleteSolicitud(id: number) {
    return supabase.rpc('delete_solicitud', {
      p_id: id
    });
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
