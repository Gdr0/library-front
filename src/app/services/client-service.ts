import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Client {
  id: number;
  name: string;
  last_name: string;
  phone_number: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface PaginatedClients {
  current_page: number;
  data: Client[];
  last_page: number;
  per_page: number;
  total: number;
}

export interface ClientsResponse {
  clients: PaginatedClients;
}

export type ClientPayload = Omit<
  Client,
  'id' | 'created_at' | 'updated_at'
> & {
  id?: number;
};

@Injectable({
  providedIn: 'root',
})
export class ClientService {
  private apiUrl = `${environment.apiUrl}/client`;

  constructor(
    private _http: HttpClient,
  ) {}

  getClients(page: number = 1): Observable<ClientsResponse> {
    const params = new HttpParams().set('page', page);

    return this._http.get<ClientsResponse>(
      `${this.apiUrl}/clientIndex`,
      { params },
    );
  }

  getClientById(id: number): Observable<{ client: Client }> {
    return this._http.get<{ client: Client }>(
      `${this.apiUrl}/getClientById/${id}`,
    );
  }

  createOrUpdateClient(
    payload: ClientPayload,
  ): Observable<{ client: Client; message: string }> {
    return this._http.post<{ client: Client; message: string }>(
      `${this.apiUrl}/CreateOrUpdateClient`,
      payload,
    );
  }
}
