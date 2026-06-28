import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AuthService } from '../core/services/auth';

export interface Author {
  id: number;
  name: string;
  last_name: string;
}

export interface Book {
  id: number;
  editor_id: number;
  title: string;
  isbn: string;
  synopsis: string;
  total_quantity: number;
  created_at: string;
  updated_at: string;
  authors: Author[];
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

}
