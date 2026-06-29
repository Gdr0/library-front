import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { DocumentType } from './loan-service';

@Injectable({
  providedIn: 'root',
})
export class DocumentTypeService {
  private apiUrl = `${environment.apiUrl}/document-types`;

  constructor(
    private _http: HttpClient,
  ) {}

  getDocumentTypes(): Observable<{ documentTypes: DocumentType[] }> {
    return this._http.get<{ documentTypes: DocumentType[] }>(this.apiUrl);
  }
}
