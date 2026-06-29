import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface ConfirmationDialogData {
  confirmLabel?: string;
  description?: string;
  title: string;
}

@Component({
  selector: 'app-confirmation-dialog',
  imports: [
    MatButtonModule,
    MatDialogModule,
  ],
  templateUrl: './confirmation-dialog.html',
})
export class ConfirmationDialog {
  constructor(
    private readonly dialogRef: MatDialogRef<ConfirmationDialog, boolean>,
    @Inject(MAT_DIALOG_DATA) readonly data: ConfirmationDialogData,
  ) {}

  confirm(): void {
    this.dialogRef.close(true);
  }
}
