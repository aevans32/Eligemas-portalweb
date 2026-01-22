import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export function adultMinAgeValidator(minAgeYears = 18): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    // required ya se encarga de vacío
    if (!value) return null;

    // value del input type="date" suele venir como "YYYY-MM-DD"
    const dob = new Date(value);

    // Fecha inválida
    if (isNaN(dob.getTime())) return { invalidDate: true };

    // Normaliza horas para evitar desfases
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Fecha de nacimiento no puede ser futura
    const dobLocal = new Date(dob);
    dobLocal.setHours(0, 0, 0, 0);
    if (dobLocal > today) return { futureDate: true };

    // Calcula la fecha límite: hoy - minAgeYears
    const cutoff = new Date(today);
    cutoff.setFullYear(cutoff.getFullYear() - minAgeYears);

    // Si nació después del cutoff => menor de edad
    if (dobLocal > cutoff) {
      return { underAge: { requiredAge: minAgeYears } };
    }

    return null;
  };
}
