import React, { createContext, useReducer, useEffect} from 'react';
import { LoginData, RegisterData, LoginResponse, User, Comentario, ComentarioResponse, PedidoData, PedidoResponse } from '../interfaces/appInterfaces';
import { authReducer, AuthState } from './authReducer';
import gasAPI from '../api/gasAPI';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AuthContextProps = {
    errorMessage: string;
    errorRegisterMessage: string;
    token: string | null;
    user: User | null;
    status: 'checking' | 'authenticated' | 'not-authenticated'
    signIn: ( loginData: LoginData) => void;
    signUp: ( registerData: RegisterData ) => void;
    logOut: () => void;
    removeError: () => void;
    removeRegisterError : () => void;
    registerPedidoFinalizado : ( pedidoData: PedidoData) => Promise<void>;
    sendComentario : ( comentario: Comentario) => Promise<void>;
}

const authInitialState: AuthState = {
    status: 'checking',
    token: null,
    user: null,
    errorMessage: '',
    errorRegisterMessage: ''
}

export const AuthContext = createContext({} as AuthContextProps);


export const AuthProvider = ({ children }:any) => {

    const [state, dispatch] = useReducer(authReducer, authInitialState)

    useEffect(() => {
        checkToken();
    
    }, [])

    const checkToken = async () =>{
        const token = await AsyncStorage.getItem('token');
        if (!token) {
            return dispatch({ type: 'notAuthenticated' })
        }

        console.log('verificatoken', token);

        try {
            const { data } = await gasAPI.get('/api/checktoken', {
                headers: {
                    'Accept': 'application/json', 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
           
            dispatch({
                type: 'signUp',
                payload: {
                    token: data.access_token,
                    user: data.user
                }
            })

            console.log('checkToken', data);
            
        } catch (error: any) {
            console.log(error.response.data);
            dispatch({ 
                type: 'addError', 
                payload: error.response.data.message || 'Token incorrecto o no válido'
            })
        }
       

      


    }
    
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

            await AsyncStorage.setItem('token', data.access_token)
            console.log(data);

        } catch (error: any) {
            console.log(error.response.data);
            dispatch({ 
                type: 'addError', 
                payload: error.response.data.message || 'Información incorrecta'
            })
        }

    };
   
    const signUp = async( { name, phone, email, password, role }: RegisterData ) => {

        try {
            const { data } = await gasAPI.post<LoginResponse>('/api/register', { name, phone, email, password, role  } );
            dispatch({ 
                type: 'signUp',
                payload: {
                    token: data.access_token,
                    user: data.user
                }
            });

            await AsyncStorage.setItem('token', data.access_token)
            console.log(data);

        } catch (error: any) {
            console.log(error.response.data);
            dispatch({ 
                type: 'addRegisterError', 
                payload: error.response.data.message || 'Información incorrecta'
            });
        }

    };

    const logOut = async() => {
        await AsyncStorage.removeItem('token');
        dispatch({ type: 'logout' });
    };

    const removeError = () => {
        dispatch({ type: 'removeError' });
    };

    const removeRegisterError = () => {
        dispatch({ type: 'removeRegisterError' });
    };

    /* Registrar pedido finalziado en DB local */
    const registerPedidoFinalizado = async ( {id_delivery, id_usuario, address, distance, payment_method_id, status}: PedidoData) => {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
            return dispatch({ type: 'notAuthenticated' })
        }

        try {
            const { data } = await gasAPI.post<PedidoResponse>('/api/pedido', {id_delivery, id_usuario, address, distance, payment_method_id, status}, {
                headers: {
                    'Accept': 'application/json', 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }   
                });
            
        } catch (error: any) {
            console.log(error.response.data);
        }

    };

    const sendComentario = async ( {id_usuario, comentario}: Comentario) => {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
            return dispatch({ type: 'notAuthenticated' })
        }
        
        try {
            const { data } = await gasAPI.post<ComentarioResponse>('/api/comentario', {id_usuario, comentario}, {
                headers: {
                    'Accept': 'application/json', 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                } 
                });
            
           
            console.log(data);

        } catch (error: any) {
            console.log(error.response.data);
        }

    };


    return (
        <AuthContext.Provider value={{
            ...state,
            signUp,
            signIn,
            logOut,
            removeRegisterError,
            removeError,
            registerPedidoFinalizado,
            sendComentario
        }}>
            { children }
        </AuthContext.Provider>
    )
} 