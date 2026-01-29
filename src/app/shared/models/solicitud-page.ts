export interface SolicitudInfo {
  id: number;
  codigo: string;
  created_at: string;
  monto_total_credito: number | null;
  monto_actual_credito: number | null;
  plazo_total_meses: number | null;
  numero_cuotas_pagadas: number | null;
  tcea: number | null;
  tea: number | null;
  placa_vehiculo: string | null;
  ocupacion: string | null;
  ingreso_bruto: number | null;
  es_dependiente: boolean | null;
  estado: { id: number; nombre: string; mensaje: string | null } | null;
}

export interface PropuestaListItem {
  id: string;              // muchas veces es uuid
  created_at: string;
  entidad_financiera?: { id: number; nombre: string } | null;
  monto_refinanciado?: number | null;
  tea?: number | null;
  tcea?: number | null;
  plazo_meses?: number | null;
  cuota_mensual?: number | null;
  estado?: { id: number; nombre: string } | null;
}
