import { Component, inject } from '@angular/core';
import { Header } from "../shared/components/header/header";
import { Footer } from "../shared/components/footer/footer";
import { AuthService } from '../core/services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { EstadoCivil } from '../shared/models/profile-insert';
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

  departamentos: Array<{ code: string; nombre: string }> = [];

  estadoCivilOptions: EstadoCivil[] = ['soltero', 'casado', 'divorciado', 'viudo', 'conviviente'];

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(8)]),

    nombres: new FormControl('', [Validators.required, Validators.minLength(2)]),
    apellidos: new FormControl('', [Validators.required, Validators.minLength(2)]),

    dni: new FormControl('', [
      Validators.required,
      Validators.pattern(/^\d{8}$/),
    ]),

    estadoCivil: new FormControl<EstadoCivil | null>(null, [Validators.required]),

    celular: new FormControl('', [
      Validators.required,
      Validators.pattern(/^\d{9}$/),
    ]),

    fechaNacimiento: new FormControl('', [Validators.required]), // we'll send YYYY-MM-DD

    direccion: new FormControl('', [Validators.required, Validators.minLength(5)]),
    ciudad: new FormControl('', [Validators.required, Validators.minLength(2)]),
    departamentoCode: new FormControl('', [Validators.required]),
  });

  async ngOnInit() {
    const { data, error } = await this.auth.getDepartamentos();
    if (error) {
      console.error('Error loading departamentos:', error.message);
      return;
    }
    this.departamentos = data ?? [];
  }


  async signup() {
    if (this.form.invalid) return;

    const email = this.form.controls.email.value!;
    const password = this.form.controls.password.value!;

    const { data: signUpData, error: signUpError } = await this.auth.signUp(email, password);
    if (signUpError) {
      console.error('SignUp error:', signUpError.message);
      return;
    }

    // If email confirmations are ON, session can be null here
    const userId = signUpData.user?.id;
    const sessionUserId = signUpData.session?.user?.id;

    const id = sessionUserId ?? userId;
    if (!id) {
      console.error('No user id returned from Supabase.');
      return;
    }

    // If session is null, inserting may fail due to RLS (auth.uid() is null).
    // MVP behavior: ask user to confirm email first.
    if (!signUpData.session) {
      // Show a friendly message in UI in your style (snackbar, banner, etc.)
      alert('Cuenta creada. Revisa tu correo para confirmar tu registro y luego inicia sesión.');
      await this.router.navigateByUrl('/login');
      return;
    }

    const profileInsert = {
      id,
      nombres: this.form.controls.nombres.value!.trim(),
      apellidos: this.form.controls.apellidos.value!.trim(),
      dni: this.form.controls.dni.value!,
      estado_civil: this.form.controls.estadoCivil.value!,
      celular: this.form.controls.celular.value!,
      fecha_nacimiento: this.form.controls.fechaNacimiento.value!, // should be YYYY-MM-DD
      direccion: this.form.controls.direccion.value!.trim(),
      ciudad: this.form.controls.ciudad.value!.trim(),
      departamento_code: this.form.controls.departamentoCode.value!,
    };

    const { error: profileError } = await this.auth.createProfile(profileInsert);
    if (profileError) {
      console.error('Profile insert error:', profileError.message);
      return;
    }

    await this.router.navigateByUrl('/dashboard');
  }

}
