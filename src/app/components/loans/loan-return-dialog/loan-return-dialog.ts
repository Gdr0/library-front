import { CurrencyPipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

export interface LoanReturnDialogBook {
  daily_price: number;
  book_id: number;
  remaining_quantity: number;
  title: string;
}

export interface LoanReturnDialogData {
  books: LoanReturnDialogBook[];
  loanId: number;
  mode: 'all' | 'single';
}

export interface LoanReturnDialogResult {
  books: Array<{
    book_id: number;
    returned_quantity: number;
  }>;
  returned_at: string;
}

type ReturnBookForm = FormGroup<{
  book_id: FormControl<number>;
  returned_quantity: FormControl<number>;
}>;

@Component({
  selector: 'app-loan-return-dialog',
  imports: [
    CurrencyPipe,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './loan-return-dialog.html',
  styleUrl: './loan-return-dialog.scss',
})
export class LoanReturnDialog {
  readonly returnForm: FormGroup<{
    books: FormArray<ReturnBookForm>;
    returned_at: FormControl<string>;
  }>;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly dialogRef: MatDialogRef<LoanReturnDialog, LoanReturnDialogResult>,
    @Inject(MAT_DIALOG_DATA) readonly data: LoanReturnDialogData,
  ) {
    this.returnForm = this.formBuilder.group({
      returned_at: this.formBuilder.nonNullable.control(this.todayValue(), Validators.required),
      books: this.formBuilder.array(
        data.books.map((book) =>
          this.formBuilder.group({
            book_id: this.formBuilder.nonNullable.control(book.book_id),
            returned_quantity: this.formBuilder.nonNullable.control(book.remaining_quantity, [
              Validators.required,
              Validators.min(1),
              Validators.max(book.remaining_quantity),
            ]),
          }),
        ),
      ),
    });
  }

  get books(): FormArray<ReturnBookForm> {
    return this.returnForm.controls.books;
  }

  confirm(): void {
    if (this.returnForm.invalid) {
      this.returnForm.markAllAsTouched();
      return;
    }

    const value = this.returnForm.getRawValue();
    this.dialogRef.close({
      returned_at: value.returned_at,
      books: value.books.map((book) => ({
        book_id: book.book_id,
        returned_quantity: book.returned_quantity,
      })),
    });
  }

  private todayValue(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = `${today.getMonth() + 1}`.padStart(2, '0');
    const day = `${today.getDate()}`.padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}
