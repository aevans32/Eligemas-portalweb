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


  async ngOnInit() {
    const idStr = this.route.snapshot.paramMap.get('id');
    const id = Number(idStr);

    if (!idStr || Number.isNaN(id)) {
      this.errorMsg = 'ID de propuesta inválido.';
      this.loading = false;
      return;
    }

    this.loading = true;
    this.errorMsg = '';

    try {
      const { data, error } = await this.service.getPropuestaDetalle(id);


      console.log('Data: ', data)

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
          message: 'El banco elegido te contactará en el más breve plazo.',
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
    };

    return map[code] ?? null;
  }

}
