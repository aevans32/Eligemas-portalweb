import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterModule } from '@angular/router';
import { Header } from "../shared/components/header/header";
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [MatInputModule, Header,ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  authService = inject(AuthService);
  router = inject(Router);
  
  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6),]),
  });

  async login() {

    if (this.loginForm.invalid) return;

    const email = this.loginForm.controls.email.value!;
    const password = this.loginForm.controls.password.value!;

    const { data, error } = await this.authService.signIn(email, password);
    console.log('SESSION:', data.session);
    console.log('ACCESS TOKEN:', data.session?.access_token);

    if (error) {
      //TODO: show a MatSnackBar or a notification service
      console.error('Login error:', error.message);
      return;
    }

    await this.router.navigateByUrl('/');
  }
}
