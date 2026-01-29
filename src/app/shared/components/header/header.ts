import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { SolicitudesService } from '../../../core/services/solicitudes.service';
import { MatDivider } from '@angular/material/divider';

@Component({
  selector: 'app-header',
  imports: [RouterLink, MatButtonModule, MatMenuModule, MatIconModule, MatDivider],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  private solicitudesService = inject(SolicitudesService);

  isLoggedIn = false;
  userName: string | null = null;

  hasSolicitud = false;

  async logout() {
    await this.auth.signOut();
    this.auth.setCachedUserName(null);

    this.isLoggedIn = false;
    this.userName = null;
    this.hasSolicitud = false;

    await this.router.navigate(['/login']);
    
  }


  async ngOnInit() {
    //  1. Pintar inmediatamente desde cache (UX perfecta)
    this.userName = this.auth.getCachedUserName();

    

    await this.auth.init();

    const session = this.auth.session;
    this.isLoggedIn = !!session;

    if (!this.isLoggedIn) {
      this.userName = null;
      this.auth.setCachedUserName(null);
      return;
    }

    if (this.isLoggedIn) {
      this.hasSolicitud = await this.solicitudesService.hasMySolicitud();
    } else {
      this.hasSolicitud = false;
    }

    // 2. Si ya hay nombre cacheado, no dispares la query
    if (this.userName) return;

    // 3. Fallback: pedir profile solo si hace falta
    const { data, error } = await this.auth.getMyProfile();

    if (!error && data?.nombres) {
      const nombre = data.nombres.trim();
      this.userName = nombre;
      this.auth.setCachedUserName(nombre);
    } else {
      this.userName = session?.user.email ?? 'Mi cuenta';
    }

    
  }
}

