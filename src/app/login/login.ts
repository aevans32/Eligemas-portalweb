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

@Component({
  selector: 'app-login',
  imports: [MatInputModule, Header,ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  router = inject(Router);
  
  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
    ]),
  });

  login() {
    const email = this.loginForm.controls.email.value!;
    const password = this.loginForm.controls.password.value!;

      // this.authService.login(email, password).subscribe((res) => {
      // localStorage.setItem('token', res.data.token);
      // localStorage.setItem('tokenExpiration', res.data.expirationDate);
      // this.authService.decodeToken();
      // this.notifications.success('Login exitoso', 'Bienvenido.');
    //   this.router.navigateByUrl('/');
    // });
    this.router.navigateByUrl('/');
  }
}
