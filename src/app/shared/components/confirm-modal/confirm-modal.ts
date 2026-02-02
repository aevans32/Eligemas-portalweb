import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

export type ConfirmModalData = {
  title: string;
  message: string;
  primaryText?: string;
  icon?: string;
}

@Component({
  selector: 'app-confirm-modal',
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './confirm-modal.html',
  styleUrl: './confirm-modal.css',
})
export class ConfirmModal {

  private dialogRef = inject(MatDialogRef<ConfirmModalData>);
  data = inject<ConfirmModalData>(MAT_DIALOG_DATA);

  close() {
    this.dialogRef.close(true);
  }

}
