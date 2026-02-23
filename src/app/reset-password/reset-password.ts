import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Footer } from "../shared/components/footer/footer";
import { Header } from "../shared/components/header/header";
import { AuthService } from '../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { MatInputModule } from "@angular/material/input";
import { MatIconModule } from "@angular/material/icon";
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    Footer, 
    Header, 
    MatInputModule, 
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
})
export class ResetPassword {

  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  resetForm: FormGroup;
  hidePassword = true;
  hideConfirm = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.resetForm = this.fb.group(
      {
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(/[A-Z]/)
          ]
        ],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator }
    );

    // para que al cambiar password revalide confirm
    this.resetForm.get('password')?.valueChanges.subscribe(() => {
      this.resetForm.get('confirmPassword')?.updateValueAndValidity({ onlySelf: true });
    });
  }

  // Validador personalizado para verificar que coincidan
  private passwordMatchValidator = (form: FormGroup) => {
    const password = form.get('password')?.value;
    const confirmCtrl = form.get('confirmPassword');
    const confirm = confirmCtrl?.value;

    if (!confirmCtrl) return null;

    // si aún no escribió confirm, no molestamos
    if (!confirm) {
      // limpia mismatch si existía
      if (confirmCtrl.hasError('passwordMismatch')) {
        const { passwordMismatch, ...rest } = confirmCtrl.errors ?? {};
        confirmCtrl.setErrors(Object.keys(rest).length ? rest : null);
      }
      return null;
    }

    if (password !== confirm) {
      confirmCtrl.setErrors({ ...(confirmCtrl.errors ?? {}), passwordMismatch: true });
      return { passwordMismatch: true };
    }

    // si ya coincide, limpiamos el error
    if (confirmCtrl.hasError('passwordMismatch')) {
      const { passwordMismatch, ...rest } = confirmCtrl.errors ?? {};
      confirmCtrl.setErrors(Object.keys(rest).length ? rest : null);
    }

    return null;
  };

  async onSubmit() {
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      this.showError('Revisa la contraseña y su confirmación.');
      return;
    }

    const password = this.resetForm.get('password')?.value as string;
    const confirmPassword = this.resetForm.get('confirmPassword')?.value as string;

    const { error } = await this.authService.updatePassword(password, confirmPassword);

    if (error) {
      this.showError(error.message);
      return;
    }

    this.showSuccess('Contraseña actualizada correctamente');

    setTimeout(() => this.router.navigateByUrl('/dashboard'), 1000);
  }

  private showError(message: string) {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['snackbar-error'],
    });
  }

  private showSuccess(message: string) {
    this.snackBar.open(message, 'Cerrar', {
      duration: 4000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['snackbar-success'],
    });
  }
}