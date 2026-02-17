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
import { AuthService } from '../core/services/auth.service';

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
  private auth = inject(AuthService);

  loading = true;
  errorMsg = '';

  profile: any = null;

  solicitud: SolicitudInfo | null = null;
  propuestas: PropuestaListItem[] = [];

  displayedPropuestasColumns = ['logo', 'entidad', 'monto', 'tcea', 'plazo', 'cuota', 'diferencia', 'acciones'];

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

    


    const resProfile = await this.auth.getProfileForSolicitud(codigo);

    if (resProfile.error) {
      console.warn('No se pudo cargar profile:', resProfile.error);
      // opcional:
      // this.errorMsg = 'No se pudo cargar los datos del solicitante.';
    } else {
      this.profile = resProfile.data;
    }



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

  getCuotaDelta(p: PropuestaListItem): number | null {
    const cuotaSolicitud = this.solicitud?.monto_cuota_mensual;
    const cuotaPropuesta = p.cuota_estimada;

    if (cuotaSolicitud == null || cuotaPropuesta == null) return null;
    return Number(cuotaSolicitud) - Number(cuotaPropuesta);
  }

  getCuotaDeltaLabel(p: PropuestaListItem): string {
    const delta = this.getCuotaDelta(p);
    if (delta == null) return '—';

    // ejemplo: "Ahorras S/ 50.00" o "Sube S/ 25.00"
    const abs = Math.abs(delta);
    const money = this.formatMoney(abs);

    return delta >= 0 ? `Ahorras ${money}` : `Sube ${money}`;
  }

  cuotaDeltaClass(p: PropuestaListItem): string {
    const delta = this.getCuotaDelta(p);
    if (delta == null) return 'neutral';
    return delta >= 0 ? 'good' : 'bad';
  }


  


}
