import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Header } from "../shared/components/header/header";
import { AuthService } from '../core/services/auth.service';
import { Footer } from "../shared/components/footer/footer";
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-login',
  imports: [
    MatInputModule, 
    Header, 
    ReactiveFormsModule, 
    RouterModule, 
    Footer,
    MatSnackBarModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);

  hidePassword = true;
  
  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(8),]),
  });

  async login() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.showError('Completa correctamente el correo y contraseña.');
      return;
    }

    const email = this.loginForm.controls.email.value!;
    const password = this.loginForm.controls.password.value!;

    const { error } = await this.authService.signIn(email, password);

    if (error) {
      console.error('Login error:', error.message);
      this.showError(this.mapLoginError(error));
      return;
    }

    await this.authService.refreshSession();

    const { data: profile, error: profileError } =
      await this.authService.getMyProfile();

    if (profileError) {
      console.warn('getMyProfile error:', profileError.message);
    }

    const nombre = profile?.nombres?.trim() || null;
    this.authService.setCachedUserName(nombre);

    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');

    const isAdmin = profile?.is_admin === true;

    const targetUrl = returnUrl ?? (isAdmin ? '/admin-dashboard' : '/dashboard');

    await this.router.navigateByUrl(targetUrl);
  }



  private showError(message: string) {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['snackbar-error'],
    });
  }


  private mapLoginError(error: any): string {
    const msg = (error?.message || '').toLowerCase();

    if (msg.includes('invalid login credentials')) {
      return 'Correo o contraseña incorrectos.';
    }

    if (msg.includes('email not confirmed')) {
      return 'Debes confirmar tu correo antes de iniciar sesión.';
    }

    if (msg.includes('invalid email')) {
      return 'El formato del correo es inválido.';
    }

    return 'No se pudo iniciar sesión. Inténtalo nuevamente.';
  }


  async forgotPassword() {
    const email = this.loginForm.get('email')?.value;

    if (!email) {
      this.showError('Ingresa tu email para enviar el enlace de recuperación.');
      return;
    }

    // opcional: si quieres exigir formato válido
    if (this.loginForm.get('email')?.invalid) {
      this.showError('Ingresa un email válido.');
      return;
    }

    const { error } = await this.authService.sendPasswordResetEmail(email);

    if (error) {
      this.showError(error.message);
      return;
    }

    this.snackBar.open('Te enviamos un enlace para restablecer tu contraseña.', 'Cerrar', {
      duration: 4000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      // opcional si quieres clase distinta
      panelClass: ['snackbar-success'],
    });
  }
}
