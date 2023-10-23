import { User } from "../interfaces/appInterfaces";

export interface AuthState {
    errorMessage: string;
    token: string | null;
    user: User | null;
    status: 'checking' | 'Authenticated' | 'NotAuthenticated'
}

type AuthAction = | 
    { type: 'signUp', payload: { token: string, user: User }}
    | { type: 'addError', payload: string }
    | { type: 'removeError'}
    | { type: 'notAuthenticated'}
    | { type: 'logout'}


export const authReducer = ( state: AuthState, action: AuthAction) : AuthState => {
    switch (action.type) {
        case 'addError':
            return {
                ...state,
                user: null,
                status: 'NotAuthenticated',
                token: null,
                errorMessage: action.payload
            }
            break;

        case 'removeError':
            return {
                ...state,
                errorMessage : ''
            }

        case 'signUp':
            return {
                ...state,
                errorMessage: '',
                status: 'Authenticated',
                token: action.payload.token,
                user: action.payload.user
            }

        case 'logout':
        case 'notAuthenticated':
            return {
                ...state,
                errorMessage: '',
                status: 'NotAuthenticated',
                token: null,
                user: null
            }

       
        default:
            return state;
            break;
    } 
}