import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SolicitudesService } from '../core/services/solicitudes.service';
import { Footer } from "../shared/components/footer/footer";
import { Header } from "../shared/components/header/header";
import { PropuestaListItem, SolicitudInfo } from '../shared/models/solicitud-page';

@Component({
  selector: 'app-solicitud-info',
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    Footer,
    Header
],
  templateUrl: './solicitud-info.html',
  styleUrl: './solicitud-info.css',
})
export class SolicitudInfoComponent implements OnInit{

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private solicitudService = inject(SolicitudesService);

  loading = true;
  errorMsg = '';

  solicitud: SolicitudInfo | null = null;
  propuestas: PropuestaListItem[] = [];

  displayedPropuestasColumns = ['entidad', 'monto', 'tcea', 'plazo', 'cuota', 'estado', 'acciones'];

  async ngOnInit() {
    const codigo = this.route.snapshot.paramMap.get('codigo');
    if (!codigo) {
      this.errorMsg = 'No se encontró el código de la solicitud.';
      this.loading = false;
      return;
    }

    this.loading = true;
    this.errorMsg = '';

    const { data, error } =
      await this.solicitudService.getSolicitudDetalle(codigo);

    if (error) {
      this.errorMsg = error.message;
      return;
    }

    this.solicitud = data.solicitud;
    this.propuestas = data.propuestas;

    this.loading = false;
  }

  volver() {
    this.router.navigate(['/dashboard']); // ajusta a tu ruta real
  }

  verPropuesta(p: PropuestaListItem) {
    this.router.navigate(['/propuesta', p.id]);
  }


  formatMoney(v: number | null | undefined) {
    if (v === null || v === undefined) return '—';
    return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(v);
  }

  formatPercent(v: number | null | undefined) {
    if (v === null || v === undefined) return '—';
    return `${v}%`;
  }

  formatDate(iso: string | null | undefined) {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleString('es-PE', { year: 'numeric', month: '2-digit', day: '2-digit' });
  }

  estadoClass(nombre?: string | null) {
    const n = (nombre ?? '').toLowerCase();
    if (n.includes('aprob')) return 'state--ok';
    if (n.includes('rechaz')) return 'state--bad';
    if (n.includes('pend')) return 'state--warn';
    return 'state--neutral';
  }

}
