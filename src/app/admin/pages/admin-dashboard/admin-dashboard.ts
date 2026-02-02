import { Component, inject, OnInit } from '@angular/core';
import { Header } from '../../../shared/components/header/header';
import { Footer } from '../../../shared/components/footer/footer';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AuthService } from '../../../core/services/auth.service';
import { SolicitudesService, SolicitudListItem } from '../../../core/services/solicitudes.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  imports: [
    Header,
    Footer,    
    CommonModule,
    MatButtonModule,
    MatTableModule,
    MatMenuModule,
    MatIconModule,
    MatDialogModule
  ],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard implements OnInit {
  private auth = inject(AuthService);
  private solicitudesService = inject(SolicitudesService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private router = inject(Router);
  private adminService = inject(AdminService);

  totalCount = 0;
  enProcesoCount = 0;
  verOfertasCount = 0;
  finalizadasCount = 0;


  loading = true;
  errorMsg: string | null = null;

  solicitudes: SolicitudListItem[] = [];

  // Material table - no headers (misma estrategia)
  displayedColumns = ['row'];

  estadoClass(nombre?: string | null): string {
    switch ((nombre ?? '').toLowerCase()) {
      case 'ver ofertas':
        return 'state--ofertas';
      case 'en proceso':
        return 'state--proceso';
      case 'rechazado':
      case 'cancelada':
        return 'state--rechazado';
      case 'finalizado':
        return 'state--finalizado';
      default:
        return 'state--default';
    }
  }

  async ngOnInit() {
    await this.auth.init();

    // Debe existir sesión (authGuard ya lo asegura, pero igual dejamos el fallback)
    const userId = this.auth.session?.user?.id;
    if (!userId) {
      this.loading = false;
      this.errorMsg = 'No hay sesión activa. Inicia sesión e intenta nuevamente.';
      return;
    }

    // Extra-safety: validar admin (adminGuard ya lo hace, pero aquí evitamos “pantalla vacía” si algo falla)
    const isAdmin = await this.auth.isAdmin();
    if (!isAdmin) {
      this.loading = false;
      this.router.navigateByUrl('/dashboard');
      return;
    }

    const { data, error } = await this.adminService.getAllSolicitudes();

    if (error) {
      this.errorMsg = error.message ?? 'Error al cargar solicitudes.';
      this.loading = false;
      return;
    }

    this.solicitudes = (data ?? []) as SolicitudListItem[];

    this.recalcularContadores();

    this.loading = false;
  }

  formatDate(iso: string) {
    try {
      return new Date(iso).toLocaleDateString();
    } catch {
      return iso;
    }
  }

  // Opcional: admin puede cancelar una solicitud (si tu RLS lo permite)
  async confirmarCancelarSolicitud(s: any) {
    const ok = confirm('¿Seguro que deseas cancelar esta solicitud?');
    if (!ok) return;

    const { data, error } = await this.solicitudesService.cancelSolicitud(s.id);

    if (error) {
      this.snackBar.open(
        `No se pudo cancelar. ${error.message ?? ''}`.trim(),
        'Cerrar',
        { duration: 6000 }
      );
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
    } else {
      this.snackBar.open(
        'No se encontró la solicitud o no tienes permiso.',
        'Cerrar',
        { duration: 5000 }
      );
    }
  }

  // Placeholders para menú admin (si los usas en el HTML)
  verPerfil(_s: any) {
    this.snackBar.open('Pendiente: ver perfil usuario', 'Cerrar', { duration: 2000 });
  }

  verPropuestas(_s: any) {
    this.snackBar.open('Pendiente: ver propuestas', 'Cerrar', { duration: 2000 });
  }

  verSolicitud(s: { codigo?: string | null; id: number }) {
    const codigo = s.codigo ?? String(s.id);
    this.router.navigate(['/admin-dashboard/solicitud', codigo]);
  }

  private recalcularContadores() {
    this.totalCount = this.solicitudes.length;

    this.enProcesoCount = 0;
    this.verOfertasCount = 0;
    this.finalizadasCount = 0;

    for (const s of this.solicitudes) {
      const estadoId = s.estado?.id;

      switch (estadoId) {
        case 3: // En Proceso
          this.enProcesoCount++;
          break;

        case 2: // Ver ofertas
          this.verOfertasCount++;
          break;

        case 1: // Finalizado
          this.finalizadasCount++;
          break;

        default:
          // Rechazado (4), Cancelada (5), null, etc.
          break;
      }
    }
  }


}
