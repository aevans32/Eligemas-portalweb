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

  estado?: string; // 'ACTIVA'
};


export type SolicitudRow = {
  id: number;
  estado: string | null;
  created_at: string;
  moneda_id: number | null;
  entidad_financiera_id: number | null;
  monto_actual_credito: number | null;
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
        //TODO: minimal fields, expand later
        return supabase
            .from('solicitud')
            .select('id, estado, created_at, moneda_id, entidad_financiera_id, monto_actual_credito')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
    }
}
