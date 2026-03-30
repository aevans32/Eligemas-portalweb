import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Footer } from '../shared/components/footer/footer';
import { Header } from '../shared/components/header/header';
import { SolicitudesService } from '../core/services/solicitudes.service';
import { PropuestaDetalleRPC } from '../shared/models/propuesta-page';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmModal } from '../shared/components/confirm-modal/confirm-modal';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-propuesta',
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatDividerModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    Footer,
    Header
  ],
  templateUrl: './propuesta.html',
  styleUrl: './propuesta.css',
})
export class Propuesta implements OnInit{

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(SolicitudesService);
  private snack = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  loading = true;
  errorMsg = '';

  propuesta: PropuestaDetalleRPC = null;

  cuotaSolicitud: number | null = null;
  plazoSolicitud: number | null = null
  tceaSolicitud: number | null = null;
  montoSolicitud: number | null = null;

  async ngOnInit() {
    const idStr = this.route.snapshot.paramMap.get('id');
    const id = Number(idStr);

    const qp = this.route.snapshot.queryParamMap;
    this.cuotaSolicitud = qp.has('cuota_solicitud') ? Number(qp.get('cuota_solicitud')) : null;
    this.plazoSolicitud = qp.has('plazo_solicitud') ? Number(qp.get('plazo_solicitud')) : null;
    this.tceaSolicitud = qp.has('tcea_solicitud') ? Number(qp.get('tcea_solicitud')) : null;
    this.montoSolicitud = qp.has('monto_solicitud') ? Number(qp.get('monto_solicitud')) : null;


    if (!idStr || Number.isNaN(id)) {
      this.errorMsg = 'ID de propuesta inválido.';
      this.loading = false;
      return;
    }

    this.loading = true;
    this.errorMsg = '';

    try {
      const { data, error } = await this.service.getPropuestaDetalle(id);


      

      if (error) {
        this.errorMsg = error.message;
        return;
      }

      if (!data) {
        this.errorMsg = 'No se encontró la propuesta.';
        return;
      }

      this.propuesta = data; 



    } finally {
      this.loading = false;
    }
  }

  async elegir() {
    if (!this.propuesta) return;

    // Si ya fue elegida (esta u otra), bloqueamos
    if (this.propuesta.solicitud?.propuesta_elegida_id) {
      this.snack.open('Esta solicitud ya tiene una oferta seleccionada.', 'OK', { duration: 3000 });
      return;
    }

    try {
      this.loading = true;
      const { error } = await this.service.elegirPropuesta(this.propuesta.id);

      if (error) {
        this.snack.open(error.message, 'OK', { duration: 4000 });
        return;
      }

      // con snackbar
      // this.snack.open('Oferta seleccionada ✅', 'OK', { duration: 2500 });

      // con modal
      const ref = this.dialog.open(ConfirmModal, {
        data: {
          title: '¡Felicitaciones!',
          message: 'La entidad financiera elegida te contactará en el más breve plazo.',
          primaryText: 'Entendido',
          icon: 'check_circle',
        },
        panelClass: 'elige-modal-panel',
        backdropClass: 'elige-modal-backdrop',
        autoFocus: false,
        disableClose: true,
      });

      // Esperar a que el usuario cierre el modal
      await firstValueFrom(ref.afterClosed());

      // Volver al detalle de solicitud
      const codigo = this.propuesta.solicitud?.codigo;
      if (codigo) this.router.navigate(['/solicitud', codigo]);
      else this.router.navigate(['/dashboard']);
    } finally {
      this.loading = false;
    }
  }

  volverSolicitud() {
    const codigo = this.propuesta?.solicitud?.codigo;
    if (codigo) this.router.navigate(['/solicitud', codigo]);
    else this.router.navigate(['/dashboard']);
  }

  formatMoney(v: number | null | undefined, simbolo = 'S/') {
    if (v === null || v === undefined) return '—';
    return `${simbolo} ${new Intl.NumberFormat('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v)}`;
  }

  formatPercent(v: number | null | undefined) {
    if (v === null || v === undefined) return '—';
    return `${v}%`;
  }

  formatDate(iso: string | null | undefined) {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('es-PE', { year: 'numeric', month: '2-digit', day: '2-digit' });
  }

  logoSrc(ef: { codigo?: string | null } | null | undefined): string | null {
    const code = (ef?.codigo ?? '').trim().toUpperCase();

    const map: Record<string, string> = {
      BCP: 'images/ef/bcp.jpeg',
      BBVA: 'images/ef/bbva.png',
      IBK: 'images/ef/ibk.jpeg',
      SBK: 'images/ef/scotia.jpeg',
      PICH: 'images/ef/pichincha.jpeg',
      FALA: 'images/ef/falabella.jpeg',
      RIP: 'images/ef/ripley.jpeg',
      CAJA_AQP: 'images/ef/caja-aqp.jpeg',
      CAJA_HYO: 'images/ef/caja_huancayo.png',
      MAF: 'images/ef/maf.png',
    };

    return map[code] ?? null;
  }

  getTceaDelta(): number | null {
    if (this.tceaSolicitud == null || this.propuesta?.tcea == null) return null;
    return this.tceaSolicitud - Number(this.propuesta.tcea);
  }

  getTceaDeltaLabel(): string {
    const delta = this.getTceaDelta();
    if (delta == null) return '—';
    return delta >= 0 ? `Ahorras ${Math.abs(delta).toFixed(2)}%` : `Sube ${Math.abs(delta).toFixed(2)}%`;
  }

  tceaDeltaClass(): string {
    const delta = this.getTceaDelta();
    if (delta == null) return 'neutral';
    return delta >= 0 ? 'good' : 'bad';
  }

  getCuotaDelta(): number | null {
    if (this.cuotaSolicitud == null || this.propuesta?.cuota_estimada == null) return null;
    return this.cuotaSolicitud - Number(this.propuesta.cuota_estimada);
  }

  getCuotaDeltaLabel(): string {
    const delta = this.getCuotaDelta();
    if (delta == null) return '—';
    return delta >= 0 ? `Ahorras ${this.formatMoney(Math.abs(delta))}` : `Sube ${this.formatMoney(Math.abs(delta))}`;
  }

  cuotaDeltaClass(): string {
    const delta = this.getCuotaDelta();
    if (delta == null) return 'neutral';
    return delta >= 0 ? 'good' : 'bad';
  }

  getInteresesDelta(): number | null {
    if (this.cuotaSolicitud == null || this.plazoSolicitud == null) return null;
    if (this.propuesta?.cuota_estimada == null || this.propuesta?.plazo_meses == null) return null;
    const totalSolicitud = this.cuotaSolicitud * this.plazoSolicitud;
    const totalPropuesta = Number(this.propuesta.cuota_estimada) * Number(this.propuesta.plazo_meses);
    return totalSolicitud - totalPropuesta;
  }

  getInteresesDeltaLabel(): string {
    const delta = this.getInteresesDelta();
    if (delta == null) return '—';
    return delta >= 0 ? `Ahorras ${this.formatMoney(Math.abs(delta))}` : `Sube ${this.formatMoney(Math.abs(delta))}`;
  }

  interesesDeltaClass(): string {
    const delta = this.getInteresesDelta();
    if (delta == null) return 'neutral';
    return delta >= 0 ? 'good' : 'bad';
  }

}
