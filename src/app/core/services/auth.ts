
import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import {catchError,finalize,map,Observable,of,shareReplay,switchMap,tap,} from 'rxjs';
import { environment } from '../../../environments/environment';
import {AuthUser,LoginRequest,LoginResponse} from '../models/auth.models';
import { TokenService } from './token';

@Injectable({

  providedIn: 'root',
})

export class AuthService {
  // AuthUser -> se autenticato oppure null
  private readonly userState = signal<AuthUser | null>(null);

  // richiesta di refresh in corso? altrimenti null
  private refreshRequest: Observable<LoginResponse> | null = null;

  // stato utente in lettura
  readonly user = this.userState.asReadonly();


  constructor(
    private readonly http: HttpClient,
    private readonly tokenService: TokenService,
  ) {}

  // Riceve email e password e restituisce un Observable con la risposta del login.
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/login`, credentials)
      .pipe(
        // Osserva la risposta senza modificarla.
        tap((response) => {
          // Estrae access_token dalla risposta e lo salva tramite TokenService.
          this.tokenService.save(response.access_token);
        }),

        // Dopo aver salvato il JWT, sostituisce il flusso corrente con la chiamata a /me.
        switchMap((response) =>
          // Chiama /me per recuperare e memorizzare l'utente autenticato.
          this.me().pipe(
            // Ignora il valore restituito da /me e rimette nel flusso la risposta originale del login.
            map(() => response),
          ),
        ),
      );
  }

  // Recupera dal backend l'utente associato al JWT corrente.
  me(): Observable<AuthUser> {
    return this.http.get<AuthUser>(`${environment.apiUrl}/me`)
      .pipe(
        tap((user) =>
          this.userState.set(user),
        ),
      );
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/logout`, {})
      .pipe(
        // Esegue clearSession quando la richiesta termina, anche se Laravel restituisce un errore.
        finalize(() =>
          // Elimina token e utente dalla memoria locale.
          this.clearSession(),
        ),
      );
  }

  // Richiede un nuovo JWT usando quello corrente.
  refreshToken(): Observable<LoginResponse> {
    // Controlla se esiste già una richiesta di refresh in corso.
    if (this.refreshRequest) {
      // Riutilizza la richiesta esistente per evitare più refresh contemporanei.
      return this.refreshRequest;
    }

    // Crea e memorizza una nuova richiesta di refresh.
    this.refreshRequest = this.http
      .post<LoginResponse>(`${environment.apiUrl}/refresh`, {}).pipe(
        tap((response) => {
          this.tokenService.save(response.access_token);
        }),
        finalize(() => {
          // Segnala che non esiste più una richiesta di refresh in corso.
          this.refreshRequest = null;
        }),
        shareReplay({
          bufferSize: 1,
          refCount: false,
        }),
      );

    // Restituisce la richiesta appena creata o condivisa.
    return this.refreshRequest;
  }

  // Prova a ripristinare l'utente quando l'applicazione viene caricata o ricaricata.
  restoreSession(): Observable<void> {
    // Legge il token e controlla se è assente.
    if (!this.tokenService.get()) {
      // Se non esiste un token, restituisce un Observable già completato senza fare richieste.
      return of(undefined);
    }

    // Se il token esiste, prova a recuperare l'utente autenticato.
    return this.me().pipe(
      // Ignora AuthUser perché l'initializer deve solo sapere che il controllo è terminato.
      map(() => undefined),

      // Intercetta eventuali errori prodotti dal recupero dell'utente o dal refresh.
      catchError(() => {
        // Se la sessione non è valida, elimina token e utente locali.
        this.clearSession();

        // Restituisce un Observable completato per non bloccare l'avvio dell'applicazione.
        return of(undefined);
      }),
    );
  }


  clearSession(): void {
    this.tokenService.remove();
    this.userState.set(null);
  }
}
