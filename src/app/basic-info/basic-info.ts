import { Component, inject } from '@angular/core';
import { AuthService } from '../core/services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Header } from "../shared/components/header/header";
import { Footer } from "../shared/components/footer/footer";
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

type EstadoCivilRow = { codigo: string; nombre: string };
type TipoDocumentoRow = { id: number; codigo: string; nombre: string };

@Component({
  selector: 'app-basic-info',
  imports: [
    Header, 
    Footer, 
    CommonModule, 
    ReactiveFormsModule, 
    RouterModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatSelectModule, 
    MatButtonModule
  ],
  templateUrl: './basic-info.html',
  styleUrl: './basic-info.css',
})
export class BasicInfo {

  private auth = inject(AuthService);
  private router = inject(Router);

  departamentos: Array<{ code: string; nombre: string }> = [];

  estadosCiviles: EstadoCivilRow[] = [];
  tiposDocumento: TipoDocumentoRow[] = [];


  form = new FormGroup({
    nombres: new FormControl('', [Validators.required, Validators.minLength(2)]),
    apellidos: new FormControl('', [Validators.required, Validators.minLength(2)]),

    tipoDocumentoId: new FormControl<number | null>(null, [Validators.required]),
    dni: new FormControl('', [Validators.required, Validators.pattern(/^\d{8}$/)]),

    // estadoCivil: new FormControl<EstadoCivil | null>(null, [Validators.required]),
    estadoCivilCodigo: new FormControl<string | null>(null, [Validators.required]),

    celular: new FormControl('', [Validators.required, Validators.pattern(/^\d{9}$/)]),
    fechaNacimiento: new FormControl('', [Validators.required]),

    direccion: new FormControl('', [Validators.required, Validators.minLength(5)]),
    // ciudad: new FormControl('', [Validators.required, Validators.minLength(2)]),
    provincia: new FormControl('', [Validators.required, Validators.minLength(2)]),
    distrito: new FormControl('', [Validators.required, Validators.minLength(2)]),

    departamentoCode: new FormControl('', [Validators.required]),
  });


  async ngOnInit() {
    // Must be logged in to complete this
    if (!this.auth.session) {
      // If user opens this page directly without coming from email confirmation
      await this.router.navigateByUrl('/login');
      return;
    }

    const [{ data: deps, error: depsErr }, { data: ec, error: ecErr }, { data: td, error: tdErr }] =
      await Promise.all([
        this.auth.getDepartamentos(),
        this.auth.getEstadosCiviles(),
        this.auth.getTiposDocumento(),
    ]);

    if (depsErr) console.error('Error loading departamentos:', depsErr.message);
    if (ecErr) console.error('Error loading estados_civiles:', ecErr.message);
    if (tdErr) console.error('Error loading tipos_documento:', tdErr.message);

    this.departamentos = deps ?? [];
    this.estadosCiviles = ec ?? [];
    this.tiposDocumento = td ?? [];

    // const { data, error } = await this.auth.getDepartamentos();
    // if (error) {
    //   console.error('Error loading departamentos:', error.message);
    //   return;
    // }
    // this.departamentos = data ?? [];
  }

  async save() {
    if (this.form.invalid) return;

    const session = this.auth.session;
    if (!session) {
      await this.router.navigateByUrl('/login');
      return;
    }

    const profileInsert = {
      id: session.user.id,
      nombres: this.form.controls.nombres.value!.trim(),
      apellidos: this.form.controls.apellidos.value!.trim(),

      tipo_documento_id: this.form.controls.tipoDocumentoId.value!,
      dni: this.form.controls.dni.value!,

      // estado_civil: this.form.controls.estadoCivil.value!,
      estado_civil: this.form.controls.estadoCivilCodigo.value!,

      celular: this.form.controls.celular.value!,
      fecha_nacimiento: this.form.controls.fechaNacimiento.value!,

      direccion: this.form.controls.direccion.value!.trim(),
      // ciudad: this.form.controls.ciudad.value!.trim(),
      provincia: this.form.controls.provincia.value!.trim(),
      distrito: this.form.controls.distrito.value!.trim(),

      departamento_code: this.form.controls.departamentoCode.value!,
    };

    const { error } = await this.auth.createProfile(profileInsert);
    if (error) {
      console.error('Profile insert error:', error.message);
      // common: duplicate dni -> violates unique constraint
      return;
    }

    await this.router.navigateByUrl('/dashboard');
  }
}
