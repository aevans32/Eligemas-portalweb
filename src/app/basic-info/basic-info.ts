import { Component, inject } from '@angular/core';
import { AuthService } from '../core/services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Header } from "../shared/components/header/header";
import { Footer } from "../shared/components/footer/footer";
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { adultMinAgeValidator } from '../core/validators/adult.validator';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { CatalogosService, TipoDocumentoRow } from '../core/services/catalogos.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';



type EstadoCivilRow = { codigo: string; nombre: string };
type ProvinciaRow = { code: string; nombre: string; departamento_code: string };


export const ES_DATE_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMMM YYYY',
    dateA11yLabel: 'DD/MM/YYYY',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

export function validDateValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const v = control.value;

    if (v === null || v === undefined || v === '') return null; // let "required" handle empty
    if (v instanceof Date && !isNaN(v.getTime())) return null;

    return { invalidDate: true };
  };
}

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
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule
  ],
  templateUrl: './basic-info.html',
  styleUrl: './basic-info.css',
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es-PE' }, 
    { provide: MAT_DATE_FORMATS, useValue: ES_DATE_FORMATS }],
})
export class BasicInfo {

  private auth = inject(AuthService);
  private catalog = inject(CatalogosService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);



  departamentos: Array<{ code: string; nombre: string }> = [];
  provincias: Array<{ code: string; nombre: string }> = [];


  estadosCiviles: EstadoCivilRow[] = [];
  tiposDocumento: TipoDocumentoRow[] = [];


  form = new FormGroup({
    nombres: new FormControl('', [Validators.required, Validators.minLength(2), Validators.pattern(/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]+$/)]),
    apellidos: new FormControl('', [Validators.required, Validators.minLength(2), Validators.pattern(/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]+$/)]),

    tipoDocumentoId: new FormControl<number | null>(null, [Validators.required]),
    num_documento: new FormControl('', [Validators.required]),

    // estadoCivil: new FormControl<EstadoCivil | null>(null, [Validators.required]),
    estadoCivilCodigo: new FormControl<string | null>(null, [Validators.required]),

    celular: new FormControl('', [Validators.required, Validators.pattern(/^9\d{8}$/)]),
    
    fechaNacimiento: new FormControl<Date | null>(
      null,
      [Validators.required, validDateValidator(), adultMinAgeValidator(18)]
    ),


    // direccion: new FormControl('', [Validators.required, Validators.minLength(5)]),
    tipoDireccion: new FormControl(null, Validators.required),
    direccionTexto: new FormControl('', Validators.required),
    numeroDireccion: new FormControl(null, [
      Validators.required,
      Validators.max(99999999) // máximo 8 dígitos
    ]),
    interior: new FormControl(''),
    urbanizacion: new FormControl(''),

    
    // provinciaCode: new FormControl<string | null>(null, [Validators.required]),
    provinciaCode: new FormControl<string | null>({ value: null, disabled: true}, [Validators.required]), 
    distrito: new FormControl('', [Validators.required, Validators.minLength(2)]),
    departamentoCode: new FormControl('', [Validators.required]),

  });

  dateKeyPress(e: KeyboardEvent) {
    const allowed = /[0-9/]/;
    if (!allowed.test(e.key)) {
      e.preventDefault();
    }
  }


  async ngOnInit() {
    // Must be logged in to complete this
    if (!this.auth.session) {
      // If user opens this page directly without coming from email confirmation
      await this.router.navigateByUrl('/login');
      return;
    }


    this.setupProvinciaDropdown();

    const [{ data: deps, error: depsErr }, { data: ec, error: ecErr }, { data: td, error: tdErr }] =
      await Promise.all([
        this.catalog.getDepartamentos(),
        this.catalog.getEstadosCiviles(),
        this.catalog.getTiposDocumento()
    ]);

    if (depsErr) console.error('Error loading departamentos:', depsErr.message);
    if (ecErr) console.error('Error loading estados_civiles:', ecErr.message);
    if (tdErr) console.error('Error loading tipos_documento:', tdErr.message);

    this.departamentos = deps ?? [];
    this.estadosCiviles = ec ?? [];
    this.tiposDocumento = td ?? [];

    
    if (depsErr) {
      console.error('Error loading departamentos:', depsErr.message);
      return;
    }

    this.setupDynamicValidators();
  }

  async save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const session = this.auth.session;
    if (!session) {
      await this.router.navigateByUrl('/login');
      return;
    }

    const v = this.form.getRawValue();

    const direccionFinal = [
      v.tipoDireccion,                // "Av." | "Jr." | "Calle"
      v.direccionTexto?.trim(),
      v.numeroDireccion != null ? String(v.numeroDireccion).trim() : null,
      v.interior?.trim() ? `Int. ${v.interior.trim()}` : null,
      v.urbanizacion?.trim() ? `Urb. ${v.urbanizacion.trim()}` : null,
    ].filter(Boolean).join(' ');


    // const profileInsert = {
    //   id: session.user.id,
    //   nombres: this.form.controls.nombres.value!.trim(),
    //   apellidos: this.form.controls.apellidos.value!.trim(),

    //   tipo_documento_id: this.form.controls.tipoDocumentoId.value!,
    //   num_documento: this.form.controls.num_documento.value!.trim(),

    //   estado_civil: this.form.controls.estadoCivilCodigo.value!,

    //   celular: this.form.controls.celular.value!,
    //   fecha_nacimiento: this.form.controls.fechaNacimiento.value!,

    //   direccion: direccionFinal,
    //   provincia: this.form.controls.provinciaCode.value!, // o guarda provincia_code en DB si prefieres
    //   distrito: this.form.controls.distrito.value!.trim(),

    //   departamento_code: this.form.controls.departamentoCode.value!,
    // };

    // const { error } = await this.auth.createProfile(profileInsert);

    const profileUpdate = {
      id: session.user.id,
      nombres: this.form.controls.nombres.value!.trim(),
      apellidos: this.form.controls.apellidos.value!.trim(),

      tipo_documento_id: this.form.controls.tipoDocumentoId.value!,
      num_documento: this.form.controls.num_documento.value!.trim(),

      estado_civil: this.form.controls.estadoCivilCodigo.value!,
      celular: this.form.controls.celular.value!,
      fecha_nacimiento: this.form.controls.fechaNacimiento.value!,

      direccion: direccionFinal,
      provincia: this.form.controls.provinciaCode.value!,
      distrito: this.form.controls.distrito.value!.trim(),
      departamento_code: this.form.controls.departamentoCode.value!,

      is_complete: true, // ✅ key
    };

    const { error } = await this.auth.upsertOrUpdateProfile(profileUpdate);


    if (error) {
      console.error('Profile insert error:', error.message);

      // optional: show error snackbar instead
      this.snackBar.open('No se pudo registrar. Inténtalo nuevamente.', 'Cerrar', {
        duration: 5000,
      });

      return;
    }

    // success path
    this.snackBar.open('Datos registrados correctamente', 'Cerrar', {
      duration: 4000,
      panelClass: ['snackbar-success'],
    });

    // optionally let user see it briefly before redirect
    setTimeout(() => {
      this.router.navigateByUrl('/dashboard');
    }, 800);
  }


  private setupDynamicValidators() {
    const tipoCtrl = this.form.controls.tipoDocumentoId;
    const docCtrl = this.form.controls.num_documento;

    const applyValidators = (tipoId: number | null) => {
      const validators = [Validators.required];

      if (!tipoId) {
        docCtrl.setValidators(validators);
        docCtrl.updateValueAndValidity({ emitEvent: false });
        return;
      }

      const tipo = this.tiposDocumento.find(t => t.id === tipoId);
      if (!tipo) return;

      //  length rules from DB
      validators.push(Validators.minLength(tipo.min_len));
      validators.push(Validators.maxLength(tipo.max_len));

      //  optional format rules by codigo
      if (['DNI', 'RUC'].includes(tipo.codigo)) {
        validators.push(Validators.pattern(/^\d+$/)); // numeric only
      } else {
        validators.push(Validators.pattern(/^[A-Za-z0-9]+$/)); // alphanumeric
      }

      docCtrl.setValidators(validators);
      docCtrl.updateValueAndValidity({ emitEvent: false });
    };

    // apply on load (in case value already exists)
    applyValidators(tipoCtrl.value);

    // re-apply when tipo changes
    tipoCtrl.valueChanges.subscribe((tipoId) => {
      docCtrl.setValue('', { emitEvent: false }); // reset value
      docCtrl.markAsUntouched();
      applyValidators(tipoId);
    });
  }

  private setupProvinciaDropdown() {
    const depCtrl = this.form.controls.departamentoCode;
    const provCtrl = this.form.controls.provinciaCode;

    // start disabled until we have provincias to show
    provCtrl.disable({ emitEvent: false});

    // cada vez que cambie el departamento:
    depCtrl.valueChanges.subscribe(async (depCode) => {
      // reset provincia y lista
      provCtrl.setValue(null, { emitEvent: false });
      provCtrl.markAsUntouched();
      this.provincias = [];

      if (!depCode) return;

      const { data, error } = await this.catalog.getProvinciasByDepartamento(depCode);
      if (error) {
        console.error('Error loading provincias:', error.message);
        return;
      }

      this.provincias = data ?? [];

      // enable only if we have options
      if (this.provincias.length > 0) {
        provCtrl.enable({ emitEvent: false});
      }

    });
  }


  get selectedTipoDocumento(): TipoDocumentoRow | null {
    const id = this.form.controls.tipoDocumentoId.value;
    return this.tiposDocumento.find(t => t.id === id) ?? null;
  }

  get documentoTooltip(): string {
  const tipo = this.selectedTipoDocumento;

  if (!tipo) {
    return 'Longitud requerida varia según el tipo de documento.';
  }

  const lengthText =
    tipo.min_len === tipo.max_len
      ? `${tipo.min_len}`
      : `${tipo.min_len}–${tipo.max_len}`;

  return `${tipo.codigo}: ${lengthText} caracteres`;
}



}
