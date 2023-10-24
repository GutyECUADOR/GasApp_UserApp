// Generated by https://quicktype.io

export interface LoginData {
    email: string,
    password: string
}


export interface RegisterData {
    name: string, 
    phone: string, 
    email: string, 
    password: string
}

export interface LoginResponse {
    user:         User;
    access_token: string;
    token_type:   string;
}

export interface User {
    id:                number;
    name:              string;
    email:             string;
    email_verified_at: null;
    role:              string;
    phone:             string;
    avatar:            string;
    created_at:        string;
    updated_at:        string;
}
