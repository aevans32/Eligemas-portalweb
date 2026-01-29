export type PropuestaDetalle = {
  id: number;
  created_at: string;
  monto_aprobado: number | null;
  plazo_meses: number | null;
  tcea: number | null;
  cuota_estimada: number | null;
  comentarios: string | null;
  moneda: { id: number; nombre: string; simbolo: string } | null;
  entidad_financiera: { id: number; nombre: string } | null;
  solicitud: { id: number; codigo: string; estado_id: number; propuesta_elegida_id: number | null; };
};

export type PropuestaDetalleRPC = PropuestaDetalle | null;

export function isPropuestaDetalle(x: any): x is PropuestaDetalle {
  return x
    && typeof x === 'object'
    && typeof x.id === 'number'
    && typeof x.created_at === 'string'
    && 'solicitud' in x
    && x.solicitud
    && typeof x.solicitud.codigo === 'string';
}