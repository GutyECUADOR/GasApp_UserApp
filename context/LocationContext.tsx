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
    getAddress: () => Promise<void>;
    setlocation: (location: Location) => void;
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

    const setlocation = (location: Location) => {
        dispatch({type: 'setLocation', payload: {location}})
    }

    return (
        <LocationContext.Provider value={{
            locationState,
            getCurrentLocation,
            getAddress,
            setlocation
        }}>
            { children }
        </LocationContext.Provider>
    )
}