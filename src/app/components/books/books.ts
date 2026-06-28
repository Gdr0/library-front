import { Component, inject, OnInit, signal } from '@angular/core';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { Book, BookService } from '../../services/book-service';

@Component({
  selector: 'app-books',
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './books.html',
  styleUrl: './books.scss',
})
export class Books implements OnInit {
  private bookService = inject(BookService);

  books = signal<Book[]>([]);
  totalBooks = signal(0);
  currentPage = signal(1);
  pageSize = signal(10);
  loading = signal(false);
  error = signal('');

  displayedColumns = ['title','authors','isbn','editor','quantity',];

  ngOnInit(): void {
    this.loadBooks();
  }

  loadBooks(page: number = 1): void {
    this.loading.set(true);
    this.error.set('');

    this.bookService.getBooks(page).subscribe({
      next: (response) => {
        console.log(response);
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
}
