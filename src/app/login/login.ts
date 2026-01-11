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

@Component({
  selector: 'app-login',
  imports: [MatInputModule, Header, ReactiveFormsModule, RouterModule, Footer],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  authService = inject(AuthService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  
  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6),]),
  });

  async login() {
    if (this.loginForm.invalid) return;

    const email = this.loginForm.controls.email.value!;
    const password = this.loginForm.controls.password.value!;

    const { error } = await this.authService.signIn(email, password);

    if (error) {
      console.error('Login error:', error.message);
      return;
    }

    // Ahora que ya hay sesión, trae profile y cachea nombre
    const { data: profile, error: profileError } = await this.authService.getMyProfile();

    if (profileError) {
      console.warn('getMyProfile error:', profileError.message);
    }

    const nombre = profile?.nombres?.trim() || null;
    this.authService.setCachedUserName(nombre);

    const returnUrl =
      this.route.snapshot.queryParamMap.get('returnUrl') || '/dashboard';

    await this.router.navigateByUrl(returnUrl);
  }
}
