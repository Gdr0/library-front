import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';

export interface Author {
  id: number;
  name: string;
  last_name: string;
}

export interface Editor {
  id: number;
  name: string;
}

export interface Book {
  id: number;
  editor_id: number;
  title: string;
  isbn: string;
  synopsis: string;
  daily_price: number;
  total_quantity: number;
  occupied_quantity: number;
  created_at: string;
  updated_at: string;
  authors: Author[];
  editor: Editor;
}


export interface PaginatedBooks {
  current_page: number;
  data: Book[];
  last_page: number;
  per_page: number;
  total: number;
}

export interface BooksResponse {
  books: PaginatedBooks;
}

export type BookPayload = Omit<
  Book,
  'id' | 'created_at' | 'updated_at' | 'authors' | 'editor' | 'occupied_quantity'
> & {
  id?: number;
  authors: number[];
};

@Injectable({
  providedIn: 'root',
})
export class BookService {
  constructor (
    private _http: HttpClient,
  ){}

  private apiUrl = `${environment.apiUrl}/books`;

  getBooks(page: number = 1): Observable<BooksResponse> {
    const params = new HttpParams().set('page', page);

    return this._http.get<BooksResponse>(this.apiUrl, { params });
  }

  getAllBooks(): Observable<Book[]> {
    return this.getBooks(1).pipe(
      switchMap((response) => {
        if (response.books.last_page <= 1) {
          return of([response]);
        }

        const requests: Observable<BooksResponse>[] = [];

        for (let page = 2; page <= response.books.last_page; page++) {
          requests.push(this.getBooks(page));
        }

        return forkJoin([of(response), ...requests]);
      }),
      map((responses) => responses.flatMap((response) => response.books.data)),
    );
  }

  getBookById(id: number): Observable<{ book: Book }> {
    return this._http.get<{ book: Book }>(`${this.apiUrl}/${id}`);
  }

  saveBook(payload: BookPayload): Observable<{ book: Book; message: string }> {
    return this._http.post<{ book: Book; message: string }>(this.apiUrl, payload);
  }

}
