import React, { createContext, useReducer} from 'react';
import { LoginDataForm, LoginResponse, User } from '../interfaces/appInterfaces';
import { authReducer, AuthState } from './authReducer';
import gasAPI from '../api/gasAPI';

type AuthContextProps = {
    errorMessage: string;
    token: string | null;
    user: User | null;
    status: 'checking' | 'Authenticated' | 'NotAuthenticated'
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
       
            const response = await gasAPI.post('/api/login', {email, password }, {
                headers: { 
                    'Accept': 'application/json', 
                    'Content-Type': 'application/json'
                  }    
                }).then(resp => {
                    console.log(resp.data);
                }).catch(function (error) {
                    console.log(error.response.data);
                });

        
        return;
    };
    const signUp = () => {};
    const logOut = () => {};
    const removeError = () => {};


    return <AuthContext.Provider value={{
        ...state,
        signUp,
        signIn,
        logOut,
        removeError

    }}>
        { children }
    </AuthContext.Provider>
} 