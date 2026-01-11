export interface ProfileInsert {
  id: string; // uuid
  nombres: string;
  apellidos: string;

  tipo_documento_id: number;
  dni: string; // por ahora; luego quizá numero_documento

  // ahora es codigo text (FK a estados_civiles.codigo)
  estado_civil: string;

  celular: string; // 9 digits
  fecha_nacimiento: string; // YYYY-MM-DD

  direccion: string;
  provincia: string;
  distrito: string;

  departamento_code: string; // must exist in departamentos table
}

