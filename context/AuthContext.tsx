import React, { createContext, useReducer} from 'react';
import { LoginData, RegisterData, LoginResponse, User } from '../interfaces/appInterfaces';
import { authReducer, AuthState } from './authReducer';
import gasAPI from '../api/gasAPI';

type AuthContextProps = {
    errorMessage: string;
    token: string | null;
    user: User | null;
    status: 'checking' | 'authenticated' | 'not-authenticated'
    signIn: ( loginData: LoginData) => void;
    signUp: ( registerData: RegisterData ) => void;
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

    const signIn = async ( {email, password}: LoginData) => {
        
        try {
            const { data } = await gasAPI.post<LoginResponse>('/api/login', {email, password }, {
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
            console.log(error.response.data);
            dispatch({ 
                type: 'addError', 
                payload: error.response.data.message || 'Información incorrecta'
            })
        }

    };
   
    const signUp = async( { name, phone, email, password }: RegisterData ) => {

        try {
         
            const { data } = await gasAPI.post<LoginResponse>('/api/register', { name, phone, email, password,  } );
            dispatch({ 
                type: 'signUp',
                payload: {
                    token: data.access_token,
                    user: data.user
                }
            });

            console.log(data);
            //await AsyncStorage.setItem('token', data.token );

        } catch (error: any) {
            dispatch({ 
                type: 'addError', 
                payload: error.response.data.errors[0].msg || 'Revise la información'
            });
        }

    };

    const logOut = async() => {
        //await AsyncStorage.removeItem('token');
        dispatch({ type: 'logout' });
    };
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