import { Component, inject } from '@angular/core';
import { Header } from "../shared/components/header/header";
import { Footer } from "../shared/components/footer/footer";
import { AuthService } from '../core/services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-signup',
  imports: [
    Header, 
    Footer, 
    CommonModule, 
    ReactiveFormsModule, 
    RouterModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatSelectModule, 
    MatButtonModule
  ],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
})
export class Signup {

  private auth = inject(AuthService);
  private router = inject(Router);

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(8)]),
  });

  async signup() {
    if (this.form.invalid) return;

    const email = this.form.controls.email.value!;
    const password = this.form.controls.password.value!;

    //TODO: version con email
    const { error } = await this.auth.signUp(email, password);
    // const { data, error } = await this.auth.signUp(email, password);

    if (error) {
      console.error('SignUp error:', error.message);
      return;
    }

    // if (data.session) {
    //   alert('Cuenta creada. Revisa tu correo para confirmar y continuar con tu registro.');
    //   this.router.navigateByUrl('/basic-info');
    //   return;
    // }

    alert('Cuenta creada. Revisa tu correo para confirmar y continuar con tu registro.');
    
    this.router.navigateByUrl('/');

  }
}
