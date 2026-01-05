import { Component, inject } from '@angular/core';
import { AuthService } from '../core/services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { EstadoCivil } from '../shared/models/profile-insert';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Header } from "../shared/components/header/header";
import { Footer } from "../shared/components/footer/footer";
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-basic-info',
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
  templateUrl: './basic-info.html',
  styleUrl: './basic-info.css',
})
export class BasicInfo {

  private auth = inject(AuthService);
  private router = inject(Router);

  departamentos: Array<{ code: string; nombre: string }> = [];
  estadoCivilOptions: EstadoCivil[] = ['soltero', 'casado', 'divorciado', 'viudo', 'conviviente'];

  form = new FormGroup({
    nombres: new FormControl('', [Validators.required, Validators.minLength(2)]),
    apellidos: new FormControl('', [Validators.required, Validators.minLength(2)]),

    dni: new FormControl('', [Validators.required, Validators.pattern(/^\d{8}$/)]),
    estadoCivil: new FormControl<EstadoCivil | null>(null, [Validators.required]),
    celular: new FormControl('', [Validators.required, Validators.pattern(/^\d{9}$/)]),
    fechaNacimiento: new FormControl('', [Validators.required]),

    direccion: new FormControl('', [Validators.required, Validators.minLength(5)]),
    ciudad: new FormControl('', [Validators.required, Validators.minLength(2)]),
    departamentoCode: new FormControl('', [Validators.required]),
  });


  async ngOnInit() {
    // Must be logged in to complete this
    if (!this.auth.session) {
      // If user opens this page directly without coming from email confirmation
      await this.router.navigateByUrl('/login');
      return;
    }

    const { data, error } = await this.auth.getDepartamentos();
    if (error) {
      console.error('Error loading departamentos:', error.message);
      return;
    }
    this.departamentos = data ?? [];
  }

  async save() {
    if (this.form.invalid) return;

    const session = this.auth.session;
    if (!session) {
      await this.router.navigateByUrl('/login');
      return;
    }

    const profileInsert = {
      id: session.user.id,
      nombres: this.form.controls.nombres.value!.trim(),
      apellidos: this.form.controls.apellidos.value!.trim(),
      dni: this.form.controls.dni.value!,
      estado_civil: this.form.controls.estadoCivil.value!,
      celular: this.form.controls.celular.value!,
      fecha_nacimiento: this.form.controls.fechaNacimiento.value!,
      direccion: this.form.controls.direccion.value!.trim(),
      ciudad: this.form.controls.ciudad.value!.trim(),
      departamento_code: this.form.controls.departamentoCode.value!,
    };

    const { error } = await this.auth.createProfile(profileInsert);
    if (error) {
      console.error('Profile insert error:', error.message);
      // common: duplicate dni -> violates unique constraint
      return;
    }

    await this.router.navigateByUrl('/dashboard');
  }
}
