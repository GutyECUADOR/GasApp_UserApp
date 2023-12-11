import React, { createContext, useReducer, useEffect} from 'react';
import { Location } from '../interfaces/Location';
import { LocationReducer, LocationState } from './LocationReducer';
import Geolocation from '@react-native-community/geolocation';

/* Estado Inicial */
export const locationInitialState: LocationState = {
    hasLocation: false,
    address: 'Ubicación Actual desde Context',
    location: {latitude: 0, longitude: 0},
    deliveryLocation: {latitude: 0, longitude: 0}
}

/* Interface que espone que metodos y propiedades expondra el context */
export interface LocationContextProps {
    locationState: LocationState;
    getCurrentLocation: () => Promise<Location>;
    getAddress: () => void;
}

export const LocationContext = createContext({} as LocationContextProps);


/* Exponer el Proveedor de informacion */
export const LocationProvider = ({ children }: any) => {

    const [state, dispatch] = useReducer(LocationReducer, locationInitialState)

    const getCurrentLocation = (): Promise<Location> => {
        return new Promise( (resolve, reject) => {
        
        });
    }
    
    const getAddress = () => {
        Geocoder.from(state.location)
        .then(json => {
          const addressFormatted = json.results[0].formatted_address;
          //setAddress(addressFormatted);
        })
        .catch(error => console.warn(error));
    }

    return (
        <LocationContext.Provider value={{
            locationState: locationInitialState,
            getCurrentLocation,
            getAddress
        }}>
            { children }
        </LocationContext.Provider>
    )
}