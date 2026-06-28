// tipi  dati inviati e ricevuti durante auth
export interface LoginRequest {
    email: string;
    password : string
}


export interface LoginResponse {
    access_token : string;
    token_type: 'bearer';
    expires_in: number;
}

// utente restituito da /me
export interface AuthUser {
    id:number;
    name:string;
    email:string;
}