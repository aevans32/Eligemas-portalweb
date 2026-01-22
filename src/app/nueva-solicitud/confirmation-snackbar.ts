import { Component, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';

@Component({
  selector: 'app-confirmation-snackbar',
  template: `
    <div class="snackbar-container">
      <div class="icon">✅</div>
      <div class="content">
        <h3>{{ data.title }}</h3>
        <p>{{ data.message }}</p>
      </div>
      <button mat-button (click)="close()">Cerrar</button>
    </div>
  `,
  styleUrls: ['./confirmation-snackbar.css']
})
export class ConfirmationSnackbarComponent {
  constructor(
    private ref: MatSnackBarRef<ConfirmationSnackbarComponent>,
    @Inject(MAT_SNACK_BAR_DATA) public data: any
  ) {}

  close() {
    this.ref.dismiss();
  }
}
