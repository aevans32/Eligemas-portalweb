export interface ProfileInsert {
  id: string; // uuid
  nombres: string;
  apellidos: string;
  dni: string; // 8 digits
  estado_civil: EstadoCivil;
  celular: string; // 9 digits
  fecha_nacimiento: string; // YYYY-MM-DD
  direccion: string;
  ciudad: string;
  departamento_code: string; // must exist in departamentos table
}

export type EstadoCivil = 'soltero' | 'casado' | 'divorciado' | 'viudo' | 'conviviente';