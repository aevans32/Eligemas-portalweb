import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { Header } from "../shared/components/header/header";
import { Footer } from "../shared/components/footer/footer";
import { CatalogItem, CatalogosService } from '../core/services/catalogos.service';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../core/services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { SolicitudesService } from '../core/services/solicitudes.service';
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
  fuentes: CatalogItem[] = [];

  loading = true;
  submitting = false;
  errorMsg: string | null = null;

  form = new FormGroup({
    // Datos del Crédito
    entidad_financiera_id: new FormControl<number | null>(null),
    moneda_id: new FormControl<number | null>(null),

    monto_total_credito: new FormControl<number | null>(null),
    monto_total_bien: new FormControl<number | null>(null),
    monto_actual_credito: new FormControl<number | null>(null),

    plazo_total_meses: new FormControl<number | null>(null),
    numero_cuotas_pagadas: new FormControl<number | null>(null),

    tcea: new FormControl<number | null>(null),
    placa_vehiculo: new FormControl<string | null>(null, [Validators.maxLength(6)]),

    // Datos del Perfil Crediticio
    condicion_laboral_id: new FormControl<number | null>(null),
    ruc_empleador: new FormControl<string | null>(null, [Validators.maxLength(11)]),
    razon_social_empleador: new FormControl<string | null>(null),
    antiguedad_laboral_meses: new FormControl<number | null>(null),

    ruc_titular: new FormControl<string | null>(null, [Validators.maxLength(11)]),
    fuente_ingresos_id: new FormControl<number | null>(null),
  });



  async ngOnInit() {

    await this.auth.init();

    try {
      this.loading = true;

      const [e, m, c, f] = await Promise.all([
        this.catalogos.getEntidadesFinancieras(),
        this.catalogos.getMonedas(),
        this.catalogos.getCondicionesLaborales(),
        this.catalogos.getFuentesIngresos(),
      ]);

      if (e.error) throw e.error;
      if (m.error) throw m.error;
      if (c.error) throw c.error;
      if (f.error) throw f.error;

      this.entidades = e.data ?? [];
      this.monedas = m.data ?? [];
      this.condiciones = c.data ?? [];
      this.fuentes = f.data ?? [];
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

      const payload = {
        user_id: userId,
        estado: 'ACTIVA',

        entidad_financiera_id: v.entidad_financiera_id,
        moneda_id: v.moneda_id,

        monto_total_credito: v.monto_total_credito,
        monto_total_bien: v.monto_total_bien,
        monto_actual_credito: v.monto_actual_credito,

        plazo_total_meses: v.plazo_total_meses,
        numero_cuotas_pagadas: v.numero_cuotas_pagadas,

        tcea: v.tcea,
        placa_vehiculo: this.upperOrNull(v.placa_vehiculo),

        condicion_laboral_id: v.condicion_laboral_id,
        ruc_empleador: this.upperOrNull(v.ruc_empleador),
        razon_social_empleador: (v.razon_social_empleador ?? '').trim() || null,
        antiguedad_laboral_meses: v.antiguedad_laboral_meses,

        ruc_titular: this.upperOrNull(v.ruc_titular),
        fuente_ingresos_id: v.fuente_ingresos_id,
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
