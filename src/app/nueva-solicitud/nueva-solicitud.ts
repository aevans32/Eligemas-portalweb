import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { Header } from "../shared/components/header/header";
import { Footer } from "../shared/components/footer/footer";
import { CatalogItem, CatalogosService } from '../core/services/catalogos.service';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../core/services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { SolicitudesService, SolicitudInsert } from '../core/services/solicitudes.service';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-nueva-solicitud',
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
  templateUrl: './nueva-solicitud.html',
  styleUrl: './nueva-solicitud.css',
})
export class NuevaSolicitud implements OnInit {

  private auth = inject(AuthService);
  private router = inject(Router);
  private catalogos = inject(CatalogosService);
  private solicitudes = inject(SolicitudesService);

  @ViewChild('creditoSection') creditoSection!: ElementRef<HTMLElement>;
  @ViewChild('perfilSection') perfilSection!: ElementRef<HTMLElement>;

  entidades: CatalogItem[] = [];
  monedas: CatalogItem[] = [];
  condiciones: CatalogItem[] = [];
  

  loading = true;
  submitting = false;
  errorMsg: string | null = null;

  step = 1; // 1 = Credito, 2 = Perfil

  goStep(next: 1 | 2) {
    this.step = next;
    // optional: scroll to top of wrapper for nicer UX
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }



  form = new FormGroup({
    // Datos del Crédito (NOT NULL)
    entidad_financiera_id: new FormControl<number | null>(null, [Validators.required]),
    moneda_id: new FormControl<number | null>(null, [Validators.required]),

    monto_total_credito: new FormControl<number | null>(null, [Validators.required]),
    monto_actual_credito: new FormControl<number | null>(null, [Validators.required]),

    plazo_total_meses: new FormControl<number | null>(null, [Validators.required, Validators.min(1)]),
    numero_cuotas_pagadas: new FormControl<number | null>(null, [Validators.required, Validators.min(1)]),

    tcea: new FormControl<number | null>(null, [Validators.required, Validators.min(0)]),
    tea: new FormControl<number | null>(null, [Validators.required, Validators.min(0)]),

    placa_vehiculo: new FormControl<string | null>(null, [Validators.required, Validators.maxLength(6)]),

    // Perfil (condicion_laboral_id NOT NULL)
    condicion_laboral_id: new FormControl<number | null>(null, [Validators.required]),

    // Opcionales
    ruc_empleador: new FormControl<string | null>(null, [Validators.maxLength(11)]),
    razon_social_empleador: new FormControl<string | null>(null),

    ruc_titular: new FormControl<string | null>(null, [Validators.maxLength(11)]),
    ocupacion: new FormControl<string | null>(null, [Validators.maxLength(50)]),

    // NOT NULL
    moneda_ingreso_id: new FormControl<number | null>(null, [Validators.required]),
    ingreso_bruto: new FormControl<number | null>(null, [Validators.required, Validators.min(0)]),
  });




  async ngOnInit() {

    await this.auth.init();

    try {
      this.loading = true;

      const [e, m, c] = await Promise.all([
        this.catalogos.getEntidadesFinancieras(),
        this.catalogos.getMonedas(),
        this.catalogos.getCondicionesLaborales(),
      ]);

      if (e.error) throw e.error;
      if (m.error) throw m.error;
      if (c.error) throw c.error;

      this.entidades = e.data ?? [];
      this.monedas = m.data ?? [];
      this.condiciones = c.data ?? [];
      
    } catch (err: any) {
      this.errorMsg = err?.message ?? 'Error cargando catálogos';
    } finally {
      this.loading = false;
    }
  }

  goDashboard() {
    this.router.navigateByUrl('/dashboard');
  }

  scrollToCredito() {
    this.creditoSection?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  scrollToPerfil() {
    this.perfilSection?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  

  private upperOrNull(v: string | null | undefined) {
    if (!v) return null;
    const t = v.trim();
    return t ? t.toUpperCase() : null;
  }


  async enviar() {
    // TODO:  MVP permite nulls; lo único inválido aquí suelen ser maxLength.

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const session = this.auth.session;
    const userId = session?.user?.id;

    if (!userId) {
      this.errorMsg = 'No hay sesión activa. Vuelve a iniciar sesión.';
      return;
    }

    try {
      this.submitting = true;
      this.errorMsg = null;

      const v = this.form.getRawValue();

      const placa = this.upperOrNull(v.placa_vehiculo);
      if (!placa) {
        // aunque tengas Validators.required, TS no lo sabe; y además esto refuerza UX
        this.form.controls.placa_vehiculo.setErrors({ required: true });
        this.form.controls.placa_vehiculo.markAsTouched();
        return;
      }

      const payload: SolicitudInsert = {
        user_id: userId,
        estado: 'ACTIVA',

        entidad_financiera_id: v.entidad_financiera_id!,
        moneda_id: v.moneda_id!,

        monto_total_credito: v.monto_total_credito!,
        monto_actual_credito: v.monto_actual_credito!,

        plazo_total_meses: v.plazo_total_meses!,
        numero_cuotas_pagadas: v.numero_cuotas_pagadas!,

        tea: v.tea!,
        tcea: v.tcea!,

        placa_vehiculo: placa, // <-- ahora sí es string

        condicion_laboral_id: v.condicion_laboral_id!,

        ruc_empleador: this.upperOrNull(v.ruc_empleador),
        razon_social_empleador: (v.razon_social_empleador ?? '').trim() || null,
        ruc_titular: this.upperOrNull(v.ruc_titular),

        ocupacion: (v.ocupacion ?? '').trim() || null,
        moneda_ingreso_id: v.moneda_ingreso_id!,
        ingreso_bruto: v.ingreso_bruto!,
      };


      const { data, error } = await this.solicitudes.createSolicitud(payload);

      if (error) throw error;

      // listo: vuelve al dashboard (puedes pasar el id si quieres)
      // this.router.navigateByUrl(`/dashboard?solicitud=${data.id}`);
      this.router.navigateByUrl(`/dashboard`);
    } catch (err: any) {
      this.errorMsg = err?.message ?? 'Error enviando solicitud';
      // si te falló por RLS, este mensaje normalmente lo indica
    } finally {
      this.submitting = false;
    }
  }
}
