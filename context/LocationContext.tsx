import React, { createContext, useReducer, useEffect} from 'react';
import { Location } from '../interfaces/Location';
import { LocationReducer, LocationState } from './LocationReducer';
import Geolocation from '@react-native-community/geolocation';
import Geocoder from 'react-native-geocoding';
import {Key} from '../constants/key';

export class LocationClass implements Location {
    latitude: number;
    longitude: number;

    constructor(latitude: number, longitude: number) {
        this.latitude = latitude;
        this.longitude = longitude;
    }
   

}

/* Estado Inicial */
export const locationInitialState: LocationState = {
    hasLocation: false,
    address: 'Mi Ubicación Actual',
    location: new LocationClass(0, 0),
    deliveryLocation: new LocationClass(-0.203525, -78.483344),
    isPedidoActivo: false,
    amount: 0,
    distance: 0,
    duration: 0
   
}

/* Interface que espone que metodos y propiedades expondra el context */
export interface LocationContextProps {
    locationState: LocationState;
    getCurrentLocation: () => Promise<Location>;
    getAddress: () => Promise<void>;
    setLocation: (location: Location) => void;
    setDeliveryLocation: (location: Location) => void;
    setHasLocation: (hasLocation: boolean) => void;
    setHasPedidoActivo: (hasLocation: boolean) => void;
    setAmount: (amount: number) => void;
    setDistance: (distance: number) => void;
    setDuration: (duration: number) => void;
}

export const LocationContext = createContext({} as LocationContextProps);


/* Exponer el Proveedor de informacion */
export const LocationProvider = ({ children }: any) => {

    const [locationState, dispatch] = useReducer(LocationReducer, locationInitialState)

    const getCurrentLocation = (): Promise<Location> => {
        return new Promise( (resolve, reject) => {
            Geolocation.getCurrentPosition(
              info => {
                const location: Location = {
                    latitude: info.coords.latitude,
                    longitude: info.coords.longitude
                }
                dispatch({type: 'setLocation', payload: {location}})
                resolve(location);
              },
              error => { reject(error)},{
                enableHighAccuracy: true
              });
          });
    }
    
    const getAddress = () => {
        const address = Geocoder.from(locationState.location)
        .then(json => {
          const addressFormatted = json.results[0].formatted_address;
          dispatch({type: 'setAddress', payload: addressFormatted})
        })
        .catch(error => console.warn(error));
        return address;
    }

    const setLocation = (location: Location) => {
        dispatch({type: 'setLocation', payload: {location}})
    }

    const setDeliveryLocation = (location: Location) => {
        dispatch({type: 'setDeliverylocation', payload: {location}})
    }

    const setHasLocation = (hasLocation: boolean) => {
        dispatch({type: 'sethasLocation', payload: hasLocation})
    }

    const setHasPedidoActivo = (hasLocation: boolean) => {
        dispatch({type: 'setHasPedidoActivo', payload: hasLocation})
    }

    const setAmount = (amount: number) => {
        dispatch({type: 'setAmount', payload: amount})
    }

    const setDistance = (amount: number) => {
        dispatch({type: 'setDistance', payload: amount})
    }

    const setDuration = (amount: number) => {
        dispatch({type: 'setDuration', payload: amount})
    }

    useEffect(() => {
        Geocoder.init(Key.apiKey); // TODO - use a valid API key from ConfigFILE
        getCurrentLocation().then( location => {
          setHasLocation(true);
        });
    }, [])

    useEffect(() => {
        getAddress()
    }, [locationState.location])

    return (
        <LocationContext.Provider value={{
            locationState,
            setLocation,
            setDeliveryLocation,
            setHasLocation,
            setHasPedidoActivo,
            getCurrentLocation,
            getAddress,
            setAmount,
            setDistance,
            setDuration
        }}>
            { children }
        </LocationContext.Provider>
    )
}