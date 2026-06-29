import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
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
  'id' | 'created_at' | 'updated_at' | 'authors' | 'editor'
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
  
  private apiUrl = `${environment.apiUrl}/books`
  

  getBooks(page: number = 1): Observable<BooksResponse> {
    const params = new HttpParams().set('page', page);

    return this._http.get<BooksResponse>(`${this.apiUrl}/bookIndex`, { params });
  }

  getBookById(id: number): Observable<{ book: Book }> {
    return this._http.get<{ book: Book }>(`${this.apiUrl}/getBookById/${id}`);
  }

  createOrUpdateBooks(payload:BookPayload):Observable<{ book: Book; message: string }>{
    return this._http.post<{book: Book; message: string}>(`${this.apiUrl}/createOrUpdateBooks`, payload);
  }

}
