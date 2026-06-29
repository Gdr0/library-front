import { CurrencyPipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { LoanReturnDialog, LoanReturnDialogData, LoanReturnDialogResult } from '../loan-return-dialog/loan-return-dialog';
import { BookLoan, Loan, LoanService } from '../../../services/loan-service';
import { ConfirmationDialog } from '../../../shared/confirmation-dialog/confirmation-dialog';

@Component({
  selector: 'app-loan-detail-drawer',
  imports: [CurrencyPipe, MatButtonModule],
  templateUrl: './loan-detail-drawer.html',
  styleUrl: './loan-detail-drawer.scss',
})
export class LoanDetailDrawer {
  @Input({ required: true }) loan: Loan | null = null;
  @Output() loanUpdated = new EventEmitter<Loan>();

  actionError = '';
  actionLoading = false;

  constructor(
    private readonly dialog: MatDialog,
    private readonly loanService: LoanService,
  ) {}

  formatDate(value: string | null): string {
    if (!value) {
      return '-';
    }

    return new Intl.DateTimeFormat('it-IT').format(new Date(value));
  }

  remainingQuantity(bookLoan: BookLoan): number {
    return Math.max(bookLoan.quantity - bookLoan.returned_books_quantity, 0);
  }

  canReturnMore(bookLoan: BookLoan): boolean {
    return this.remainingQuantity(bookLoan) > 0 && !this.actionLoading;
  }

  canReturnLoan(): boolean {
    return !!this.loan && this.loan.book_loans.some((bookLoan) => this.remainingQuantity(bookLoan) > 0) && !this.actionLoading;
  }

  openReturnAllDialog(): void {
    if (!this.loan) {
      return;
    }

    const books = this.loan.book_loans
      .map((bookLoan) => ({
        daily_price: Number(bookLoan.unit_price),
        book_id: bookLoan.book_id,
        remaining_quantity: this.remainingQuantity(bookLoan),
        title: bookLoan.book.title,
      }))
      .filter((book) => book.remaining_quantity > 0);

    if (books.length === 0) {
      return;
    }

    this.openReturnDialog({
      books,
      loanId: this.loan.id,
      mode: 'all',
    });
  }

  openReturnBookDialog(bookLoan: BookLoan): void {
    if (!this.loan || this.remainingQuantity(bookLoan) === 0) {
      return;
    }

    this.openReturnDialog({
      books: [
        {
          daily_price: Number(bookLoan.unit_price),
          book_id: bookLoan.book_id,
          remaining_quantity: this.remainingQuantity(bookLoan),
          title: bookLoan.book.title,
        },
      ],
      loanId: this.loan.id,
      mode: 'single',
    });
  }

  private openReturnDialog(data: LoanReturnDialogData): void {
    const dialogRef = this.dialog.open(LoanReturnDialog, {
      width: '520px',
      data,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.submitReturn(result);
      }
    });
  }

  private submitReturn(result: LoanReturnDialogResult): void {
    if (!this.loan) {
      return;
    }

    this.dialog.open(ConfirmationDialog, {
      width: '420px',
      data: {
        title: 'Confermare registrazione rientro?',
        confirmLabel: 'Conferma',
      },
    }).afterClosed().subscribe((confirmed) => {
      if (!confirmed || !this.loan) {
        return;
      }

      this.actionLoading = true;
      this.actionError = '';

      this.loanService.returnBookOrLoan({
        id_loan: this.loan.id,
        returned_at: result.returned_at,
        books: result.books,
      }).subscribe({
        next: (response) => {
          this.loan = response.loan;
          this.loanUpdated.emit(response.loan);
          this.actionLoading = false;
        },
        error: (error) => {
          this.actionError = error.error.errors.books[0];
          this.actionLoading = false;
        },
      });
    });
  }
}
