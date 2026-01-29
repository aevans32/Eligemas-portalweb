import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { SolicitudesService, SolicitudListItem } from '../core/services/solicitudes.service';
import { Footer } from "../shared/components/footer/footer";
import { Header } from "../shared/components/header/header";

@Component({
  selector: 'app-dashboard',
  imports: [
    Header,
    Footer,
    RouterLink,
    CommonModule,
    MatButtonModule,
    MatTableModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit{

  private auth = inject(AuthService);
  private solicitudesService = inject(SolicitudesService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private router = inject(Router);

  hasSolicitud = false;

  loading = true;
  errorMsg: string | null = null;

  solicitudes: SolicitudListItem[] = [];

  // Material table - no headers
  displayedColumns = ['row'];

  estadoClass(nombre?: string | null): string {
    switch ((nombre ?? '').toLowerCase()) {
      case 'ver ofertas':
        return 'state--ofertas';
      case 'en proceso':
        return 'state--proceso';
      case 'rechazado':
        return 'state--rechazado';
      case 'finalizado':
        return 'state--finalizado';
      default:
        return 'state--default';
    }
  }

  // verSolicitud(s: any) {
  //   this.router.navigate(['/solicitud', s.id]); // ej: /solicitud/123
  // }

  verSolicitud(s: { codigo?: string | null; id: number }) {
    const codigo = s.codigo ?? String(s.id);
    this.router.navigate(['/solicitud', codigo]);
  }

  // editarSolicitud(s: any) {
  //   this.router.navigate(['/solicitud', s.id, 'editar']); // ej: /solicitud/123/editar
  // }



  async ngOnInit() {

    await this.auth.init();

    const session = this.auth.session;
    const userId = session?.user.id;

    if (!userId) {
      this.loading = false;
      this.errorMsg = 'No hay sesión de usuario activa. Iniciar sesión e intentar de nuevo.';
      return;
    }

    const { data, error } = await this.solicitudesService.getMisSolicitudes(userId);

    if (error) {
      this.errorMsg = error.message;
      this.loading = false;
      return;
    }

    this.solicitudes = data ?? [];
    

    this.hasSolicitud = await this.solicitudesService.hasMySolicitud();

    this.loading = false;
  }

  formatDate(iso: string) {
    try {
      return new Date(iso).toLocaleDateString();
    }
    catch {
      return iso;
    }
  }

  async confirmarCancelarSolicitud(s: any) {
    const ok = confirm('¿Seguro que deseas cancelar esta solicitud?');
    if (!ok) return;

    const { data, error } = await this.solicitudesService.cancelSolicitud(s.id);

    if (error) {
      this.snackBar.open(`No se pudo cancelar. ${error.message ?? ''}`.trim(), 'Cerrar', { duration: 6000 });
      return;
    }

    if (data === true) {
      this.snackBar.open('Solicitud cancelada.', 'Cerrar', { duration: 3000 });

      // Actualiza la fila local (mantiene historial)
      const row = this.solicitudes.find(x => x.id === s.id);
      if (row) {
        row.estado = row.estado ?? { id: 5, nombre: 'Cancelada', mensaje: '' };
        row.estado.id = 5;
        row.estado.nombre = 'Cancelada';
      }

      // Recalcula: hay solicitud activa si existe estado != 1 y != 5
      this.hasSolicitud = this.solicitudes.some(x => {
        const eid = x.estado?.id ?? null;
        return eid !== 1 && eid !== 5;
      });

    } else {
      this.snackBar.open('No se encontró la solicitud o no tienes permiso.', 'Cerrar', { duration: 5000 });
    }
  }





}
