import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Genre } from './book-service';

@Injectable({
  providedIn: 'root',
})
export class GenreService {
  private apiUrl = `${environment.apiUrl}/genres`;

  constructor(private _http: HttpClient) {}

  getGenres(): Observable<{ genres: Genre[] }> {
    return this._http.get<{ genres: Genre[] }>(this.apiUrl);
  }
}
