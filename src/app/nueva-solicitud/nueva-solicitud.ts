import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { Header } from "../shared/components/header/header";
import { Footer } from "../shared/components/footer/footer";
import { CatalogItem, CatalogosService } from '../core/services/catalogos.service';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../core/services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { SolicitudesService, SolicitudInsert } from '../core/services/solicitudes.service';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmationSnackbarComponent } from './confirmation-snackbar';

@Component({
  selector: 'app-nueva-solicitud',
  imports: [
    Header,
    Footer,
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatRadioModule,
    MatTooltipModule
  ],
  templateUrl: './nueva-solicitud.html',
  styleUrl: './nueva-solicitud.css',
})
export class NuevaSolicitud implements OnInit {

  private auth = inject(AuthService);
  private router = inject(Router);
  private catalogos = inject(CatalogosService);
  private solicitudes = inject(SolicitudesService);
  private snackBar = inject(MatSnackBar);

  @ViewChild('creditoSection') creditoSection!: ElementRef<HTMLElement>;
  @ViewChild('perfilSection') perfilSection!: ElementRef<HTMLElement>;

  entidades: CatalogItem[] = [];
  monedas: CatalogItem[] = [];
  

  loading = true;
  submitting = false;
  errorMsg: string | null = null;

  step = 1; // 1 = Credito, 2 = Perfil

  goStep(next: 1 | 2) {
    this.step = next;
    // optional: scroll to top of wrapper for nicer UX
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }



  tooltips = {
    // Step 1 - Crédito
    entidad_financiera_id: 'Selecciona el banco/financiera donde tienes el crédito que deseas refinanciar.',
    moneda_id: 'Moneda en la que está el crédito actual (PEN / USD).',
    monto_total_credito: 'Monto original desembolsado al inicio del crédito.',
    monto_actual_credito: 'Saldo aproximado pendiente de pago hoy.',
    plazo_total_meses: 'Plazo total pactado al inicio del crédito (en meses).',
    numero_cuotas_pagadas: 'Cuotas ya pagadas hasta la fecha (aprox).',
    tea: 'Tasa Efectiva Anual (sin comisiones). Ej: 25.50',
    tcea: 'Tasa de Costo Efectivo Anual (incluye comisiones/seguros si aplica).',
    placa_vehiculo: 'Si el crédito está asociado a un vehículo, ingresa la placa (6 caracteres).',

    // Step 2 - Perfil
    es_dependiente: 'Dependiente: planilla. Independiente: recibos por honorarios/negocio.',
    ruc_empleador: 'RUC de tu empleador (solo si eres dependiente).',
    razon_social_empleador: 'Nombre legal del empleador (opcional, recomendado).',
    ruc_titular: 'RUC del negocio o del titular (solo si eres independiente).',
    ocupacion: 'Actividad/ocupación principal (máx. 50 caracteres).',
    moneda_ingreso_id: 'Moneda en la que recibes la mayor parte de tus ingresos.',
    ingreso_bruto: 'Ingreso bruto mensual aproximado (antes de descuentos).',
  } as const;

  tooltipPos: 'above' | 'below' | 'left' | 'right' = 'above';
  tooltipDelay = 200;







  form = new FormGroup({
    // Datos del Crédito (NOT NULL)
    entidad_financiera_id: new FormControl<number | null>(null, [Validators.required]),
    moneda_id: new FormControl<number | null>(null, [Validators.required]),

    monto_total_credito: new FormControl<number | null>(null, [Validators.required]),
    monto_actual_credito: new FormControl<number | null>(null, [Validators.required]),

    plazo_total_meses: new FormControl<number | null>(null, [Validators.required, Validators.min(1)]),
    numero_cuotas_pagadas: new FormControl<number | null>(null, [Validators.required, Validators.min(1)]),

    tcea: new FormControl<number | null>(null, [Validators.required, Validators.min(0)]),
    tea: new FormControl<number | null>(null, [Validators.required, Validators.min(0)]),

    placa_vehiculo: new FormControl<string | null>(null, [
      Validators.required,
      Validators.minLength(6),
      Validators.maxLength(6),
      Validators.pattern(/^[A-Za-z0-9]{6}$/)
    ]),


    // Perfil (condicion_laboral_id NOT NULL)
    // condicion_laboral_id: new FormControl<number | null>(null, [Validators.required]),
    es_dependiente: new FormControl<boolean | null>(null, [Validators.required]),


    // Opcionales
    ruc_empleador: new FormControl<string | null>(null),
    razon_social_empleador: new FormControl<string | null>(null),

    ruc_titular: new FormControl<string | null>(null),
    ocupacion: new FormControl<string | null>(null),

    // NOT NULL
    moneda_ingreso_id: new FormControl<number | null>(null, [Validators.required]),
    ingreso_bruto: new FormControl<number | null>(null, [Validators.required, Validators.min(0)]),
  });




  async ngOnInit() {

    await this.auth.init();

    try {
      this.loading = true;

      const [e, m] = await Promise.all([
        this.catalogos.getEntidadesFinancieras(),
        this.catalogos.getMonedas(),
      ]);

      if (e.error) throw e.error;
      if (m.error) throw m.error;

      this.entidades = e.data ?? [];
      this.monedas = m.data ?? [];

      this.form.controls.es_dependiente.valueChanges.subscribe((v) => {
        const rucEmp = this.form.controls.ruc_empleador;
        const rsEmp  = this.form.controls.razon_social_empleador;

        const rucTit = this.form.controls.ruc_titular;
        const ocu    = this.form.controls.ocupacion;

        if (v === true) {
          // DEPENDIENTE → (ya tienes) ruc_empleador + razon_social_empleador

          // desactivar independiente
          rucTit.clearValidators();
          rucTit.reset(null, { emitEvent: false });
          rucTit.updateValueAndValidity({ emitEvent: false });

          ocu.clearValidators();
          ocu.reset(null, { emitEvent: false });
          ocu.updateValueAndValidity({ emitEvent: false });

          // reset visual
          rucTit.markAsUntouched();
          ocu.markAsUntouched();
        }

        if (v === false) {
          // INDEPENDIENTE → validar ruc_titular + ocupacion
          rucTit.setValidators([Validators.required, Validators.pattern(/^\d{11}$/)]);
          rucTit.updateValueAndValidity({ emitEvent: false });

          ocu.setValidators([
            Validators.required,
            Validators.minLength(2),
            Validators.maxLength(50),
            Validators.pattern(/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 .&\-\/]+$/)
          ]);
          ocu.updateValueAndValidity({ emitEvent: false });

          // desactivar dependiente
          rucEmp.clearValidators();
          rucEmp.reset(null, { emitEvent: false });
          rucEmp.updateValueAndValidity({ emitEvent: false });

          rsEmp.clearValidators();
          rsEmp.reset(null, { emitEvent: false });
          rsEmp.updateValueAndValidity({ emitEvent: false });

          // reset visual
          rucTit.markAsUntouched();
          ocu.markAsUntouched();
        }
      });





      
    } catch (err: any) {
      this.errorMsg = err?.message ?? 'Error cargando catálogos';
    } finally {
      this.loading = false;
    }
  }

  goDashboard() {
    this.router.navigateByUrl('/dashboard');
  }

  scrollToCredito() {
    this.creditoSection?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  scrollToPerfil() {
    this.perfilSection?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  private logInvalidControls() {
    const invalid = Object.entries(this.form.controls)
      .filter(([_, c]) => c.invalid)
      .map(([name, c]) => ({
        name,
        value: c.value,
        errors: c.errors
      }));

    console.log('[NuevaSolicitud] Controles inválidos:', invalid);
  }



  

  private upperOrNull(v: string | null | undefined) {
    if (!v) return null;
    const t = v.trim();
    return t ? t.toUpperCase() : null;
  }


  async enviar() {

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      // this.logInvalidControls();
      return;
    }


    const session = this.auth.session;
    const userId = session?.user?.id;

    if (!userId) {
      this.errorMsg = 'No hay sesión activa. Vuelve a iniciar sesión.';
      // console.log('[NuevaSolicitud] no hay sesión activa');
      return;
    }

    try {
      this.submitting = true;
      this.errorMsg = null;

      const v = this.form.getRawValue();

      const placa = this.upperOrNull(v.placa_vehiculo);
      if (!placa) {
        // aunque tengas Validators.required, TS no lo sabe; y además esto refuerza UX
        this.form.controls.placa_vehiculo.setErrors({ required: true });
        this.form.controls.placa_vehiculo.markAsTouched();
        // console.log('[NuevaSolicitud] placa inválida');
        return;
      }

      const payload: SolicitudInsert = {
        user_id: userId,
        estado_id: 3,   // 3 = en proceso, o revisar tabla 'solicitud-estado'

        entidad_financiera_id: v.entidad_financiera_id!,
        moneda_id: v.moneda_id!,

        monto_total_credito: v.monto_total_credito!,
        monto_actual_credito: v.monto_actual_credito!,

        plazo_total_meses: v.plazo_total_meses!,
        numero_cuotas_pagadas: v.numero_cuotas_pagadas!,

        tea: v.tea!,
        tcea: v.tcea!,

        placa_vehiculo: placa, // <-- ahora sí es string

        es_dependiente: v.es_dependiente!,

        ruc_empleador: this.upperOrNull(v.ruc_empleador),
        razon_social_empleador: (v.razon_social_empleador ?? '').trim() || null,
        ruc_titular: this.upperOrNull(v.ruc_titular),

        ocupacion: (v.ocupacion ?? '').trim() || null,
        moneda_ingreso_id: v.moneda_ingreso_id!,
        ingreso_bruto: v.ingreso_bruto!,
      };

      this.snackBar.openFromComponent(ConfirmationSnackbarComponent, {
        data: {
          title: 'Solicitud enviada',
          message: 'Estamos evaluando tus opciones de refinanciamiento.'
        },
        duration: 6000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['success-snackbar']
      });


      const { data, error } = await this.solicitudes.createSolicitud(payload);

      if (error) throw error;

      // listo: vuelve al dashboard (puedes pasar el id si quieres)
      // this.router.navigateByUrl(`/dashboard?solicitud=${data.id}`);
      this.router.navigateByUrl(`/dashboard`);
    } catch (err: any) {
      this.errorMsg = err?.message ?? 'Error enviando solicitud';
      // si te falló por RLS, este mensaje normalmente lo indica
    } finally {
      this.submitting = false;
    }
  }

  onlyNumbers(e: KeyboardEvent) {
    if (!/[0-9]/.test(e.key)) {
      e.preventDefault();
    }
  }


}
