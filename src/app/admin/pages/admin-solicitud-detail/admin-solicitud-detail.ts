import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Header } from '../../../shared/components/header/header';
import { Footer } from '../../../shared/components/footer/footer';
import { AdminService } from '../../services/admin.service';

type CatalogItem = { id: number; nombre: string };

@Component({
  selector: 'app-admin-solicitud-detail',
  imports: [
    CommonModule,
    Header, Footer,
    ReactiveFormsModule,
    MatCardModule, MatDividerModule, MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule
  ],
  templateUrl: './admin-solicitud-detail.html',
  styleUrl: './admin-solicitud-detail.css',
})
export class AdminSolicitudDetail {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private adminService = inject(AdminService);
  private snackBar = inject(MatSnackBar);

  loading = true;
  saving = false;
  errorMsg: string | null = null;
  formErrorMsg: string | null = null;

  codigo: string | null = this.route.snapshot.paramMap.get('codigo');

  solicitud: any = null;
  propuestas: any[] = [];

  displayedPropuestasColumns = ['logo', 'entidad', 'monto', 'tcea', 'plazo', 'cuota', 'estado', 'acciones'];

  // catálogos (para selects)
  entidades: CatalogItem[] = [];
  monedas: CatalogItem[] = [];

  propuestaForm = new FormGroup({
    entidad_financiera_id: new FormControl<number | null>(null, { nonNullable: false, validators: [Validators.required] }),
    moneda_id: new FormControl<number | null>(null, { nonNullable: false, validators: [Validators.required] }),
    monto_aprobado: new FormControl<number | null>(null, { nonNullable: false, validators: [Validators.required, Validators.min(1)] }),
    plazo_meses: new FormControl<number | null>(null, { nonNullable: false, validators: [Validators.required, Validators.min(1)] }),
    tcea: new FormControl<number | null>(null, { nonNullable: false, validators: [Validators.required, Validators.min(0)] }),
    cuota_estimada: new FormControl<number | null>(null),
    comentarios: new FormControl<string | null>(null),
  });

  constructor() {
    this.init();
  }

  private async init() {
    if (!this.codigo) {
      this.errorMsg = 'Código inválido.';
      this.loading = false;
      return;
    }

    // 1) cargar catálogos (para el form)
    const [efRes, monRes] = await Promise.all([
      this.adminService.getEntidadesFinancieras(),
      this.adminService.getMonedas(),
    ]);

    if (!efRes.error) this.entidades = efRes.data ?? [];
    if (!monRes.error) this.monedas = monRes.data ?? [];

    // 2) cargar detalle solicitud + propuestas
    const { data, error } = await this.adminService.getAdminSolicitudDetalle(this.codigo);

    if (error) {
      this.errorMsg = error.message ?? 'No se pudo cargar el detalle.';
      this.loading = false;
      return;
    }

    // Esperamos shape parecido a get_solicitud_detalle:
    this.solicitud = (data as any)?.solicitud ?? (data as any)?.solicitud_info ?? (data as any)?.solicitud ?? null;
    this.propuestas = (data as any)?.propuestas ?? [];

    this.loading = false;
  }

  async guardarPropuesta() {
    this.formErrorMsg = null;

    if (!this.solicitud?.id) {
      this.formErrorMsg = 'No se encontró el ID de la solicitud.';
      return;
    }

    if (this.propuestaForm.invalid) {
      this.propuestaForm.markAllAsTouched();
      this.formErrorMsg = 'Completa los campos requeridos.';
      return;
    }

    const v = this.propuestaForm.getRawValue();

    this.saving = true;
    try {

      const { data, error } = await this.adminService.insertPropuestaAdmin({
        solicitud_id: this.solicitud.id,
        entidad_financiera_id: v.entidad_financiera_id!,
        moneda_id: v.moneda_id!,
        monto_aprobado: v.monto_aprobado!,
        plazo_meses: v.plazo_meses!,
        tcea: v.tcea ?? null,
        cuota_estimada: v.cuota_estimada ?? null,
        comentarios: v.comentarios ?? null,
      });


      if (error) {
        this.formErrorMsg = error.message ?? 'No se pudo guardar la propuesta.';
        return;
      }

      // Inserta en la tabla local arriba (optimista)
      if (data) this.propuestas = [data, ...this.propuestas];

      this.snackBar.open('Propuesta guardada.', 'Cerrar', { duration: 2500 });
      this.resetPropuestaForm();

      // Opcional: si tu lógica cambia el estado de la solicitud a "Ver ofertas",
      // recarga el detalle para refrescar el pill de estado.
      const reload = await this.adminService.getAdminSolicitudDetalle(this.codigo!);
      if (!reload.error && reload.data) {
        this.solicitud = (reload.data as any)?.solicitud ?? this.solicitud;
        this.propuestas = (reload.data as any)?.propuestas ?? this.propuestas;
      }
    } finally {
      this.saving = false;
    }
  }

  resetPropuestaForm() {
    this.propuestaForm.reset({
      entidad_financiera_id: null,
      moneda_id: null,
      monto_aprobado: null,
      plazo_meses: null,
      tcea: null,
      cuota_estimada: null,
      comentarios: null,
    });

    // Limpia estados visuales (touched/dirty)
    this.propuestaForm.markAsPristine();
    this.propuestaForm.markAsUntouched();

    Object.values(this.propuestaForm.controls).forEach(c => {
      c.markAsPristine();
      c.markAsUntouched();
      c.updateValueAndValidity({ emitEvent: false });
    });

    this.formErrorMsg = null;
  }


  volver() {
    this.router.navigateByUrl('/admin-dashboard');
  }

  // --- helpers (puedes reusar los de solicitud-info) ---
  estadoClass(nombre?: string | null): string {
    switch ((nombre ?? '').toLowerCase()) {
      case 'ver ofertas': return 'state--ofertas';
      case 'en proceso': return 'state--proceso';
      case 'rechazado':
      case 'cancelada': return 'state--rechazado';
      case 'finalizado': return 'state--finalizado';
      default: return 'state--default';
    }
  }

  formatDate(iso: string) {
    try { return new Date(iso).toLocaleDateString(); } catch { return iso; }
  }

  formatMoney(v: number | null) {
    if (v === null || v === undefined) return '—';
    return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(v);
  }

  formatPercent(v: number | null) {
    if (v === null || v === undefined) return '—';
    return `${Number(v).toFixed(2)}%`;
  }

  // placeholders para tu tabla
  logoSrc(ef: { codigo?: string | null } | null | undefined): string | null {
    const code = (ef?.codigo ?? '').trim().toUpperCase();

    // mapping por código (más estable que el nombre)
    const map: Record<string, string> = {
      BCP: 'images/ef/bcp.jpeg',
      BBVA: 'images/ef/bbva.png',
      IBK: 'images/ef/ibk.jpeg',
      SBK: 'images/ef/scotia.jpeg',
      PICH: 'images/ef/pichincha.jpeg',
      FALA: 'images/ef/falabella.jpeg',
      RIP: 'images/ef/ripley.jpeg',
      CAJA_AQP: 'images/ef/caja-aqp.jpeg',
      
    };

    return map[code] ?? null;
  }

  logoClass(ef: { codigo?: string | null } | null | undefined): string {
    const code = (ef?.codigo ?? '').trim().toLowerCase();
    return code ? `ef-${code}` : 'ef-unknown';
  }

  verPropuesta(_p: any) { /* luego */ }

}
