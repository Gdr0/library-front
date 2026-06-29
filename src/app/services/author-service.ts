import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Author } from './book-service';

export interface AuthorPayload {
  last_name: string;
  name: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthorService {
  private apiUrl = `${environment.apiUrl}/authors`;

  constructor(private _http: HttpClient) {}

  getAuthors(search: string = ''): Observable<{ authors: Author[] }> {
    const params = new HttpParams().set('search', search);

    return this._http.get<{ authors: Author[] }>(this.apiUrl, { params });
  }

  createAuthor(payload: AuthorPayload): Observable<{ author: Author; message: string }> {
    return this._http.post<{ author: Author; message: string }>(this.apiUrl, payload);
  }
}
