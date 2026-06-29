import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import {
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { forkJoin } from 'rxjs';
import { Book, BookService } from '../../../services/book-service';
import { Client, ClientService } from '../../../services/client-service';
import { DocumentTypeService } from '../../../services/document-type-service';
import {
  DocumentType,
  LoanCreatePayload,
  LoanService,
} from '../../../services/loan-service';
import { ConfirmationDialog } from '../../../shared/confirmation-dialog/confirmation-dialog';

type LoanBookForm = FormGroup<{
  book_id: FormControl<number>;
  quantity: FormControl<number>;
}>;

@Component({
  selector: 'app-loan-dialog',
  imports: [
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatChipsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
  ],
  templateUrl: './loan-dialog.html',
  styleUrl: './loan-dialog.scss',
})
export class LoanDialog implements OnInit {
  clientSearch = new FormControl<string | Client>('', { nonNullable: true });
  bookSearch = new FormControl('', { nonNullable: true });

  loanForm: FormGroup<{
    client_id: FormControl<number | null>;
    client_name: FormControl<string>;
    client_last_name: FormControl<string>;
    client_phone_number: FormControl<string>;
    client_email: FormControl<string>;
    document_type_id: FormControl<number>;
    document_number: FormControl<string>;
    expiring_at: FormControl<string>;
    books: FormArray<LoanBookForm>;
  }>;

  loading = true;
  saving = false;
  error = '';

  allClients: Client[] = [];
  filteredClients: Client[] = [];
  allBooks: Book[] = [];
  filteredBooks: Book[] = [];
  documentTypes: DocumentType[] = [];
  selectedBooks: Book[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private bookService: BookService,
    private clientService: ClientService,
    private documentTypeService: DocumentTypeService,
    private loanService: LoanService,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<LoanDialog>,
  ) {
    this.loanForm = this.formBuilder.group({
      client_id: this.formBuilder.control<number | null>(null),
      client_name: this.formBuilder.nonNullable.control('', [Validators.required, Validators.maxLength(25)]),
      client_last_name: this.formBuilder.nonNullable.control('', [Validators.required, Validators.maxLength(25)]),
      client_phone_number: this.formBuilder.nonNullable.control('', [Validators.required, Validators.maxLength(25)]),
      client_email: this.formBuilder.nonNullable.control('', [Validators.required, Validators.email, Validators.maxLength(255)]),
      document_type_id: this.formBuilder.nonNullable.control(0, [Validators.required, Validators.min(1)]),
      document_number: this.formBuilder.nonNullable.control('', [Validators.required, Validators.maxLength(255)]),
      expiring_at: this.formBuilder.nonNullable.control('', Validators.required),
      books: this.formBuilder.array<LoanBookForm>([], Validators.required),
    });
  }

  get books(): FormArray<LoanBookForm> {
    return this.loanForm.controls.books;
  }

  ngOnInit(): void {
    forkJoin({
      clients: this.clientService.getAllClients(),
      books: this.bookService.getAllBooks(),
      documentTypes: this.documentTypeService.getDocumentTypes(),
    }).subscribe({
      next: ({ clients, books, documentTypes }) => {
        this.allClients = clients;
        this.allBooks = books;
        this.documentTypes = documentTypes.documentTypes;
        this.loading = false;
      },
      error: () => {
        this.error = 'Impossibile caricare i dati del prestito';
        this.loading = false;
      },
    });
  }

  searchClients(event?: Event): void {
    const search = event
      ? (event.target as HTMLInputElement).value.toLowerCase()
      : '';

    if (event) {
      this.loanForm.controls.client_id.setValue(null);
    }

    if (!search.trim()) {
      this.filteredClients = [];
      return;
    }

    this.filteredClients = this.allClients.filter((client) =>
      `${client.name} ${client.last_name} ${client.phone_number} ${client.email}`
        .toLowerCase()
        .includes(search),
    );
  }

  selectClient(event: MatAutocompleteSelectedEvent): void {
    const client = event.option.value as Client;

      this.loanForm.patchValue({
        client_id: client.id,
        client_name: client.name,
        client_last_name: client.last_name,
        client_phone_number: client.phone_number,
        client_email: client.email,
      });

    this.clientSearch.setValue(client);
  }

  displayClient(client: Client | string): string {
    if (typeof client === 'string') {
      return client;
    }

    return client ? `${client.name} ${client.last_name}` : '';
  }

  searchBooks(event?: Event): void {
    const search = event
      ? (event.target as HTMLInputElement).value.toLowerCase()
      : '';

    if (!search.trim()) {
      this.filteredBooks = [];
      return;
    }

    this.filteredBooks = this.allBooks.filter((book) =>
      book.title.toLowerCase().includes(search),
    ).filter((book) =>
      !this.selectedBooks.some((selectedBook) => selectedBook.id === book.id),
    );
  }

  selectBook(event: MatAutocompleteSelectedEvent): void {
    const book = event.option.value as Book;

    this.selectedBooks.push(book);
    this.books.push(
      this.formBuilder.group({
        book_id: this.formBuilder.nonNullable.control(book.id),
        quantity: this.formBuilder.nonNullable.control(1, [Validators.required, Validators.min(1)]),
      }),
    );

    this.bookSearch.setValue('');
    this.filteredBooks = [];
  }

  removeBook(book: Book): void {
    const index = this.selectedBooks.findIndex(
      (selectedBook) => selectedBook.id === book.id,
    );

    if (index === -1) {
      return;
    }

    this.selectedBooks.splice(index, 1);
    this.books.removeAt(index);
  }

  save(): void {
    if (this.loanForm.invalid || this.books.length === 0) {
      this.loanForm.markAllAsTouched();
      return;
    }

    this.dialog.open(ConfirmationDialog, {
      width: '420px',
      data: {
        title: 'Confermare nuovo prestito?',
        confirmLabel: 'Salva',
      },
    }).afterClosed().subscribe((confirmed) => {
      if (!confirmed) {
        return;
      }

      const formValue = this.loanForm.getRawValue();

      const payload: LoanCreatePayload = {
        client_id: formValue.client_id ?? undefined,
        client: {
          name: formValue.client_name,
          last_name: formValue.client_last_name,
          phone_number: formValue.client_phone_number,
          email: formValue.client_email,
        },
        document_type_id: formValue.document_type_id,
        document_number: formValue.document_number,
        expiring_at: formValue.expiring_at,
        books: formValue.books.map((book) => ({
          book_id: book.book_id,
          quantity: book.quantity,
        })),
      };

      this.saving = true;
      this.error = '';

      this.loanService.createLoan(payload).subscribe({
        next: () => {
          this.dialogRef.close(true);
        },
        error: (error: HttpErrorResponse) => {
          this.error = error.error.errors.books?.[0]
            ?? error.error.errors.expiring_at?.[0]
            ?? error.error.errors.client_phone_number?.[0]
            ?? error.error.errors.client_email?.[0]
            ?? error.error.errors.document_number?.[0];
          this.saving = false;
        },
      });
    });
  }

  minExpiringDate(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const year = tomorrow.getFullYear();
    const month = `${tomorrow.getMonth() + 1}`.padStart(2, '0');
    const day = `${tomorrow.getDate()}`.padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}
