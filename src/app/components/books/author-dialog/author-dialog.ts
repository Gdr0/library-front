import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthorService } from '../../../services/author-service';
import { Author } from '../../../services/book-service';
import { ConfirmationDialog } from '../../../shared/confirmation-dialog/confirmation-dialog';

@Component({
  selector: 'app-author-dialog',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './author-dialog.html',
})
export class AuthorDialog {
  authorForm: FormGroup<{
    last_name: FormControl<string>;
    name: FormControl<string>;
  }>;

  error = '';
  saving = false;

  constructor(
    private readonly authorService: AuthorService,
    private readonly dialog: MatDialog,
    private readonly dialogRef: MatDialogRef<AuthorDialog, Author>,
    private readonly formBuilder: FormBuilder,
  ) {
    this.authorForm = this.formBuilder.group({
      name: this.formBuilder.nonNullable.control('', [Validators.required, Validators.maxLength(50)]),
      last_name: this.formBuilder.nonNullable.control('', [Validators.required, Validators.maxLength(50)]),
    });
  }

  save(): void {
    if (this.authorForm.invalid) {
      this.authorForm.markAllAsTouched();
      return;
    }

    this.dialog.open(ConfirmationDialog, {
      width: '420px',
      data: {
        title: 'Confermare nuovo autore?',
        confirmLabel: 'Salva',
      },
    }).afterClosed().subscribe((confirmed) => {
      if (!confirmed) {
        return;
      }

      this.saving = true;
      this.error = '';

      this.authorService.createAuthor(this.authorForm.getRawValue()).subscribe({
        next: (response) => {
          this.dialogRef.close(response.author);
        },
        error: (error: HttpErrorResponse) => {
          this.error = error.error.errors.name?.[0]
            ?? error.error.errors.last_name?.[0];
          this.saving = false;
        },
      });
    });
  }
}
