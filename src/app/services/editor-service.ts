import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Editor } from './book-service';

@Injectable({
  providedIn: 'root',
})
export class EditorService {
  private apiUrl = `${environment.apiUrl}/editors`;

  constructor(private _http: HttpClient) {}

  getEditors(search: string = ''): Observable<{ editors: Editor[] }> {
    const params = new HttpParams().set('search', search);

    return this._http.get<{ editors: Editor[] }>(
      `${this.apiUrl}/getEditors`,
      { params },
    );
  }
}
