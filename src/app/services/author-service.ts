import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Author } from './book-service';

@Injectable({
  providedIn: 'root',
})
export class AuthorService {
  private apiUrl = `${environment.apiUrl}/authors`;

  constructor(private _http: HttpClient) {}

  getAuthors(search: string = ''): Observable<{ authors: Author[] }> {
    const params = new HttpParams().set('search', search);

    return this._http.get<{ authors: Author[] }>(
      `${this.apiUrl}/getAuthors`,
      { params },
    );
  }
}
