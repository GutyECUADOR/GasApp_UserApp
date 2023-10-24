import React, { createContext, useReducer} from 'react';
import { LoginDataForm, LoginResponse, User } from '../interfaces/appInterfaces';
import { authReducer, AuthState } from './authReducer';
import gasAPI from '../api/gasAPI';

type AuthContextProps = {
    errorMessage: string;
    token: string | null;
    user: User | null;
    status: 'checking' | 'authenticated' | 'not-authenticated'
    signIn: ( loginDataForm: LoginDataForm) => void;
    signUp: () => void;
    logOut: () => void;
    removeError: () => void;
}

const authInitialState: AuthState = {
    status: 'checking',
    token: null,
    user: null,
    errorMessage: ''
}

export const AuthContext = createContext({} as AuthContextProps);


export const AuthProvider = ({ children }:any) => {

    const [state, dispatch] = useReducer(authReducer, authInitialState)

    const signIn = async ( {email, password}: LoginDataForm) => {
        
        try {
            const { data } = await gasAPI.post('/api/login', {email, password }, {
                headers: { 
                    'Accept': 'application/json', 
                    'Content-Type': 'application/json'
                  }    
                });
            
            dispatch({
                type: 'signUp',
                payload: {
                    token: data.access_token,
                    user: data.user
                }
            })

            console.log(data);
        } catch (error: any) {
            dispatch({ 
                type: 'addError', 
                payload: error.response.data.msg || 'Información incorrecta'
            })
        }

    };
    const signUp = () => {};
    const logOut = () => {};
    const removeError = () => {
        dispatch({ type: 'removeError' });
    };


    return (
        <AuthContext.Provider value={{
            ...state,
            signUp,
            signIn,
            logOut,
            removeError,
        }}>
            { children }
        </AuthContext.Provider>
    )
} 