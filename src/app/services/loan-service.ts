import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Client } from './client-service';

export interface LoanStatus {
  id: number;
  status: string;
  label: string;
}

export interface DocumentType {
  id: number;
  name: string;
}

export interface LoanBookAuthor {
  id: number;
  name: string;
  last_name: string;
}

export interface LoanBook {
  id: number;
  title: string;
  daily_price: number;
  authors: LoanBookAuthor[];
}

export interface BookLoanReturn {
  id: number;
  book_loan_id: number;
  returned_quantity: number;
  returned_at: string;
  total_at_return: number;
}

export interface BookLoan {
  id: number;
  loan_id: number;
  book_id: number;
  unit_price: number;
  quantity: number;
  returned_books_quantity: number;
  total_at_return: number;
  book: LoanBook;
  returns: BookLoanReturn[];
}

export interface Loan {
  id: number;
  status_id: number;
  client_id: number;
  document_type_id: number;
  document_number: string;
  started_at: string;
  expiring_at: string;
  closed_at: string | null;
  final_price: number;
  loan_books_quantity: number;
  returned_books_quantity: number;
  total_at_return: number;
  client: Client;
  status: LoanStatus;
  document_type: DocumentType;
  book_loans: BookLoan[];
}

export interface PaginatedLoans {
  current_page: number;
  data: Loan[];
  last_page: number;
  per_page: number;
  total: number;
}

export interface LoansResponse {
  loans: PaginatedLoans;
}

export interface LoanDetailResponse {
  loan: Loan;
}

export interface LoanBookPayload {
  book_id: number;
  quantity: number;
}

export interface LoanCreatePayload {
  client_id?: number;
  client: {
    name: string;
    last_name: string;
    phone_number: string;
    email: string;
  };
  document_type_id: number;
  document_number: string;
  expiring_at: string;
  books: LoanBookPayload[];
}

export interface LoanReturnBookPayload {
  book_id: number;
  returned_quantity: number;
}

export interface LoanReturnPayload {
  id_loan: number;
  returned_at: string;
  books: LoanReturnBookPayload[];
}

@Injectable({
  providedIn: 'root',
})
export class LoanService {
  private apiUrl = `${environment.apiUrl}/loans`;

  constructor(
    private _http: HttpClient,
  ) {}

  getLoans(page: number = 1): Observable<LoansResponse> {
    const params = new HttpParams().set('page', page);

    return this._http.get<LoansResponse>(this.apiUrl, { params });
  }

  getLoanDetail(id: number): Observable<LoanDetailResponse> {
    return this._http.get<LoanDetailResponse>(`${this.apiUrl}/${id}`);
  }

  createLoan(
    payload: LoanCreatePayload,
  ): Observable<{ loan: Loan; message: string }> {
    return this._http.post<{ loan: Loan; message: string }>(this.apiUrl, payload);
  }

  returnBookOrLoan(
    payload: LoanReturnPayload,
  ): Observable<{ loan: Loan; message: string }> {
    return this._http.patch<{ loan: Loan; message: string }>(
      `${this.apiUrl}/return`,
      payload,
    );
  }
}
