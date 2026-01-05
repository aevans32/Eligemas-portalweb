import { Injectable } from '@angular/core';
import { supabase } from '../supabase.client';

export type SolicitudInsert = {
  user_id: string; // uuid

  entidad_financiera_id?: number | null;
  moneda_id?: number | null;

  monto_total_credito?: number | null;
  monto_total_bien?: number | null;
  monto_actual_credito?: number | null;

  plazo_total_meses?: number | null;
  numero_cuotas_pagadas?: number | null;

  tcea?: number | null;
  placa_vehiculo?: string | null;

  condicion_laboral_id?: number | null;
  ruc_empleador?: string | null;
  razon_social_empleador?: string | null;
  antiguedad_laboral_meses?: number | null;

  ruc_titular?: string | null;
  fuente_ingresos_id?: number | null;

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
