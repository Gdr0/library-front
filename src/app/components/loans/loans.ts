import { CurrencyPipe, DOCUMENT } from '@angular/common';
import { Component, OnDestroy, OnInit, effect, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { Loan, LoanService } from '../../services/loan-service';
import { LoanDetailDrawer } from './loan-detail-drawer/loan-detail-drawer';
import { LoanDialog } from './loan-dialog/loan-dialog';

@Component({
  selector: 'app-loans',
  imports: [
    CurrencyPipe,
    MatButtonModule,
    MatDialogModule,
    MatTableModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    LoanDetailDrawer,
  ],
  templateUrl: './loans.html',
  styleUrl: './loans.scss',
})
export class Loans implements OnInit, OnDestroy {
  private readonly document = inject(DOCUMENT);

  constructor(
    private loanService: LoanService,
    private dialog: MatDialog,
  ) {
    effect(() => {
      this.toggleBackgroundScroll(this.selectedLoan() !== null);
    });
  }

  loans = signal<Loan[]>([]);
  selectedLoan = signal<Loan | null>(null);
  totalLoans = signal(0);
  currentPage = signal(1);
  pageSize = signal(10);
  loading = signal(false);
  detailLoading = signal(false);
  error = signal('');

  displayedColumns = ['client', 'period', 'status', 'bookTitles', 'books', 'sums'];

  ngOnInit(): void {
    this.loadLoans();
  }

  loadLoans(page: number = 1): void {
    this.loading.set(true);
    this.error.set('');

    this.loanService.getLoans(page).subscribe({
      next: (response) => {
        this.loans.set(response.loans.data);
        this.totalLoans.set(response.loans.total);
        this.currentPage.set(response.loans.current_page);
        this.pageSize.set(response.loans.per_page);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Impossibile caricare i prestiti');
        this.loading.set(false);
      },
    });
  }

  changePage(event: PageEvent): void {
    this.loadLoans(event.pageIndex + 1);
  }

  createLoan(): void {
    const dialogRef = this.dialog.open(LoanDialog, {
      width: '720px',
    });

    dialogRef.afterClosed().subscribe((saved) => {
      if (saved) {
        this.loadLoans(this.currentPage());
      }
    });
  }

  openLoanDetail(loan: Loan): void {
    this.detailLoading.set(true);

    this.loanService.getLoanDetail(loan.id).subscribe({
      next: (response) => {
        this.selectedLoan.set(response.loan);
        this.detailLoading.set(false);
      },
      error: () => {
        this.error.set('Impossibile caricare il dettaglio del prestito');
        this.detailLoading.set(false);
      },
    });
  }

  closeLoanDetail(): void {
    this.selectedLoan.set(null);
  }

  handleLoanUpdated(loan: Loan): void {
    this.loans.update((loans) =>
      loans.map((currentLoan) =>
        currentLoan.id === loan.id ? loan : currentLoan,
      ),
    );
    this.selectedLoan.set(null);
  }

  ngOnDestroy(): void {
    this.toggleBackgroundScroll(false);
  }

  formatDate(value: string | null): string {
    if (!value) {
      return '-';
    }

    return new Intl.DateTimeFormat('it-IT').format(new Date(value));
  }

  private toggleBackgroundScroll(locked: boolean): void {
    this.document.body.style.overflow = locked ? 'hidden' : '';
  }
}
