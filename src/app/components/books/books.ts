import { Component, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { Book, BookService, Genre } from '../../services/book-service';
import { GenreService } from '../../services/genre-service';
import { AuthorDialog } from './author-dialog/author-dialog';
import { BookDialog } from './book-dialog/book-dialog';

@Component({
  selector: 'app-books',
  imports: [
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './books.html',
  styleUrl: './books.scss',
})
export class Books implements OnInit {
  constructor(
    private bookService: BookService,
    private genreService: GenreService,
    private dialog: MatDialog,
  ) {}

  books = signal<Book[]>([]);
  genres = signal<Genre[]>([]);
  totalBooks = signal(0);
  currentPage = signal(1);
  pageSize = signal(10);
  loading = signal(false);
  error = signal('');
  searchControl = new FormControl('', { nonNullable: true });
  genreControl = new FormControl<number | null>(null);

  displayedColumns = ['title','authors','genres','isbn','editor','quantity','occupied','daily_price'];

  ngOnInit(): void {
    this.loadGenres();
    this.bindFilters();
    this.loadBooks();
  }

  loadBooks(page: number = 1): void {
    this.loading.set(true);
    this.error.set('');

    this.bookService.getBooks(page, {
      search: this.searchControl.value,
      genreId: this.genreControl.value,
    }).subscribe({
      next: (response) => {
        this.books.set(response.books.data);
        this.totalBooks.set(response.books.total);
        this.currentPage.set(response.books.current_page);
        this.pageSize.set(response.books.per_page);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Impossibile caricare i libri');
        this.loading.set(false);
      },
    });
  }

  changePage(event: PageEvent): void {
    this.loadBooks(event.pageIndex + 1);
  }

  clearFilters(): void {
    this.searchControl.setValue('', { emitEvent: false });
    this.genreControl.setValue(null, { emitEvent: false });
    this.loadBooks(1);
  }

  createBook(): void {
    this.openDialog(null);
  }

  createAuthor(): void {
    this.dialog.open(AuthorDialog, {
      width: '420px',
    });
  }

  editBook(book: Book): void {
    this.openDialog(book.id);
  }

  private openDialog(bookId: number | null): void {
    const dialogRef = this.dialog.open(BookDialog, {
      width: '600px',
      data: bookId,
    });

    dialogRef.afterClosed().subscribe((saved) => {
      if (saved) {
        this.loadBooks(this.currentPage());
      }
    });
  }

  private loadGenres(): void {
    this.genreService.getGenres().subscribe({
      next: (response) => {
        this.genres.set(response.genres);
      },
      error: () => {
        this.error.set('Impossibile caricare i generi');
      },
    });
  }

  private bindFilters(): void {
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.loadBooks(1);
      });

    this.genreControl.valueChanges.subscribe(() => {
      this.loadBooks(1);
    });
  }
}
