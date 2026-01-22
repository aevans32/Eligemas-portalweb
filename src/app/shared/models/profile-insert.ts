export interface ProfileInsert {
  id: string;
  nombres: string;
  apellidos: string;
  tipo_documento_id: number;
  num_documento: string;
  estado_civil: string;
  celular: string;
  fecha_nacimiento: string | Date; // whatever you are using
  direccion: string;
  departamento_code: string;
  provincia: string;
  distrito: string;
}

