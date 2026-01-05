import { Component, inject, OnInit } from '@angular/core';
import { Header } from "../shared/components/header/header";
import { Footer } from "../shared/components/footer/footer";
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { AuthService } from '../core/services/auth.service';
import { SolicitudesService, SolicitudRow } from '../core/services/solicitudes.service';

@Component({
  selector: 'app-dashboard',
  imports: [
    Header,
    Footer,
    RouterLink,
    CommonModule,
    MatButtonModule,
    MatTableModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit{

  private auth = inject(AuthService);
  private solicitudesService = inject(SolicitudesService);

  loading = true;
  errorMsg: string | null = null;

  solicitudes: SolicitudRow[] = [];

  // Material table - no headers
  displayedColumns = ['row'];

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



}
